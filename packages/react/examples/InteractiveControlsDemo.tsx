import React, { useState } from 'react';
import { LiquidGlass, type PresetName } from '../src';

export default function InteractiveControlsDemo() {
  const [refraction, setRefraction] = useState(0.02);
  const [bevelDepth, setBevelDepth] = useState(0.08);
  const [bevelWidth, setBevelWidth] = useState(0.15);
  const [frost, setFrost] = useState(2.0);
  const [magnify, setMagnify] = useState(1.0);
  const [shadow, setShadow] = useState(true);
  const [specular, setSpecular] = useState(true);
  const [tilt, setTilt] = useState(true);
  const [tiltFactor, setTiltFactor] = useState(15);
  const [preset, setPreset] = useState<PresetName | 'custom'>('custom');

  // Triggering preset configurations
  const applyPreset = (name: PresetName) => {
    setPreset(name);
    // Presets values resolution (matching constants/presets definitions)
    const presetValues: Record<PresetName, any> = {
      default: { refraction: 0, bevelDepth: 0.052, bevelWidth: 0.211, frost: 2.0, shadow: true, specular: true },
      alien: { refraction: 0.073, bevelDepth: 0.2, bevelWidth: 0.156, frost: 2.0, shadow: true, specular: false },
      pulse: { refraction: 0.03, bevelDepth: 0, bevelWidth: 0.273, frost: 0, shadow: false, specular: false },
      frost: { refraction: 0, bevelDepth: 0.035, bevelWidth: 0.119, frost: 0.9, shadow: true, specular: true },
      edge: { refraction: 0.047, bevelDepth: 0.136, bevelWidth: 0.076, frost: 2.0, shadow: true, specular: false },
    };

    const vals = presetValues[name];
    if (vals) {
      setRefraction(vals.refraction);
      setBevelDepth(vals.bevelDepth);
      setBevelWidth(vals.bevelWidth);
      setFrost(vals.frost);
      setShadow(vals.shadow);
      setSpecular(vals.specular);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '40px',
      background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      flexWrap: 'wrap'
    }}>
      {/* Background blobs for premium look */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0) 70%)',
        top: '10%',
        left: '10%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Control Panel (Plain glass box) */}
      <div style={{
        width: '340px',
        background: 'rgba(30, 41, 59, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        color: '#f8fafc',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 10
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          Interactive Controls
        </h3>

        {/* Presets Grid */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Presets</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {(['default', 'alien', 'pulse', 'frost', 'edge'] as PresetName[]).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: preset === p ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: preset === p ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.02)',
                  color: preset === p ? '#38bdf8' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Refraction</span>
              <span style={{ color: '#38bdf8' }}>{refraction.toFixed(3)}</span>
            </div>
            <input
              type="range" min="0" max="0.1" step="0.001" value={refraction}
              onChange={(e) => { setRefraction(parseFloat(e.target.value)); setPreset('custom'); }}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Bevel Depth</span>
              <span style={{ color: '#38bdf8' }}>{bevelDepth.toFixed(3)}</span>
            </div>
            <input
              type="range" min="0" max="0.2" step="0.001" value={bevelDepth}
              onChange={(e) => { setBevelDepth(parseFloat(e.target.value)); setPreset('custom'); }}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Bevel Width</span>
              <span style={{ color: '#38bdf8' }}>{bevelWidth.toFixed(3)}</span>
            </div>
            <input
              type="range" min="0" max="0.5" step="0.001" value={bevelWidth}
              onChange={(e) => { setBevelWidth(parseFloat(e.target.value)); setPreset('custom'); }}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Frost (Blur)</span>
              <span style={{ color: '#38bdf8' }}>{frost.toFixed(1)}px</span>
            </div>
            <input
              type="range" min="0" max="10" step="0.1" value={frost}
              onChange={(e) => { setFrost(parseFloat(e.target.value)); setPreset('custom'); }}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={shadow} onChange={(e) => { setShadow(e.target.checked); setPreset('custom'); }} style={{ accentColor: '#38bdf8' }} />
              Shadow
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={specular} onChange={(e) => { setSpecular(e.target.checked); setPreset('custom'); }} style={{ accentColor: '#38bdf8' }} />
              Specular
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={tilt} onChange={(e) => { setTilt(e.target.checked); setPreset('custom'); }} style={{ accentColor: '#38bdf8' }} />
              3D Tilt
            </label>
          </div>
        </div>
      </div>

      {/* Target Glass Card */}
      <LiquidGlass
        refraction={refraction}
        bevelDepth={bevelDepth}
        bevelWidth={bevelWidth}
        frost={frost}
        magnify={magnify}
        shadow={shadow}
        specular={specular}
        tilt={tilt}
        tiltFactor={tiltFactor}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '320px',
          height: '320px',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: shadow ? '0 24px 48px rgba(0, 0, 0, 0.4)' : 'none',
          color: '#ffffff',
        }}
      >
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>
            Live Preview
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Refract
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}
