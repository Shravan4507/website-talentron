import React from 'react';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import SEO from '../../components/navigation/SEO';
import './About.css';

const About: React.FC = () => {
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Talentron",
        "alternateName": "Talentron '26",
        "url": "https://talentron.com",
        "logo": "https://talentron.com/vite.svg",
        "description": "Talentron is Pune's leading inter-collegiate cultural festival, hosted by Zeal Education Society.",
        "parentOrganization": {
            "@type": "Organization",
            "name": "Zeal Education Society"
        },
        "location": {
            "@type": "Place",
            "name": "Pune, Maharashtra"
        }
    };

    return (
        <div className="about-page">
            <SEO 
                title="About Talentron — The Legacy of Zeal College Cultural Fest"
                description="Discover the story behind Talentron, Pune's premier college cultural festival. Learn about our vision to empower student artists and our 50+ explosive yearly events."
                keywords="Talentron history, Zeal College culture, Pune college festival mission, student artist empowerment"
                schema={orgSchema}
            />
            <div className="about-hero">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="ESTABLISHED IN LEGACY" 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff00ea 0%, #7000ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="THE TALENTRON STORY" 
                        fillColor="linear-gradient(180deg, #fff 0%, #aaa 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
            </div>

            <div className="about-grid">
                <div className="about-text-card">
                    <h2>Unleashing the Extraordinary</h2>
                    <p>
                        Talentron is more than just a festival; it's a monumental platform where the raw energy of youth meets the refined discipline of art. Hosted annually at <strong>Zeal College of Engineering and Research</strong>, it stands as Pune's premier stage for creators, thinkers, and performers.
                    </p>
                    <p>
                        Started as a vision to bridge the gap between academic excellence and creative expression, Talentron has grown into a legacy that defines the cultural heartbeat of Narhe campus.
                    </p>
                </div>

                <div className="about-stats">
                    <div className="stat-pill">
                        <span className="stat-num">50+</span>
                        <span className="stat-label">EXPLOSIVE EVENTS</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">10K+</span>
                        <span className="stat-label">YEARLY ATTENDEES</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">20+</span>
                        <span className="stat-label">GENRES COVERED</span>
                    </div>
                </div>

                <div className="vision-section">
                    <div className="vision-card">
                        <div className="vision-icon">✨</div>
                        <h3>OUR VISION</h3>
                        <p>To identify, empower, and celebrate the diverse talents that often remain hidden behind the screens of academia.</p>
                    </div>
                    <div className="vision-card accent">
                        <div className="vision-icon">🚀</div>
                        <h3>OUR MISSION</h3>
                        <p>Providing a world-class stage with industry-standard judging to help students transition from campus stars to global creators.</p>
                    </div>
                </div>
            </div>

            <div className="about-footer-text">
                <OutlinedTitle 
                    text="JOIN THE LEGACY" 
                    fillColor="linear-gradient(180deg, #00d1ff 0%, #0047ff 100%)" 
                    outlineColor="#000000" 
                    shadowColor="#000000"
                    hasGrain={true}
                />
                <p>Talentron '26 — Narhe, Pune</p>
            </div>

            <div className="about-bg-text">CULTURE</div>
        </div>
    );
};

export default About;
