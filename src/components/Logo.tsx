import logoImage from '../assets/fresh-market-logo.png'

export function LogoMark({ className = 'h-9' }: { className?: string }) {
  return <img src={logoImage} alt="Fresh Market" className={`${className} w-auto object-contain`} />
}
