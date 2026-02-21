import React from 'react';
import ChromaGrid, { type ChromaItem } from '../../components/grid/ChromaGrid';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './Team.css';

interface TeamMember extends ChromaItem {
    socials?: {
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
    description?: string;
}

const ALL_MEMBERS: TeamMember[] = [
    // Core Leadership
    {
        image: `https://raw.githubusercontent.com/Shravan4507/Nirmaan26-Assets/main/members/Shravan%20G.png`,
        title: 'Shravan G',
        subtitle: 'Event Lead',
        location: 'Core Leadership',
        handle: '@shravan45x',
        description: 'Visionary leader driving the strategic direction of Nirmaan \'26. Passionate about creating a platform where technology meets creativity. Leading over 100+ volunteers to deliver a world-class experience.',
        borderColor: '#5227FF',
        gradient: 'linear-gradient(145deg, #5227FF, #000)',
        url: 'https://instagram.com/shravan45x',
        socials: {
            instagram: 'https://instagram.com/shravan45x',
            linkedin: 'https://www.linkedin.com/in/shravan45x',
            twitter: 'https://x.com/shravan45z',
            github: 'https://github.com/Shravan4507'
        }
    },
    {
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Sanya Malhotra',
        subtitle: 'Technical Head',
        location: 'Core Leadership',
        handle: '@sanya_tech',
        description: 'Engineering wizard managing all technical infrastructures. Dedicated to delivering a seamless digital experience for all festival participants. Architected the core event handling systems.',
        borderColor: '#d9ff00',
        gradient: 'linear-gradient(180deg, #d9ff00, #000)',
        url: 'https://github.com/Shravan4507',
        socials: {
            linkedin: '#',
            github: 'https://github.com/Shravan4507',
            instagram: '#'
        }
    },
    {
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Rohan Verma',
        subtitle: 'Management Lead',
        location: 'Core Leadership',
        handle: '@rohan_verma',
        description: 'Organizational expert ensuring coordination between all departments. Focused on operational excellence and resource optimization. Streamlined the internal logistics for the entire festival cycle.',
        borderColor: '#5227FF',
        gradient: 'linear-gradient(145deg, #5227FF, #000)',
        url: 'https://linkedin.com/',
        socials: {
            linkedin: '#',
            twitter: '#'
        }
    },
    // Technical & Design
    {
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Ishaan Gupta',
        subtitle: 'Full Stack Developer',
        location: 'Technical & Design',
        handle: '@ishaan_dev',
        description: 'Building the future of the web, one line of code at a time. Expert in modern React architectures and scalable backend systems. Passionate about Open Source contributions.',
        borderColor: '#d9ff00',
        gradient: 'linear-gradient(210deg, #d9ff00, #000)',
        url: 'https://github.com/Shravan4507',
        socials: {
            github: 'https://github.com/Shravan4507',
            linkedin: '#'
        }
    },
    {
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Ananya Deshpande',
        subtitle: 'Chief Designer',
        location: 'Technical & Design',
        handle: '@ananya_design',
        description: 'Crafting the visual identity of Nirmaan. Bringing aesthetic elegance and user-centric design to every digital touchpoint. Created the unique grainient branding for this year.',
        borderColor: '#5227FF',
        gradient: 'linear-gradient(165deg, #5227FF, #000)',
        url: 'https://instagram.com/ananya_design',
        socials: {
            instagram: '#',
            linkedin: '#'
        }
    },
    {
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Vikram Singh',
        subtitle: 'UI/UX Lead',
        location: 'Technical & Design',
        handle: '@vikram_ux',
        description: 'Specializing in creating intuitive and engaging user journeys. Bridging the gap between complex technology and human interaction. Focused on accessibility and performance.',
        borderColor: '#d9ff00',
        gradient: 'linear-gradient(195deg, #d9ff00, #000)',
        url: 'https://linkedin.com/',
        socials: {
            linkedin: '#',
            twitter: '#'
        }
    },
    // Marketing & PR
    {
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Kritika Roy',
        subtitle: 'PR Coordinator',
        location: 'Marketing & PR',
        handle: '@kritika_pr',
        description: 'Voice of the festival, managing external communications and media relations. Dedicated to building strong brand authority.',
        borderColor: '#5227FF',
        gradient: 'linear-gradient(225deg, #5227FF, #000)',
        url: 'https://linkedin.com/',
        socials: {
            linkedin: '#',
            twitter: '#'
        }
    },
    {
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=300&auto=format&fit=crop',
        title: 'Sahil Kapoor',
        subtitle: 'Marketing Head',
        location: 'Marketing & PR',
        handle: '@sahil_mkt',
        description: 'Strategic marketer expanding the reach of Nirmaan across the nation. Expertise in digital campaigns and audience engagement.',
        borderColor: '#d9ff00',
        gradient: 'linear-gradient(135deg, #d9ff00, #000)',
        url: 'https://linkedin.com/',
        socials: {
            linkedin: '#',
            twitter: '#'
        }
    }
];

const Team: React.FC = () => {
    return (
        <main className="team-page">
            <header className="team-header">
                <div className="header-glow"></div>
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="THE ARCHITECTS" 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff00ea 0%, #7000ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="TEAM CORE" 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff5e00 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <p className="team-description">Meet the dedicated team working behind the scenes to make Talentron '26 the biggest technology festival of the year.</p>
            </header>

            <div className="team-container">
                <ChromaGrid
                    items={ALL_MEMBERS}
                    radius={400}
                    damping={0.5}
                    fadeOut={0.8}
                    columns={3}
                    showRegister={false}
                />
            </div>
        </main>
    );
};

export default Team;
