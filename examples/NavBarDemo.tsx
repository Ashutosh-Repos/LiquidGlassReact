import React from 'react';
import { LiquidGlass } from '../src';

export default function NavBarDemo() {
  return (
    <div style={{
      minHeight: '150vh', // Long page to showcase scroll behavior
      background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'sans-serif'
    }}>
      {/* 
        Fixed Navigation Bar 
        Uses the 'edge' preset for minimal border refraction and specular highlight lines
      */}
      <LiquidGlass
        as="nav"
        preset="edge"
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '960px',
          height: '64px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
        }}
      >
        {/* Brand / Logo */}
        <div style={{ zIndex: 10, position: 'relative', fontWeight: 'bold', color: '#ffffff', fontSize: '18px' }}>
          liquid<span style={{ color: '#38bdf8' }}>GL</span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '24px', zIndex: 10, position: 'relative' }}>
          {['Home', 'Products', 'Showcase', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'; }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <LiquidGlass
          as="button"
          preset="frost"
          style={{
            zIndex: 10,
            position: 'relative',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            background: 'transparent'
          }}
        >
          <span style={{ position: 'relative', zIndex: 3 }}>Install</span>
        </LiquidGlass>
      </LiquidGlass>

      {/* Main Content Area */}
      <div style={{ paddingTop: '160px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '800px', margin: '0 auto', color: '#f1f5f9' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px' }}>
          Glassmorphism Navigation
        </h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '32px' }}>
          Scroll down the page. Notice how the navigation bar refracts the text and background elements seamlessly underneath as you scroll.
        </p>

        {/* Colorful reference shapes in main content flow to showcase dynamic scrolling refraction */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '60px' }}>
          <div style={{ height: '200px', background: 'linear-gradient(to right, #ec4899, #f43f5e)', borderRadius: '16px' }} />
          <div style={{ height: '200px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: '16px' }} />
        </div>
      </div>
    </div>
  );
}
