import React, { useState } from 'react';
import GlassCardDemo from '../../examples/GlassCardDemo';
import NavBarDemo from '../../examples/NavBarDemo';
import AnimateDemo from '../../examples/AnimateDemo';
import InteractiveControlsDemo from '../../examples/InteractiveControlsDemo';

type DemoTab = 'card' | 'navbar' | 'animate' | 'controls';

export default function App() {
  const [activeTab, setActiveTab] = useState<DemoTab>('card');

  const renderActiveDemo = () => {
    switch (activeTab) {
      case 'navbar':
        return <NavBarDemo />;
      case 'animate':
        return <AnimateDemo />;
      case 'controls':
        return <InteractiveControlsDemo />;
      case 'card':
      default:
        return <GlassCardDemo />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Demo Selector Header */}
      <header style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '30px',
        padding: '6px 12px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        zIndex: 99999
      }}>
        {(['card', 'navbar', 'animate', 'controls'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px',
              borderRadius: '20px',
              border: 'none',
              background: activeTab === tab ? '#38bdf8' : 'transparent',
              color: activeTab === tab ? '#0f172a' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'card' && '💳 Bank Card'}
            {tab === 'navbar' && '🧭 Nav Bar'}
            {tab === 'animate' && '🌀 Layout Morph'}
            {tab === 'controls' && '🎛️ Live Sliders'}
          </button>
        ))}
      </header>

      {/* Main active demo content */}
      <main style={{ minHeight: '100vh' }}>
        {renderActiveDemo()}
      </main>
    </div>
  );
}
