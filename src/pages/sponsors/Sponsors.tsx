import React, { useState } from 'react';
import ChromaGrid, { type ChromaItem } from '../../components/grid/ChromaGrid';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './Sponsors.css';

interface SponsorItem extends ChromaItem {
    description: string;
}

const Sponsors: React.FC = () => {
    const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);

    const items: SponsorItem[] = [
        {
            image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=600&h=400&auto=format&fit=crop",
            title: "TechGiant Corp",
            subtitle: "Platinum Partner",
            handle: "Cloud Computing",
            borderColor: "#ff0059",
            gradient: "linear-gradient(145deg, rgba(255, 0, 89, 0.2), #000)",
            description: "TechGiant Corp is a global leader in cloud infrastructure and digital transformation. With over two decades of innovation, they provide the backbone for modern web services and enterprise solutions. Their partnership with Talentron aims to bridge the gap between academic learning and industry-scale cloud architecture.",
            url: "https://google.com"
        },
        {
            image: "https://images.unsplash.com/photo-1614850523459-c2f4c699552e?q=80&w=600&h=400&auto=format&fit=crop",
            title: "Future Systems",
            subtitle: "Platinum Partner",
            handle: "Artificial Intelligence",
            borderColor: "#3600cc",
            gradient: "linear-gradient(145deg, rgba(54, 0, 204, 0.2), #000)",
            description: "Future Systems specializes in frontier AI research and deployment. Their mission is to ensure that artificial general intelligence benefits all of humanity. Through Talentron, they hope to discover the next generation of AI researchers and machine learning engineers.",
            url: "https://openai.com"
        },
        {
            image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&h=400&auto=format&fit=crop",
            title: "Alpha Dynamics",
            subtitle: "Gold Partner",
            handle: "Robotics",
            borderColor: "#ffc800",
            gradient: "linear-gradient(145deg, rgba(255, 200, 0, 0.15), #000)",
            description: "Leading the way in autonomous robotics and industrial automation, Alpha Dynamics creates solutions for the factories of tomorrow.",
            url: "#"
        },
        {
            image: "https://images.unsplash.com/photo-1551288049-bbda48658a7d?q=80&w=600&h=400&auto=format&fit=crop",
            title: "Nova Solutions",
            subtitle: "Gold Partner",
            handle: "Software Dev",
            borderColor: "#00d4ff",
            gradient: "linear-gradient(145deg, rgba(0, 212, 255, 0.15), #000)",
            description: "Nova Solutions provides high-end software consulting and bespoke development services for Fortune 500 companies.",
            url: "#"
        },
        {
            image: "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=600&h=400&auto=format&fit=crop",
            title: "Quantum Labs",
            subtitle: "Gold Partner",
            handle: "Compute Services",
            borderColor: "#8b5cf6",
            gradient: "linear-gradient(145deg, rgba(139, 92, 246, 0.15), #000)",
            description: "Quantum Labs is at the forefront of quantum computing research, exploring new horizons in data processing speeds.",
            url: "#"
        },
        {
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&h=400&auto=format&fit=crop",
            title: "ByteWorks",
            subtitle: "Silver Partner",
            handle: "Data Analytics",
            borderColor: "#10b981",
            gradient: "linear-gradient(145deg, rgba(16, 185, 129, 0.1), #000)",
            description: "ByteWorks helps startups turn raw data into actionable insights through advanced analytical tools.",
            url: "#"
        },
        {
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&h=400&auto=format&fit=crop",
            title: "Cyber Armor",
            subtitle: "Silver Partner",
            handle: "Security",
            borderColor: "#ef4444",
            gradient: "linear-gradient(145deg, rgba(239, 68, 68, 0.1), #000)",
            description: "Specializing in zero-trust architecture and proactive threat hunting for the modern enterprise.",
            url: "#"
        }
    ];

    const handleItemClick = (item: ChromaItem) => {
        setSelectedSponsor(item as SponsorItem);
    }

    const closeOverlay = () => setSelectedSponsor(null);

    return (
        <div className="sponsors-page">
            <div className="sponsors-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="STRATEGIC ALLIANCE" 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff0059 0%, #ff4d8d 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="OUR ECOSYSTEM" 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff0070 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <p className="sponsors-description">
                    Celebrating the organizations that fuel the future of technical excellence.
                </p>
            </div>

            <div className="sponsors-grid-container">
                <ChromaGrid 
                    items={items}
                    radius={350}
                    damping={0.45}
                    fadeOut={0.6}
                    ease="power3.out"
                    columns={3}
                    onItemClick={handleItemClick}
                />
            </div>

            <div className="become-partner-footer">
                <button className="be-partner-btn">Partner With Us</button>
            </div>

            {/* Sponsor Detail Modal Overlay */}
            {selectedSponsor && (
                <div className="sponsor-modal-overlay" onClick={closeOverlay}>
                    <div className="sponsor-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeOverlay}>&times;</button>
                        <div className="modal-main-grid">
                            <div className="modal-image-col">
                                <img src={selectedSponsor.image} alt={selectedSponsor.title} />
                                <div className="modal-tier-badge">{selectedSponsor.subtitle}</div>
                            </div>
                            <div className="modal-info-col">
                                <h2>{selectedSponsor.title}</h2>
                                <span className="modal-industry">{selectedSponsor.handle}</span>
                                <div className="modal-divider"></div>
                                <p className="modal-description">{selectedSponsor.description}</p>
                                <div className="modal-footer">
                                    <a 
                                        href={selectedSponsor.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="visit-website-btn"
                                    >
                                        Visit Website
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sponsors;
