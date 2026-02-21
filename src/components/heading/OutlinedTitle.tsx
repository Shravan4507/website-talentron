import "./OutlinedTitle.css";

type OutlinedTitleProps = {
  text: string;
  fillColor?: string;
  outlineColor?: string;
  shadowColor?: string;
  className?: string;
  hasGrain?: boolean;
}

export default function OutlinedTitle({ 
  text, 
  fillColor = "#ffcc00", 
  outlineColor = "#5a00ff", 
  shadowColor = "#3a0099",
  className = "",
  hasGrain = true
}: OutlinedTitleProps) {
  const isGradient = fillColor.includes('gradient');

  return (
    <h1 className={`outlined ${className} ${hasGrain ? 'grainy' : ''}`}>
      <span 
        className="border" 
        style={{ 
          WebkitTextStrokeColor: outlineColor,
          filter: `drop-shadow(0 6px 0 ${shadowColor})`
        }}
      >
        {text}
      </span>
      <span 
        className="fill" 
        style={{ 
          color: 'transparent',
          backgroundImage: hasGrain 
            ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"), ${isGradient ? fillColor : `linear-gradient(${fillColor}, ${fillColor})`}`
            : (isGradient ? fillColor : `linear-gradient(${fillColor}, ${fillColor})`),
          backgroundBlendMode: hasGrain ? 'soft-light' : 'normal',
          WebkitBackgroundClip: 'text',
          textShadow: isGradient ? 'none' : `0 3px 0 ${shadowColor}cc`,
          filter: 'contrast(1.5) saturate(1.4) brightness(1.2)'
        }}
      >
        {text}
      </span>
    </h1>
  )
}
