import { useId } from 'react'

interface LogoIconProps {
  size?: number
  className?: string
  variant?: 'default' | 'sidebar'
}

export function LogoIcon({ size = 36, className = '', variant = 'default' }: LogoIconProps) {
  const gradientId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {variant === 'default' ? (
        <rect width="192" height="192" rx="44" fill="#1B8A3E" />
      ) : (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D1F12" />
              <stop offset="100%" stopColor="#1A5C2E" />
            </linearGradient>
          </defs>
          <rect width="192" height="192" rx="44" fill={`url(#${gradientId})`} />
        </>
      )}

      <rect x="34" y="118" width="124" height="38" rx="9" fill="white" fillOpacity={variant === 'default' ? 0.95 : 1} />
      <rect x="44" y="78" width="104" height="34" rx="8" fill="white" fillOpacity="0.65" />
      <rect x="58" y="42" width="76" height="30" rx="7" fill="white" fillOpacity="0.38" />
      <line x1="96" y1="38" x2="96" y2="162" stroke="white" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  )
}
