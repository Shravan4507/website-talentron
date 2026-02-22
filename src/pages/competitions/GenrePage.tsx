import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { competitionsData } from '../../data/competitionsData';
import type { Competition } from '../../data/competitionsData';
import PopArtCard from '../../components/card/PopArtCard';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import ModelPortal from '../../components/modal/ModelPortal';
import SEO from '../../components/navigation/SEO';
import { assetPath } from '../../utils/assetPath';
import './Genre.css';

const GenrePage: React.FC = () => {
    const { genre } = useParams<{ genre: string }>();
    const navigate = useNavigate();
    const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

    // Decode and find the category
    const categoryName = genre ? decodeURIComponent(genre) : "";
    const filteredCompetitions = competitionsData.filter(c => c.category === categoryName);

    const genreSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${categoryName} Competitions`,
        "description": `List of all competitions in the ${categoryName} category at Talentron.`,
        "itemListElement": filteredCompetitions.map((comp, index) => ({
            "@type": "Event",
            "position": index + 1,
            "name": comp.name,
            "description": comp.description,
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
                "@type": "Place",
                "name": "Zeal College of Engineering & Research",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Pune",
                    "addressCountry": "IN"
                }
            }
        }))
    };

    const handleCompClick = (comp: Competition) => {
        setSelectedComp(comp);
        document.body.style.overflow = 'hidden';
    };

    const handleClose = () => {
        setSelectedComp(null);
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
            <SEO 
                title={`${categoryName} Competitions — Talentron '26`}
                description={`View and register for ${categoryName} competitions at Talentron. Check rules, prizes, and show your talent on the big stage.`}
                keywords={`${categoryName} competition, Talentron events, ${categoryName} registration Pune`}
                schema={genreSchema}
            />
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

            <ModelPortal 
                isOpen={!!selectedComp} 
                onClose={handleClose}
                image={selectedComp?.image}
                imageAlt={selectedComp?.name}
                imageChildren={selectedComp && <div className="modal-type-tag">{selectedComp.type}</div>}
            >
                {selectedComp && (
                    <>
                        <span className="modal-cat">{selectedComp.category}</span>
                        <h2>{selectedComp.name}</h2>
                        <div className="modal-divider"></div>
                        <p className="modal-desc">{selectedComp.description}</p>
                        
                        <div className="modal-sections">
                            {selectedComp.rules && selectedComp.rules.length > 0 && (
                                <div className="modal-section">
                                    <h4>Rules</h4>
                                    <ul className="modal-rules-list">
                                        {selectedComp.rules.map((rule, i) => (
                                            <li key={i}>{rule}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="modal-section">
                                <h4>Prizes</h4>
                                <p>{selectedComp.prize || "Exciting awards for top performers."}</p>
                            </div>
                        </div>

                        <button 
                            className="register-now-cta"
                            onClick={() => navigate(`/competitions/${encodeURIComponent(categoryName)}/register?comp=${encodeURIComponent(selectedComp.name)}`)}
                        >
                            Register for Event
                        </button>
                    </>
                )}
            </ModelPortal>
        </div>
    );
};

export default GenrePage;
