import React from 'react';
import { Link } from 'react-router-dom';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import SEO from '../../components/navigation/SEO';
import './Home.css';

const Home: React.FC = () => {
    const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Talentron '26",
        "description": "Pune's Ultimate Inter-Collegiate Cultural Festival featuring competitions in Dance, Music, Acting, Fashion, and Fine Arts.",
        "startDate": "2026-03-16T09:00:00+05:30",
        "endDate": "2026-03-23T22:00:00+05:30",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
            "@type": "Place",
            "name": "Zeal College of Engineering & Research",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Narhe",
                "addressLocality": "Pune",
                "postalCode": "411041",
                "addressCountry": "IN"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "Zeal Education Society",
            "url": "https://talentron.com"
        }
    };

    return (
        <div className="home-page">
            <SEO 
                title="Talentron '26 — Pune's Ultimate Cultural Fest"
                description="Join Talentron '26 at Zeal College Pune. Experience the biggest college cultural festival with competitions in music, dance, fashion and more. Prize pool worth ₹1,00,000+!"
                keywords="Talentron 2026, Zeal College fest, Pune cultural festival, college competitions, Pune talent show, Talentron registrations"
                schema={eventSchema}
            />
            <div className="home-hero">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="ZEAL EDUCATION SOCIETY'S" 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff00ea 0%, #7000ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="TALENTRON '26" 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff5e00 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <p className="hero-tagline">Pune's Ultimate Inter-Collegiate Cultural Festival</p>
                <Link to="/competitions" className="massive-cta">Enter the Arena</Link>
            </div>

            <div className="home-sections">
                <section className="highlights-grid">
                    <div className="highlight-card">
                        <div className="card-icon">🏆</div>
                        <h3>MEGA PRIZE POOL</h3>
                        <p>Compete for prizes worth ₹1,00,000+ across all genres. Glory is just one performance away.</p>
                    </div>
                    <div className="highlight-card">
                        <div className="card-icon">🌟</div>
                        <h3>CELEBRITY JURORS</h3>
                        <p>Get judged by industry leaders, viral creators, and legendary artists in their fields.</p>
                    </div>
                    <div className="highlight-card">
                        <div className="card-icon">⚡</div>
                        <h3>ELECTRIC VIBE</h3>
                        <p>Experience the sheer energy of 10,000+ students cheering for the next big talent.</p>
                    </div>
                </section>

                <section className="category-preview">
                    <div className="section-header">
                        <h2>CHOOSE YOUR STAGE</h2>
                        <div className="line"></div>
                    </div>
                    <div className="preview-pills">
                        <span>DANCE</span>
                        <span>MUSIC</span>
                        <span>ACTING</span>
                        <span>FASHION</span>
                        <span>GAMING</span>
                        <span>FINE ARTS</span>
                    </div>
                    <p>From the spotlight of the Main Stage to the digital battlegrounds, we have a place for every soul.</p>
                </section>

                <section className="home-venue-section">
                    <div className="venue-card">
                        <div className="venue-header">
                            <span className="location-pin">📍</span>
                            <h3>THE VENUE</h3>
                        </div>
                        <h2>Zeal College of Engineering & Research</h2>
                        <p>Narhe, Pune - 411041. The heart of the Talentron legacy.</p>
                        <div className="venue-stats">
                            <div className="v-stat">
                                <span>16th MARCH</span>
                                <small>ELIMINATIONS</small>
                            </div>
                            <div className="v-stat">
                                <span>23rd MARCH</span>
                                <small>GRAND FINALE</small>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="home-final-cta">
                <h2>READY TO BE THE NEXT LEGEND?</h2>
                <div className="cta-links">
                    <Link to="/login" className="cta-btn primary">REGISTER NOW</Link>
                    <Link to="/schedule" className="cta-btn secondary">VIEW SCHEDULE</Link>
                </div>
            </div>
            
            <div className="big-background-text">ARENA</div>
        </div>
    );
};

export default Home;
