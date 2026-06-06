import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Hold screen for 1.2s, then start fade out transition (400ms)
    const holdTimer = setTimeout(() => {
      setFade(true);
    }, 1200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`loader-overlay ${fade ? 'hidden' : ''}`}>
      <div style={{ textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Initializing Portfolio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
          Loading creative assets...
        </p>
      </div>
    </div>
  );
}
