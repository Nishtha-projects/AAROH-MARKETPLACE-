import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

// Excludes visually ambiguous characters: 0, O, o, 1, I, l
const CAPTCHA_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const CAPTCHA_LENGTH = 6;

const generateCaptchaCode = () => {
  let code = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    const idx = Math.floor(Math.random() * CAPTCHA_CHARSET.length);
    code += CAPTCHA_CHARSET[idx];
  }
  return code;
};

/**
 * Custom HTML5 Canvas Alphanumeric CAPTCHA ("Human Verification")
 * Replaces external Cloudflare Turnstile with a zero-dependency local verifier.
 */
export const AlphanumericCaptcha = ({
  theme = 'light',
  onVerify,
  onExpire,
  label = 'Human Verification'
}) => {
  const canvasRef = useRef(null);
  const [code, setCode] = useState(() => generateCaptchaCode());
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const isDark = theme === 'dark';

  const drawCaptcha = useCallback((targetCode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Noisy textured background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      grad.addColorStop(0, '#1B2434');
      grad.addColorStop(0.5, '#232F44');
      grad.addColorStop(1, '#192130');
    } else {
      grad.addColorStop(0, '#F7F1E5');
      grad.addColorStop(0.5, '#EFE7D6');
      grad.addColorStop(1, '#F5EFE2');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid/texture lines
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,52,89,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() * 8 - 4), height);
      ctx.stroke();
    }

    // 2. Random background noise dots
    for (let i = 0; i < 65; i++) {
      ctx.fillStyle = isDark
        ? `rgba(${150 + Math.random() * 100}, ${160 + Math.random() * 90}, 220, ${0.15 + Math.random() * 0.25})`
        : `rgba(${40 + Math.random() * 100}, ${40 + Math.random() * 80}, ${60 + Math.random() * 80}, ${0.14 + Math.random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 0.8 + Math.random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw 6 characters with slight rotation/tilt and vertical jitter
    const charColors = isDark
      ? ['#F3E8D2', '#93C5FD', '#FCA5A5', '#FDE68A', '#86EFAC']
      : ['#1A3459', '#8B2635', '#2D4C3A', '#9A4B22', '#2B3A55'];

    const startX = 20;
    const stepX = (width - 36) / CAPTCHA_LENGTH;

    for (let i = 0; i < targetCode.length; i++) {
      const ch = targetCode[i];
      const x = startX + i * stepX + (Math.random() * 4 - 2);
      const y = height / 2 + 8 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 0.44) - 0.22; // -0.22 to +0.22 rad

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `${i % 2 === 0 ? 'bold' : '700'} ${24 + Math.floor(Math.random() * 4)}px "Georgia", "Courier New", monospace`;
      ctx.fillStyle = charColors[i % charColors.length];
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(ch, -6, 0);
      ctx.restore();
    }

    // 4. Curved strikethrough interference lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = isDark
        ? `rgba(212, 163, 115, ${0.28 + Math.random() * 0.25})`
        : `rgba(194, 86, 52, ${0.25 + Math.random() * 0.25})`;
      ctx.lineWidth = 1.2 + Math.random() * 0.9;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.33, Math.random() * height,
        width * 0.66, Math.random() * height,
        width, Math.random() * height
      );
      ctx.stroke();
    }
  }, [isDark]);

  useEffect(() => {
    drawCaptcha(code);
  }, [code, drawCaptcha]);

  const handleRefresh = () => {
    const nextCode = generateCaptchaCode();
    setCode(nextCode);
    setUserInput('');
    setIsVerified(false);
    if (onExpire) onExpire();
    if (onVerify) onVerify('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);

    if (val === code) {
      setIsVerified(true);
      if (onVerify) onVerify(`canvas-verified-${code}`);
    } else {
      if (isVerified) {
        setIsVerified(false);
        if (onExpire) onExpire();
      }
      if (onVerify) onVerify('');
    }
  };

  const hasMismatch = userInput.length >= CAPTCHA_LENGTH && userInput !== code;

  return (
    <div
      style={{
        margin: '14px 0',
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm, 8px)',
        border: `1px solid ${isVerified ? 'var(--accent-olive, #4D7C0F)' : hasMismatch ? 'var(--accent-rose, #C25634)' : 'var(--border-subtle, #E2D9C8)'}`,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'var(--bg-surface-subtle, #FAF5EB)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <ShieldCheck size={14} color={isVerified ? 'var(--accent-olive, #4D7C0F)' : 'var(--accent-indigo, #1A3459)'} />
          <span>{label}</span>
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Case-sensitive
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <canvas
          ref={canvasRef}
          width={210}
          height={54}
          aria-label="Human verification CAPTCHA image"
          style={{
            borderRadius: '6px',
            border: '1px solid var(--border-subtle, #D5CBB8)',
            display: 'block',
            userSelect: 'none'
          }}
        />
        <button
          type="button"
          onClick={handleRefresh}
          title="Generate new CAPTCHA"
          aria-label="Refresh CAPTCHA"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle, #D5CBB8)',
            backgroundColor: 'var(--bg-surface, #FFFFFF)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Enter characters shown above"
        autoComplete="off"
        spellCheck={false}
        maxLength={CAPTCHA_LENGTH}
        className="form-input"
        style={{
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
          fontFamily: 'monospace'
        }}
      />

      {isVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-olive, #4D7C0F)' }}>
          <CheckCircle2 size={14} />
          <span>Human verification complete</span>
        </div>
      )}

      {hasMismatch && (
        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--accent-rose, #C25634)' }}>
          Characters do not match. Check uppercase/lowercase or click refresh.
        </div>
      )}
    </div>
  );
};

export default AlphanumericCaptcha;
