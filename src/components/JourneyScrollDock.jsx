import React, { useState, useEffect } from 'react';

export const JourneyScrollDock = () => {
  const [activeSection, setActiveSection] = useState('cover');

  useEffect(() => {
    const handleScroll = () => {
      const coverEl = document.getElementById('cover-section');
      const visionEl = document.getElementById('vision-section');
      const exploreEl = document.getElementById('explore-section');

      const scrollPos = window.scrollY + window.innerHeight * 0.4;

      if (exploreEl && scrollPos >= exploreEl.offsetTop) {
        setActiveSection('explore');
      } else if (visionEl && scrollPos >= visionEl.offsetTop) {
        setActiveSection('vision');
      } else {
        setActiveSection('cover');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    { id: 'cover-section', key: 'cover', icon: '🪷', label: '1. Cover • वस्त्र आवरण' },
    { id: 'vision-section', key: 'vision', icon: '📜', label: '2. Vision • धरोहर दर्शन' },
    { id: 'explore-section', key: 'explore', icon: '🏺', label: '3. Explore • हस्तकला बाज़ार' }
  ];

  return (
    <nav 
      className="journey-dock" 
      aria-label="Scroll Journey Navigation"
      role="navigation"
    >
      {steps.map((step) => {
        const isActive = activeSection === step.key;
        return (
          <button
            key={step.key}
            onClick={() => scrollTo(step.id)}
            className={`journey-node ${isActive ? 'active ripple-container' : ''}`}
            aria-label={step.label}
            title={step.label}
          >
            {isActive && <div className="ripple-ring ripple-ring-ochre" aria-hidden="true" style={{ inset: '-4px' }} />}
            <span>{step.icon}</span>
            <span className="journey-tooltip">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
