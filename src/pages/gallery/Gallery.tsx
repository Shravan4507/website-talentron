import React, { useState } from 'react';
import Masonry from '../../components/gallery/Masonry';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './Gallery.css';

const Gallery: React.FC = () => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // Swipe logic state
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNextImage();
        } else if (isRightSwipe) {
            handlePrevImage();
        }
    };

    const items = [
        { id: "1", img: "https://picsum.photos/id/10/1200/1800", height: 900, url: '#' },
        { id: "2", img: "https://picsum.photos/id/20/1200/1500", height: 750, url: '#' },
        { id: "3", img: "https://picsum.photos/id/30/1200/1600", height: 800, url: '#' },
        { id: "4", img: "https://picsum.photos/id/40/1200/1700", height: 850, url: '#' },
        { id: "5", img: "https://picsum.photos/id/50/1200/1400", height: 700, url: '#' },
        { id: "6", img: "https://picsum.photos/id/60/1200/1900", height: 950, url: '#' },
        { id: "7", img: "https://picsum.photos/id/70/1200/1600", height: 800, url: '#' },
        { id: "8", img: "https://picsum.photos/id/80/1200/2000", height: 1000, url: '#' },
        { id: "9", img: "https://picsum.photos/id/90/1200/1500", height: 750, url: '#' },
        { id: "10", img: "https://picsum.photos/id/100/1200/1600", height: 800, url: '#' },
        { id: "11", img: "https://picsum.photos/id/110/1200/1800", height: 900, url: '#' },
        { id: "12", img: "https://picsum.photos/id/120/1200/1500", height: 750, url: '#' },
        { id: "13", img: "https://picsum.photos/id/130/1200/1700", height: 850, url: '#' },
        { id: "14", img: "https://picsum.photos/id/140/1200/1400", height: 700, url: '#' },
        { id: "15", img: "https://picsum.photos/id/150/1200/1900", height: 950, url: '#' },
    ];

    const handleNextImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % items.length);
        }
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex - 1 + items.length) % items.length);
        }
    };

    const closeLightbox = () => setSelectedImageIndex(null);

    return (
        <div className="gallery-page">
            <div className="gallery-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="A VISUAL JOURNEY" 
                        className="small"
                        fillColor="linear-gradient(180deg, #00f2fe 0%, #4facfe 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="CAPTURING EXCELLENCE" 
                        fillColor="linear-gradient(180deg, #7000ff 0%, #ff00ea 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <p className="gallery-description">Relive the moments that define our spirit</p>
            </div>

            <div className="gallery-container">
                <Masonry 
                    items={items} 
                    onItemClick={(_, index) => setSelectedImageIndex(index)}
                />
            </div>

            {/* Lightbox */}
            {selectedImageIndex !== null && (
                <div 
                    className="fullscreen-overlay" 
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button className="overlay-close" onClick={closeLightbox}>&times;</button>
                    
                    <button 
                        className="overlay-nav prev" 
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    >
                        &#8592;
                    </button>

                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={items[selectedImageIndex].img} 
                            className="full-res-img" 
                            alt={`Gallery item ${selectedImageIndex + 1}`} 
                        />
                    </div>

                    <button 
                        className="overlay-nav next" 
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    >
                        &#8594;
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gallery;
