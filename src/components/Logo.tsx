import React from "react";

interface LogoProps {
  /** "full" = icon + wordmark, "icon" = icon only */
  variant?: "full" | "icon";
  /** Forces light or dark wordmark. Omit to inherit from parent / dark mode class. */
  scheme?: "light" | "dark";
  className?: string;
  /** Height in px — width scales proportionally */
  height?: number;
}

/**
 * "The Confetti Prism"
 *
 * A diamond split into 4 burst-apart quadrants — the frozen moment
 * confetti is thrown. Four pieces: plan · connect · manage · celebrate.
 * A central spark represents the AI precision core.
 *
 * Usage:
 *   <Logo />                        — full logo, dark wordmark
 *   <Logo scheme="dark" />          — full logo, white wordmark (dark bg)
 *   <Logo variant="icon" />         — icon only
 *   <Logo height={32} />            — custom size
 */
export default function Logo({
  variant = "full",
  scheme,
  className = "",
  height = 36,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 40 40"
        height={height}
        width={height}
        className={className}
        aria-label="Confetti"
        role="img"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="21,3 37,19 21,19" fill="#7c3aed" />
        <polygon points="37,21 21,37 21,21" fill="#9333ea" />
        <polygon points="19,37 3,21 19,21" fill="#ec4899" />
        <polygon points="3,19 19,3 19,19" fill="#c084fc" />
        <circle cx="20" cy="20" r="2" fill="white" opacity="0.95" />
      </svg>
    );
  }

  /* ── Full logo: icon + wordmark ─────────────────────────────────────── */

  // Width = icon (40) + gap (10) + text (~120) = 170, proportional to height
  const viewW = 190;
  const viewH = 40;
  const w = (height / viewH) * viewW;

  // Wordmark color logic:
  // scheme="light" → dark text; scheme="dark" → white; omitted → CSS-variable-based
  const textFill =
    scheme === "dark"
      ? "white"
      : scheme === "light"
      ? "#111827"
      : "currentColor";

  // On dark bg, the icon quadrant colours shift to lighter pastels for contrast
  const isDark = scheme === "dark";
  const q1 = isDark ? "#a78bfa" : "#7c3aed";
  const q2 = isDark ? "#c084fc" : "#9333ea";
  const q3 = isDark ? "#f472b6" : "#ec4899";
  const q4 = isDark ? "#e879f9" : "#c084fc";

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      height={height}
      width={w}
      className={className}
      aria-label="Confetti"
      role="img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cLetterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={q1} />
          <stop offset="100%" stopColor={q2} />
        </linearGradient>
      </defs>

      {/* Icon */}
      <polygon points="21,3 37,19 21,19" fill={q1} />
      <polygon points="37,21 21,37 21,21" fill={q2} />
      <polygon points="19,37 3,21 19,21" fill={q3} />
      <polygon points="3,19 19,3 19,19" fill={q4} />
      <circle cx="20" cy="20" r="2" fill="white" opacity="0.95" />

      {/* Wordmark — "C" picks up the icon's brand purple, rest follows scheme */}
      <text
        fontFamily="'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.4"
      >
        <tspan x="50" y="28" fill={isDark ? q1 : "url(#cLetterGrad)"}>
          C
        </tspan>
        <tspan fill={textFill}>onfetti</tspan>
      </text>
    </svg>
  );
}
