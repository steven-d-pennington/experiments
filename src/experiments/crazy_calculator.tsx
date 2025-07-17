import React, { useState } from 'react';

const buttons = [
  '7', '8', '9', '/',
  '4', '5', '6', '*',
  '1', '2', '3', '-',
  '0', 'C', '=', '+',
];

function toRoman(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '🤯';
  if (num === 0) return 'nulla';
  if (num < 0) return '-' + toRoman(-num);
  const roman: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let res = '';
  for (const [val, sym] of roman) {
    while (num >= val) {
      res += sym;
      num -= val;
    }
  }
  return res;
}

function randomEffect() {
  const effects = [
    () => alert('🤪 Crazy Calculation!'),
    () => document.body.style.background = `hsl(${Math.random()*360},100%,95%)`,
    () => window.navigator.vibrate && window.navigator.vibrate(100),
    () => {},
  ];
  effects[Math.floor(Math.random()*effects.length)]();
}

const CrazyCalculator: React.FC = () => {
  const [expr, setExpr] = useState('');
  const [roman, setRoman] = useState('');
  const [crazy, setCrazy] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);

  function handleClick(val: string) {
    if (val === 'C') {
      setExpr('');
      setRoman('');
      setCrazy(false);
      setTooLarge(false);
      return;
    }
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        let result = eval(expr.replace(/[^0-9+\-*/.]/g, ''));
        if (Math.random() < 0.2) {
          randomEffect();
          result += Math.floor(Math.random()*10-5); // sometimes wrong on purpose
          setCrazy(true);
        } else {
          setCrazy(false);
        }
        const romanStr = toRoman(Math.round(result));
        setTooLarge(romanStr.length > 30);
        setRoman(romanStr);
      } catch {
        setRoman('🤯');
        setTooLarge(false);
      }
      return;
    }
    setExpr(e => e + val);
  }

  return (
    <div style={{ maxWidth: 340, margin: '0 auto', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h1>🧮 Crazy Calculator</h1>
      <div style={{ fontSize: 24, minHeight: 32, marginBottom: 8, color: crazy ? 'var(--color-accent)' : 'var(--color-primary)' }}>{expr || '0'}</div>
      <div
        style={{
          fontSize: '1.7em',
          minHeight: 40,
          color: 'var(--color-accent)',
          marginBottom: 12,
          maxWidth: 280,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          background: 'rgba(0,0,0,0.08)',
          borderRadius: 8,
          padding: '0.2em 0.5em',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        title={roman}
      >
        {roman}
      </div>
      {tooLarge && (
        <div style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 8 }}>
          Result is too large to display fully in Roman numerals!
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {buttons.map(b => (
          <button
            key={b}
            onClick={() => handleClick(b)}
            style={{ fontSize: 20, padding: '0.5em 0', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-surface)', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {b}
          </button>
        ))}
      </div>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>Answers are in Roman numerals. Sometimes the calculator gets a little... crazy!</p>
    </div>
  );
};

export default CrazyCalculator; 