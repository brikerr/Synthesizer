import { useState, useCallback, useRef, useEffect } from 'react';

const PASSCODE = '400012';
const LEN = PASSCODE.length;
const EMPTY = () => Array(LEN).fill('');

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [digits, setDigits] = useState<string[]>(EMPTY);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    setError(false);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < LEN - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && index === LEN - 1) {
      const code = next.join('');
      if (code === PASSCODE) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(EMPTY());
          setError(false);
          inputsRef.current[0]?.focus();
        }, 600);
      }
    }
  }, [digits]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!pasted) return;

    const next = EMPTY();
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);

    if (pasted.length === LEN) {
      if (pasted === PASSCODE) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(EMPTY());
          setError(false);
          inputsRef.current[0]?.focus();
        }, 600);
      }
    } else {
      inputsRef.current[pasted.length]?.focus();
    }
  }, []);

  if (unlocked) return <>{children}</>;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      zIndex: 99999,
      fontFamily: "'Roboto Mono', 'SF Mono', monospace",
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#666',
        }}>
          Enter Passcode
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: 48,
                height: 60,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "'Roboto Mono', monospace",
                background: error ? 'rgba(255,60,60,0.12)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${error ? '#ff3c3c' : d ? '#888' : '#333'}`,
                borderRadius: 8,
                color: '#eee',
                outline: 'none',
                caretColor: 'transparent',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = error ? '#ff3c3c' : '#aaa';
              }}
              onBlur={e => {
                e.target.style.borderColor = error ? '#ff3c3c' : d ? '#888' : '#333';
              }}
            />
          ))}
        </div>

        <div style={{
          fontSize: 11,
          color: error ? '#ff3c3c' : 'transparent',
          transition: 'color 0.2s',
          height: 16,
        }}>
          Incorrect passcode
        </div>
      </div>
    </div>
  );
}
