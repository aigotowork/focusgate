export const BRAND = {
  nameZh: "守界",
  nameEn: "FocusGate",
  fullName: "FocusGate / 守界",
  slogan: "该专注时，守住你的注意力边界。",
  shortDescription: "用规则组为睡眠、工作和戒断场景建立可执行的网站边界。",
  legacyNameZh: "专注边界",
  legacyNameEn: "Focus Boundary",
  defaultSleepGroupName: "晚安守护"
} as const;

export const BRAND_COLORS = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  softGround: "#f7f7fb",
  ink: "#1a1a2e"
} as const;

export const gateMarkSvg = `
  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="focusgate-mark-gradient" x1="16" y1="12" x2="84" y2="88" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6366f1"/>
        <stop offset="1" stop-color="#a78bfa"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="47" fill="white" stroke="rgba(99,102,241,0.16)" stroke-width="2"/>
    <rect x="22" y="20" width="56" height="64" rx="7" fill="rgba(99,102,241,0.07)" stroke="url(#focusgate-mark-gradient)" stroke-width="2.8"/>
    <path d="M22 40 Q50 16 78 40" stroke="url(#focusgate-mark-gradient)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <line x1="50" y1="40" x2="50" y2="84" stroke="#a5b4fc" stroke-width="1.6" stroke-dasharray="4 4" opacity="0.65"/>
    <rect x="39.5" y="55" width="21" height="15.5" rx="4.5" fill="url(#focusgate-mark-gradient)"/>
    <path d="M44 55v-6a6 6 0 0 1 12 0v6" stroke="url(#focusgate-mark-gradient)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="62.5" r="2.6" fill="white"/>
  </svg>
`;
