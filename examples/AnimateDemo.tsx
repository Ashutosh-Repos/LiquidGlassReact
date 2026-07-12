import React, { useState } from 'react';
import { LiquidGlass } from '../src';

export default function AnimateDemo() {
  const [sizeMode, setSizeMode] = useState<'normal' | 'wide' | 'tall'>('normal');

  // Helper to resolve card styles dynamically
  const getDynamicStyles = () => {
    switch (sizeMode) {
      case 'wide':
        return {
          width: '450px',
          height: '180px',
          borderRadius: '40px',
        };
      case 'tall':
        return {
          width: '280px',
          height: '380px',
          borderRadius: '12px',
        };
      case 'normal':
      default:
        return {
          width: '320px',
          height: '240px',
          borderRadius: '24px',
        };
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0c0f1d',
      padding: '40px',
      fontFamily: 'sans-serif'
    }}>
      {/* Dynamic backdrop blob */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
        top: '25%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', zIndex: 10 }}>
        {(['normal', 'wide', 'tall'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSizeMode(mode)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: sizeMode === mode ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
              background: sizeMode === mode ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
              color: sizeMode === mode ? '#d8b4fe' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 
        Morphing Glass Panel
        CSS transitions are applied to width, height, and border-radius.
        Our ResizeObserver inside useLiquidGlass automatically reads the computed layout changes
        each frame and redraws the WebGL refraction lens to match!
      */}
      <LiquidGlass
        preset="default"
        style={{
          ...getDynamicStyles(),
          position: 'relative',
          zIndex: 10,
          transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.4s ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: 'bold' }}>Resize Observer Sync</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4', maxWidth: '240px' }}>
            WebGL maps seamlessly to dynamic width, height, and border-radius transitions.
          </p>
        </div>
      </LiquidGlass>
    </div>
  );
}
