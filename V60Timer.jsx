import { useState, useEffect, useRef } from 'react';

const recipes = {
  hot: {
    baseSteps: [
      { time: 0, instruction: "Pour for bloom", water: 60 },
      { time: 45, instruction: "First pour", water: 150 },
      { time: 75, instruction: "Second pour", water: 250 },
      { time: 105, instruction: "Third pour", water: 350 },
      { time: 135, instruction: "Final pour", water: 500 },
      { time: 210, instruction: "Drawdown complete", water: 500 },
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
      { time: 45, instruction: "Pour remaining water slowly", water: 500 },
      { time: 60*2.5, instruction: "Swirl carafe, serve on fresh ice", water: 500 },
    ],
    coffee: 32.5,
    water: 500,
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

export default function V60Timer() {
  const [mode, setMode] = useState('hot');
  const [multiplier, setMultiplier] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [flash, setFlash] = useState(true);
  const intervalRef = useRef(null);

  const recipe = recipes[mode];
  const coffee = recipe.coffee * multiplier;
  const water = recipe.water * multiplier;
  const ice = recipe.ice * multiplier;
  const steps = recipe.baseSteps.map(s => ({ ...s, water: s.water * multiplier }));

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

  const currentStep = steps[currentStepIndex];

  return (
    <div style={{ 
      fontFamily: 'system-ui', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 40,
      background: '#1a1a1a',
      color: 'white'
    }}>
      
      {!isRunning && (
        <>
          <h1 style={{ marginBottom: 16, fontWeight: 300, fontSize: 24 }}>V60 Recipe</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <PillToggle
              options={[
                { value: 'hot', label: '☕' },
                { value: 'iced', label: '🧊 ' }
              ]}
              value={mode}
              onChange={setMode}
              colors={{ hot: '#dc2626', iced: '#0891b2' }}
            />
            
            <PillToggle
              options={[
                { value: 0.5, label: '1x' },
                { value: 1, label: '2x' }
              ]}
              value={multiplier}
              onChange={setMultiplier}
            />
          </div>
          
          <p style={{ color: '#888' }}>
            {coffee}g beans • {water}ml h2o {ice > 0 && ` • ${ice}g ice`}
          </p>
          <p style={{ color: '#666', fontSize: 12 }}>
            Grind: {recipe.grind}
          </p>
        </>
      )}

      <div style={{ 
        fontSize: 'min(30vw, 180px)', 
        fontWeight: 200,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: 40,
        marginTop: isRunning ? 40 : 10
      }}>
        {formatTime(seconds)}
      </div>

      <div style={{ marginBottom: 40 }}>
        {!isRunning ? (
          <button 
            onClick={start}
            style={{
              padding: '16px 64px',
              fontSize: 24,
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
              padding: '16px 64px',
              fontSize: 24,
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
        maxWidth: 400,
        borderTop: '1px solid #333',
        paddingTop: 24
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
                padding: '12px 0',
                borderBottom: '1px solid #262626',
                opacity: isDone ? 0.4 : isCurrent ? (isRunning && flash ? 1 : 0.5) : 0.6,
                background: isCurrent && isRunning ? (flash ? (mode === 'iced' ? 'rgba(8,145,178,0.2)' : 'rgba(37,99,235,0.2)') : 'transparent') : 'transparent',
                borderRadius: 4,
                transition: 'opacity 0.2s, background 0.2s'
              }}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isCurrent ? (mode === 'iced' ? '#0891b2' : '#2563eb') : isDone ? '#22c55e' : '#444',
                marginRight: 16,
                flexShrink: 0
              }} />
              <div style={{ 
                width: 50, 
                color: '#888',
                fontSize: 14,
                flexShrink: 0
              }}>
                {formatTime(step.time)}
              </div>
              <div style={{ 
                flex: 1,
                fontSize: 14,
                color: isCurrent ? 'white' : '#aaa'
              }}>
                {step.instruction}
              </div>
              <div style={{ 
                fontSize: 14,
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