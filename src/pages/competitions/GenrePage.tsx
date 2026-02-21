import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { competitionsData } from '../../data/competitionsData';
import type { Competition } from '../../data/competitionsData';
import PopArtCard from '../../components/card/PopArtCard';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import { assetPath } from '../../utils/assetPath';
import './Genre.css';

const GenrePage: React.FC = () => {
    const { genre } = useParams<{ genre: string }>();
    const navigate = useNavigate();
    const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    // Decode and find the category
    const categoryName = genre ? decodeURIComponent(genre) : "";
    const filteredCompetitions = competitionsData.filter(c => c.category === categoryName);

    const handleCompClick = (comp: Competition) => {
        setSelectedComp(comp);
        document.body.style.overflow = 'hidden';
    };

    const handleClose = () => {
        setIsClosing(true);
        setSelectedComp(null); // Simple close for now, can add animation if needed
        setIsClosing(false);
        document.body.style.overflow = 'auto';
    };

    if (filteredCompetitions.length === 0) {
        return (
            <div className="genre-page">
                <div className="genre-header">
                    <OutlinedTitle text="GENRE NOT FOUND" fillColor="#ff0059" />
                    <button className="back-btn" onClick={() => navigate('/competitions')}>Back to Competitions</button>
                </div>
            </div>
        );
    }

    return (
        <div className="genre-page">
            <div className="genre-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text={categoryName.toUpperCase()} 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff00ea 0%, #7000ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text={categoryName.split(' & ')[0].toUpperCase()} 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff5e00 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="back-button-wrapper">
                    <button className="back-btn" onClick={() => navigate('/competitions')}>
                        ← Back to All Categories
                    </button>
                </div>
            </div>

            <div className="genre-grid-container">
                <div className="genre-grid">
                {filteredCompetitions.map((comp, index) => (
                    <PopArtCard
                        key={index}
                        backgroundImage={assetPath("/assets/cards/music.webp")}
                        footerText={comp.type}
                        onClick={() => handleCompClick(comp)}
                        animationDelay={`${index * 0.05}s`}
                    />
                ))}
                </div>
            </div>

            {selectedComp && (
                <div className={`comp-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
                    <div className="comp-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleClose}>&times;</button>
                        <div className="modal-main">
                            <div className="modal-image-side">
                                <img src={selectedComp.image} alt={selectedComp.name} />
                                <div className="modal-type-tag">{selectedComp.type}</div>
                            </div>
                            <div className="modal-info-side">
                                <span className="modal-cat">{selectedComp.category}</span>
                                <h2>{selectedComp.name}</h2>
                                <div className="modal-divider"></div>
                                <p className="modal-desc">{selectedComp.description}</p>
                                
                                <div className="modal-sections">
                                    <div className="modal-section">
                                        <h4>Registration</h4>
                                        <p>Open for all verified students.</p>
                                    </div>
                                    <div className="modal-section">
                                        <h4>Prizes</h4>
                                        <p>Exciting awards for top performers.</p>
                                    </div>
                                </div>

                                <button className="register-now-cta">Register for Event</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenrePage;
