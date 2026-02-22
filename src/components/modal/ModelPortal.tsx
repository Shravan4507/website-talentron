import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CloseButton from '../navigation/CloseButton';
import './ModelPortal.css';

interface ModelPortalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    image?: string;
    imageAlt?: string;
    imageChildren?: React.ReactNode;
    className?: string;
}

const ModelPortal: React.FC<ModelPortalProps> = ({ 
    isOpen, 
    onClose, 
    children, 
    image,
    imageAlt = "Modal image",
    imageChildren,
    className = ''
}) => {
    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            // Ensure overflow is restored even if component unmounts unexpectedly
            if (document.body.children.length === 0) { // Check if other portals exist
                 document.body.style.overflow = 'unset';
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className={`model-portal-overlay ${className}`} onClick={onClose}>
            <div 
                className="model-portal-content" 
                onClick={e => e.stopPropagation()}
            >
                <CloseButton 
                    onClick={onClose} 
                    className="model-portal-close" 
                    size={40}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                    }}
                />
                
                <div className="model-image-side">
                    {image && <img src={image} alt={imageAlt} />}
                    {imageChildren}
                </div>

                <div className="model-details-side">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModelPortal;
