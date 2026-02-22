import { useNavigate } from 'react-router-dom';
import { competitionsData } from '../../data/competitionsData';
import PopArtCard from '../../components/card/PopArtCard';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import SEO from '../../components/navigation/SEO';
import { assetPath } from '../../utils/assetPath';
import './Competitions.css';

const getGenreImage = (category: string) => {
    const images: Record<string, string> = {
        "Music": assetPath("/assets/cards/music.webp"),
        "Dance": assetPath("/assets/cards/dance.webp"),
        "Dramatics": assetPath("/assets/cards/drama.webp"),
        "Speaking Arts": assetPath("/assets/cards/speaking-arts.webp"),
        "Fine Arts": assetPath("/assets/cards/fine-arts.webp"),
        "Digital Arts": assetPath("/assets/cards/digital-arts.webp"),
        "Fashion and Lifestyle": assetPath("/assets/cards/fashion-lifestyle.webp"),
    };
    return images[category] || assetPath("/assets/cards/music.webp");
};

const Competitions: React.FC = () => {
    const navigate = useNavigate();

    // Get unique categories
    const categories = Array.from(new Set(competitionsData.map(c => c.category))).map(cat => ({
        name: cat
    }));

    const listSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": categories.map((cat, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": cat.name,
            "url": `https://talentron.com/competitions/${encodeURIComponent(cat.name)}`
        }))
    };

    return (
        <div className="competitions-page">
            <SEO 
                title="Enter the Arena — Competition Categories"
                description="Explore the diverse range of competitions at Talentron '26. From Dance and Music to Fashion and Digital Arts, choose your stage and showcase your talent."
                keywords="Talentron competitions, dance competition Pune, music competition Pune, college fashion show, fine arts contest"
                schema={listSchema}
            />
            <div className="comp-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text="THE STAGE IS YOURS" 
                        className="small"
                        fillColor="linear-gradient(180deg, #00d1ff 0%, #0047ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="ART FORMS" 
                        fillColor= "linear-gradient(180deg, #f0ff00 0%, #ff0070 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <p className="comp-description">Choose your category to explore competitions</p>
            </div>

            <div className="competitions-grid">
                {categories.map((cat, index) => (
                    <PopArtCard
                        key={index}
                        backgroundImage={getGenreImage(cat.name)}
                        footerText="VIEW GENRE"
                        onClick={() => navigate(`/competitions/${encodeURIComponent(cat.name)}`)}
                        animationDelay={`${index * 0.05}s`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Competitions;
