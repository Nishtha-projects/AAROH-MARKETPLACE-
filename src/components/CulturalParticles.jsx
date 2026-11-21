import React from 'react';

/**
 * CulturalParticles
 * Highly visible, elegant floating Indian heritage motifs (swallows, lotuses, marigolds, mica sparkles)
 * Adds tangible motion and life to the Aaroh Cultural Journal experience.
 */
export const CulturalParticles = ({ reducedMotion }) => {
  if (reducedMotion) return null;

  const particles = [
    { id: 1, type: 'lotus', icon: '🪷', top: '12%', left: '6%', size: '2rem', animClass: 'float-sway-1', delay: '0s', duration: '5s', opacity: 0.85 },
    { id: 2, type: 'swallow', icon: '🕊️', top: '18%', right: '8%', size: '1.8rem', animClass: 'float-sway-2', delay: '0.8s', duration: '6.5s', opacity: 0.8 },
    { id: 3, type: 'marigold', icon: '✿', top: '38%', left: '4%', size: '1.6rem', animClass: 'float-sway-3', delay: '1.5s', duration: '5.2s', opacity: 0.9, color: 'var(--accent-ochre)' },
    { id: 4, type: 'sparkle', icon: '✨', top: '28%', right: '14%', size: '1.5rem', animClass: 'float-sway-1', delay: '0.4s', duration: '4.8s', opacity: 0.95, color: '#D4AF37' },
    { id: 5, type: 'petal', icon: '❋', top: '58%', left: '8%', size: '1.7rem', animClass: 'float-sway-2', delay: '1.2s', duration: '6s', opacity: 0.85, color: 'var(--accent-rose)' },
    { id: 6, type: 'lotus', icon: '🪷', top: '68%', right: '7%', size: '2.1rem', animClass: 'float-sway-3', delay: '2s', duration: '5.5s', opacity: 0.8 },
    { id: 7, type: 'sparkle', icon: '✨', top: '75%', left: '16%', size: '1.4rem', animClass: 'float-sway-1', delay: '0.6s', duration: '4.5s', opacity: 0.9, color: '#D4AF37' },
    { id: 8, type: 'swallow', icon: '🕊️', top: '48%', right: '18%', size: '1.7rem', animClass: 'float-sway-2', delay: '1.8s', duration: '7s', opacity: 0.75 },
    { id: 9, type: 'marigold', icon: '✿', top: '82%', right: '20%', size: '1.5rem', animClass: 'float-sway-3', delay: '2.2s', duration: '5.8s', opacity: 0.85, color: 'var(--accent-ochre)' },
    { id: 10, type: 'lotus', icon: '🪷', top: '42%', left: '18%', size: '1.6rem', animClass: 'float-sway-1', delay: '1.4s', duration: '6.2s', opacity: 0.75 },
  ];

  return (
    <div 
      className="cultural-particles-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`heritage-particle ${p.animClass}`}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left || 'auto',
            right: p.right || 'auto',
            fontSize: p.size,
            color: p.color || 'inherit',
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
            display: 'inline-block',
            filter: 'drop-shadow(0 4px 12px rgba(191, 135, 46, 0.35))',
            willChange: 'transform, opacity',
            userSelect: 'none'
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
};
