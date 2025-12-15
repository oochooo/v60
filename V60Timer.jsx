import { useState, useEffect, useRef } from 'react';

const recipes = {
  hot: {
    baseSteps: [
      { time: 0, instruction: "Pour for bloom", water: 60 },
      { time: 45, instruction: "First pour", water: 150 },
      { time: 75, instruction: "Second pour", water: 250 },
      { time: 105, instruction: "Third pour", water: 350 },
      { time: 135, instruction: "Final pour", water: 500 },
      { time: 210, instruction: "Serve", water: 500 },
    ],
    coffee: 30,
    water: 500,
    ice: 0,
    grind: "Medium-fine (filter ↔ aeropress)"
  },
  iced: {
    baseSteps: [
      { time: 0, instruction: "Pour for bloom", water: 90 },
      { time: 10, instruction: "Stir bloom", water: 90 },
      { time: 20, instruction: "Let bloom", water: 90 },
      { time: 45, instruction: "Pour the rest", water: 300 },
      { time: 60*2.5, instruction: "Swirl and serve on ice", water: 300 },
    ],
    coffee: 32.5,
    water: 300,
    ice: 200,
    grind: "Fine (toward aeropress)"
  }
};

function PillToggle({ options, value, onChange, colors }) {
  const selectedIndex = options.findIndex(o => o.value === value);
  
  return (
    <div style={{
      display: 'flex',
      background: '#333',
      borderRadius: 20,
      padding: 4,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 4,
        left: 4,
        width: `calc(${100 / options.length}% - 4px)`,
        height: 'calc(100% - 8px)',
        background: colors?.[value] || '#2563eb',
        borderRadius: 16,
        transition: 'transform 0.2s ease, background 0.2s ease',
        transform: `translateX(${selectedIndex * 100}%)`
      }} />
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderRadius: 16,
            padding: '8px 20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            position: 'relative',
            zIndex: 1,
            transition: 'color 0.2s'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({ value, onChange, label, unit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#888', fontSize: 14, width: 50 }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: '#333',
          border: 'none',
          outline: 'none',
          borderRadius: 8,
          padding: '8px 12px',
          color: 'white',
          fontSize: 14,
          width: 70,
          textAlign: 'right'
        }}
      />
      <span style={{ color: '#666', fontSize: 14 }}>{unit}</span>
    </div>
  );
}

