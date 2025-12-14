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
      { time: 0, instruction: "Pour for bloom", water: 40 },
      { time: 45, instruction: "First pour", water: 100 },
      { time: 75, instruction: "Second pour", water: 160 },
      { time: 105, instruction: "Third pour", water: 220 },
      { time: 135, instruction: "Final pour", water: 300 },
      { time: 180, instruction: "Swirl & serve", water: 300 },
    ],
    coffee: 30,
    water: 300,
    ice: 200,
    grind: "Fine (toward aeropress)"
  }
};

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
      <h1 style={{ marginBottom: 4, fontWeight: 300, fontSize: 24 }}>V60 Recipe</h1>
      
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {['hot', 'iced'].map(m => (
          <button
            key={m}
            onClick={() => !isRunning && setMode(m)}
            disabled={isRunning}
            style={{
              background: mode === m ? (m === 'iced' ? '#0891b2' : '#dc2626') : '#333',
              border: 'none',
              borderRadius: 20,
              padding: '8px 16px',
              color: isRunning ? '#666' : 'white',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            {m === 'iced' ? '🧊 Iced' : '☕ Hot'}
          </button>
        ))}
      </div>

      {/* Size toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[0.5, 1].map(m => (
          <button
            key={m}
            onClick={() => !isRunning && setMultiplier(m)}
            disabled={isRunning}
            style={{
              background: multiplier === m ? '#2563eb' : '#333',
              border: 'none',
              borderRadius: 20,
              padding: '8px 16px',
              color: isRunning ? '#666' : 'white',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            {m === 1 ? '2 cups' : '1 cup'}
          </button>
        ))}
      </div>
      
      <p style={{ color: '#888',}}>
        {coffee}g coffee • {water}g water{ice > 0 && ` • ${ice}g ice`}
      </p>
      <p style={{ color: '#666', fontSize: 12, }}>
        Grind: {recipe.grind}
      </p>

      <div style={{ 
        fontSize: 'min(30vw, 180px)', 
        fontWeight: 200,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: 40,
        marginTop: 10
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