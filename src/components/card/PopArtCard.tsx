import React from 'react';
import './PopArtCard.css';

interface PopArtCardProps {
  backgroundImage?: string;
  buttonText?: string;
  footerText?: string;
  backgroundColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  animationDelay?: string;
}

const PopArtCard: React.FC<PopArtCardProps> = ({
  backgroundImage,
  buttonText = "EXPLORE",
  footerText,
  backgroundColor = "#f0f0f0",
  onClick,
  style,
  className = "",
  animationDelay
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`pop-art-card ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={footerText || buttonText}
      style={{ 
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        animationDelay,
        ...style 
      }}
    >
      <div className="pop-art-button">
        {buttonText}
      </div>

      {footerText && (
        <div className="pop-art-footer-text">
          {footerText}
        </div>
      )}
    </div>
  );
};

export default PopArtCard;