export default function V60Timer() {
  const [mode, setMode] = useState('hot');
  const [multiplier, setMultiplier] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [flash, setFlash] = useState(true);
  const [coffee, setCoffee] = useState(recipes.hot.coffee * 0.5);
  const [water, setWater] = useState(recipes.hot.water * 0.5);
  const [ice, setIce] = useState(recipes.hot.ice * 0.5);
  const intervalRef = useRef(null);

  const recipe = recipes[mode];
  
  // Update values when mode or multiplier changes
  useEffect(() => {
    setCoffee(recipe.coffee * multiplier);
    setWater(recipe.water * multiplier);
    setIce(recipe.ice * multiplier);
  }, [mode, multiplier]);

  // Calculate scale factor based on water input vs base recipe
  const scaleFactor = water / (recipe.water * multiplier) || 1;
  const steps = recipe.baseSteps.map(s => ({ 
    ...s, 
    water: Math.round(s.water * multiplier * scaleFactor) 
  }));

  const lastStepTime = steps[steps.length - 1].time;
  const isComplete = isRunning && currentStepIndex === steps.length - 1 && seconds >= lastStepTime + 5;

  useEffect(() => {
    if (isComplete) {
      reset();
    }
  }, [isComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const flashInterval = setInterval(() => {
      setFlash(f => !f);
    }, 500);
    return () => clearInterval(flashInterval);
  }, [isRunning]);

  useEffect(() => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep && seconds >= nextStep.time) {
      setCurrentStepIndex(i => i + 1);
    }
  }, [seconds, currentStepIndex, steps]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const start = () => {
    setIsRunning(true);
    setSeconds(0);
    setCurrentStepIndex(0);
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
    setCurrentStepIndex(0);
    clearInterval(intervalRef.current);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui', 
      minHeight: '100vh',
      minWidth: '100vw',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(16px, 5vw, 40px)',
      background: '#1a1a1a',
      color: 'white',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      
      {!isRunning && (
        <>
          <h1 style={{ 
            fontWeight: 300, 
            fontSize: 'clamp(20px, 5vw, 24px)' 
          }}>
            James Hoffmann's V60 technique
          </h1>
          <p style={{ color: '#545454ff', fontSize: '9px', textAlign: 'center' }}>
            Perpetually free, but I'm more than happy if you want to buy me a coffee:
            <br />
            <span 
              onClick={() => navigator.clipboard.writeText('0x1b41104f73732a532fa95feb177360ffc8c21f3a')}
              style={{ 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginBottom: 16,
              }}
            >
              0x1b41104f73732a532fa95feb177360ffc8c21f3a (Ethereum / Arbitrum)
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ opacity: 0.6 }}
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </span>
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <PillToggle
              options={[
                { value: 'hot', label: '☕' },
                { value: 'iced', label: '🧊' }
              ]}
              value={mode}
              onChange={setMode}
              colors={{ hot: '#dc2626', iced: '#0891b2' }}
            />
            
            <PillToggle
              options={[
                { value: 0.5, label: '1/2' },
                { value: 1, label: '1' }
              ]}
              value={multiplier}
              onChange={setMultiplier}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <NumberInput label="Beans" value={coffee} onChange={setCoffee} unit="g" />
            <NumberInput label="Water" value={water} onChange={setWater} unit="g" />
            {mode === 'iced' && (
              <NumberInput label="Ice" value={ice} onChange={setIce} unit="g" />
            )}
          </div>

          <p style={{ color: '#666', fontSize: 'clamp(11px, 2.5vw, 12px)' }}>
            Grind: {recipe.grind}
          </p>
        </>
      )}

      <div style={{ 
        fontSize: 'clamp(80px, 25vw, 180px)', 
        fontWeight: 200,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: 'clamp(20px, 5vw, 40px)',
        marginTop: isRunning ? 'clamp(20px, 5vw, 40px)' : 10
      }}>
        {formatTime(seconds)}
      </div>

      <div style={{ marginBottom: 'clamp(20px, 5vw, 40px)' }}>
        {!isRunning ? (
          <button 
            onClick={start}
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(40px, 10vw, 64px)',
              fontSize: 'clamp(18px, 4vw, 24px)',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Start
          </button>
        ) : (
          <button 
            onClick={reset}
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(40px, 10vw, 64px)',
              fontSize: 'clamp(18px, 4vw, 24px)',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ 
        width: '100%',
        maxWidth: 'min(400px, 100%)',
        borderTop: '1px solid #333',
        paddingTop: 'clamp(16px, 4vw, 24px)',
        flex: 1
      }}>
        {steps.map((step, i) => {
          const isDone = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          
          return (
            <div 
              key={i}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: 'clamp(8px, 2vw, 12px) 0',
                borderBottom: '1px solid #262626',
                opacity: isDone ? 0.4 : isCurrent ? (isRunning && flash ? 1 : 0.5) : 0.6,
                background: isCurrent && isRunning ? (flash ? (mode === 'iced' ? 'rgba(8,145,178,0.1)' : 'rgba(37,99,235,0.1)') : 'transparent') : 'transparent',
                borderRadius: 4,
                transition: 'opacity 0.2s, background 0.2s'
              }}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isCurrent ? (mode === 'iced' ? '#0891b2' : '#2563eb') : isDone ? '#22c55e' : '#444',
                marginRight: 'clamp(8px, 2vw, 16px)',
                flexShrink: 0
              }} />
              <div style={{ 
                width: 'clamp(40px, 10vw, 50px)', 
                color: '#888',
                fontSize: 'clamp(12px, 3vw, 14px)',
                flexShrink: 0
              }}>
                {formatTime(step.time)}
              </div>
              <div style={{ 
                flex: 1,
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: isCurrent ? 'white' : '#aaa',
                paddingRight: 8
              }}>
                {step.instruction}
              </div>
              <div style={{ 
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: '#666',
                flexShrink: 0
              }}>
                {step.water}g
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}