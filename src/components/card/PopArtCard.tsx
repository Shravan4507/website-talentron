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
  return (
    <div 
      className={`pop-art-card ${className}`}
      onClick={onClick}
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
