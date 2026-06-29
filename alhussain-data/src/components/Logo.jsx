export default function Logo({ size = 32, showText = true, textClass = 'font-display font-bold' }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        <rect x="9" y="22" width="5" height="9" rx="1.5" fill="white" />
        <rect x="17.5" y="16" width="5" height="15" rx="1.5" fill="white" />
        <rect x="26" y="9" width="5" height="22" rx="1.5" fill="white" fillOpacity="0.95" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={textClass}>
          AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
        </span>
      )}
    </div>
  )
}
