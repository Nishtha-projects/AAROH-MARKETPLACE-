import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Cloudflare Turnstile CAPTCHA Frontend Widget
 * Secure, interactive bot protection with dynamic script loading and token callbacks.
 */
export const TurnstileWidget = ({
  siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  action = 'auth'
}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if script is already present
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget instance if any
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme === 'dark' ? 'dark' : 'light',
          action,
          callback: (token) => {
            if (!isMounted) return;
            setIsVerified(true);
            setLoadError(null);
            if (typeof onVerify === 'function') onVerify(token);
          },
          'error-callback': (code) => {
            if (!isMounted) return;
            setIsVerified(false);
            console.warn('[Cloudflare Turnstile Widget Error]', code);
            setLoadError('Security check failed to initialize. Please refresh.');
            if (typeof onError === 'function') onError(code);
          },
          'expired-callback': () => {
            if (!isMounted) return;
            setIsVerified(false);
            if (typeof onExpire === 'function') onExpire();
          }
        });
        setIsReady(true);
      } catch (err) {
        console.warn('[Cloudflare Turnstile Render Exception]', err);
        setLoadError(err.message || 'Error rendering Turnstile.');
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.turnstile) {
            renderWidget();
          }
        };
        script.onerror = () => {
          if (isMounted) {
            setLoadError('Could not load Cloudflare Turnstile security service. Check network.');
          }
        };
        document.head.appendChild(script);
      } else {
        // Wait for existing script to load
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            renderWidget();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [siteKey, theme, action]);

  const handleManualReset = () => {
    setIsVerified(false);
    setLoadError(null);
    if (widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {}
    }
  };

  return (
    <div className="turnstile-wrapper" style={{ margin: '14px 0' }}>
      <div 
        ref={containerRef} 
        style={{ minHeight: '65px', display: 'flex', justifyContent: 'center' }}
      />
      {loadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '0.8rem',
          color: '#B91C1C',
          backgroundColor: '#FEF2F2',
          borderRadius: '6px',
          border: '1px solid #FCA5A5',
          marginTop: '6px'
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{loadError}</span>
          <button
            type="button"
            onClick={handleManualReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#B91C1C',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default TurnstileWidget;
