import type { PortRef, SignalType } from '../../types/index.ts';
import { getModuleDefinition } from './port-registry.ts';
import { cableMonitor } from '../cable-monitor.ts';

interface ActiveConnection {
  id: string;
  source: PortRef;
  dest: PortRef;
  signalType: SignalType;
}

export class ConnectionManager {
  private connections = new Map<string, ActiveConnection>();
  private nodeMap: Map<string, AudioWorkletNode>;

  constructor(nodeMap: Map<string, AudioWorkletNode>) {
    this.nodeMap = nodeMap;
  }

  connect(id: string, source: PortRef, dest: PortRef): SignalType {
    const sourceNode = this.nodeMap.get(source.moduleId);
    const destNode = this.nodeMap.get(dest.moduleId);
    if (!sourceNode || !destNode) {
      throw new Error('Source or destination node not found');
    }

    const sourceModuleType = (sourceNode as any).__moduleType as string;
    const destModuleType = (destNode as any).__moduleType as string;
    const sourceDef = getModuleDefinition(sourceModuleType as any);
    const destDef = getModuleDefinition(destModuleType as any);

    const sourcePort = sourceDef.ports.find((p) => p.id === source.portId);
    const destPort = destDef.ports.find((p) => p.id === dest.portId);
    if (!sourcePort || !destPort) {
      throw new Error('Port not found');
    }
    if (sourcePort.direction !== 'output' || destPort.direction !== 'input') {
      throw new Error('Invalid connection direction');
    }

    sourceNode.connect(destNode, sourcePort.index, destPort.index);

    // Create AnalyserNode tap for signal visualization
    cableMonitor.tap(id, sourceNode, sourcePort.index);

    const conn: ActiveConnection = {
      id,
      source,
      dest,
      signalType: sourcePort.signal,
    };
    this.connections.set(id, conn);
    return sourcePort.signal;
  }

  disconnect(id: string): void {
    const conn = this.connections.get(id);
    if (!conn) return;

    const sourceNode = this.nodeMap.get(conn.source.moduleId);
    const destNode = this.nodeMap.get(conn.dest.moduleId);

    if (sourceNode && destNode) {
      const sourceModuleType = (sourceNode as any).__moduleType as string;
      const destModuleType = (destNode as any).__moduleType as string;
      const sourceDef = getModuleDefinition(sourceModuleType as any);
      const destDef = getModuleDefinition(destModuleType as any);
      const sourcePort = sourceDef.ports.find((p) => p.id === conn.source.portId);
      const destPort = destDef.ports.find((p) => p.id === conn.dest.portId);
      if (sourcePort && destPort) {
        try {
          sourceNode.disconnect(destNode, sourcePort.index, destPort.index);
        } catch {
          // Already disconnected
        }
      }
    }

    cableMonitor.untap(id);
    this.connections.delete(id);
  }

  disconnectAllForModule(moduleId: string): string[] {
    const toRemove: string[] = [];
    for (const [id, conn] of this.connections) {
      if (conn.source.moduleId === moduleId || conn.dest.moduleId === moduleId) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.disconnect(id);
    }
    return toRemove;
  }
}
