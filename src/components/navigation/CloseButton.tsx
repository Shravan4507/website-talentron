import React from 'react';
import './CloseButton.css';

interface CloseButtonProps {
    onClick: () => void;
    className?: string;
    size?: number;
    color?: string;
    style?: React.CSSProperties;
}

const CloseButton: React.FC<CloseButtonProps> = ({ 
    onClick, 
    className = '', 
    size = 32,
    color = '#fff',
    style = {}
}) => {
    return (
        <button 
            className={`close-button-component ${className}`}
            onClick={onClick}
            style={{ 
                width: size, 
                height: size,
                color: color,
                ...style 
            }}
            aria-label="Close modal"
        >
            <svg 
                viewBox="0 0 24 24" 
                className="close-button-svg"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M18 6L6 18M6 6L18 18" />
            </svg>
        </button>
    );
};

export default CloseButton;
