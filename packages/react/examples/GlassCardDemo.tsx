import React from 'react';
import { LiquidGlass } from '../src';

export default function GlassCardDemo() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f1f2e 0%, #111116 100%)',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Dynamic colorful blobs in background to showcase WebGL refraction */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(236,72,153,0) 70%)',
        top: '20%',
        left: '25%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 70%)',
        bottom: '15%',
        right: '20%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      {/* Credit Card Container */}
      <LiquidGlass
        preset="alien"
        tilt={true}
        tiltFactor={20}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '380px',
          height: '240px',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
        }}
      >
        {/* Top Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
          <div style={{
            width: '48px',
            height: '36px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '6px',
            position: 'relative'
          }}>
            {/* chip simulation */}
            <div style={{ position: 'absolute', top: '25%', left: '10%', width: '80%', height: '50%', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '3px' }} />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px', opacity: 0.9 }}>
            NaughtyDuk
          </span>
        </div>

        {/* Middle Section */}
        <div style={{ zIndex: 10, position: 'relative' }}>
          <div style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: '600',
            letterSpacing: '3.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            •••• •••• •••• 5482
          </div>
        </div>

        {/* Footer Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10, position: 'relative' }}>
          <div>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>
              Card Holder
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
              Alex Mercer
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '2px' }}>
              Expires
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
              12/28
            </div>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}
