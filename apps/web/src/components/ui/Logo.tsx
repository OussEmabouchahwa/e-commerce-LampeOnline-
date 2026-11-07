interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-7',   // 28px — mobile nav
  md: 'h-9',   // 36px — desktop nav
  lg: 'h-12',  // 48px — footer / auth
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <img
      src="/assets/bo-creation-logo.png"
      alt="BO Creation — LampeOnline"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  )
}
