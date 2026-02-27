import { Toolbar } from './components/Toolbar.tsx';
import { Rack } from './components/Rack.tsx';
import { Keyboard } from './components/Keyboard.tsx';
import { PasswordGate } from './components/PasswordGate.tsx';
export default function App() {
  return (
    <PasswordGate>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <Toolbar />
        <Rack />
        <Keyboard />
      </div>
    </PasswordGate>
  );
}
