export interface Competition {
  category: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rules?: string[];
  prize?: string;
}

export const competitionsData: Competition[] = [
  // Music
  { 
    category: "Music", 
    name: "Hindi Singing", 
    type: "Solo", 
    description: "Showcase your vocal talent with soulful Hindi melodies, from classical to contemporary hits.",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    rules: ["Time limit: 3-5 minutes", "Backing tracks allowed", "No offensive lyrics"],
    prize: "Trophies and Cash Prizes for Top 3"
  },
  { 
    category: "Music", 
    name: "Classical Singing", 
    type: "Solo", 
    description: "A platform for traditional classical vocalists to display their mastery of ragas and rhythm.",
    image: "https://images.unsplash.com/photo-1520529277867-dbf8c5e0b340?q=80&w=800&auto=format&fit=crop",
    rules: ["Purely classical based", "Aalap and Taan required", "Time limit: 6-8 minutes"],
    prize: "Certificates of Excellence and Cash Awards"
  },
  { 
    category: "Music", 
    name: "Rap", 
    type: "Solo", 
    description: "Dominate the mic with your rhythm, flow, and lyrical prowess in this high-energy battle.",
    image: "https://images.unsplash.com/photo-1571453272461-93d36a928926?q=80&w=800&auto=format&fit=crop",
    rules: ["Original lyrics only", "No profanity", "Flow and delivery focus"],
    prize: "Studio Recording Session and Cash Prize"
  },
  { 
    category: "Music", 
    name: "Instrumental Performance", 
    type: "Solo / Duo", 
    description: "Let your instruments speak. A display of technical skill across any musical instrument.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop",
    rules: ["Bring your own instruments", "No pre-recorded music", "Max 5 minutes"],
    prize: "Recognition Trophy and Prizes"
  },

  // Dance
  { 
    category: "Dance", 
    name: "Non-Thematic Dance", 
    type: "Group", 
    description: "High-energy choreography focusing on synchronization, power, and pure dance technique.",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    rules: ["Team size: 6-15 members", "Music must be submitted prior", "Focus on energy and sync"],
    prize: "Best Group Performance Award"
  },
  { 
    category: "Dance", 
    name: "Thematic Dance", 
    type: "Group", 
    description: "Storytelling through movement. Narrative-driven performances that convey a message.",
    image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop",
    rules: ["Clear theme required", "Props allowed", "Narrative clarity"],
    prize: "Most Creative Theme Award"
  },
  { 
    category: "Dance", 
    name: "Folk & Classical Dance", 
    type: "Solo / Group", 
    description: "Celebrating the rich heritage of traditional Indian folk and classical dance forms.",
    image: "https://images.unsplash.com/photo-1582230325493-2713f01fdf96?q=80&w=800&auto=format&fit=crop",
    rules: ["Authenticity of form", "Traditional costumes required", "Original music preferred"],
    prize: "Heritage Excellence Award"
  },

  // Dramatics
  { 
    category: "Dramatics", 
    name: "Street Play", 
    type: "Group", 
    description: "Raw and socially relevant theatre performed in open spaces to awaken and inspire.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop",
    rules: ["Outdoor performance style", "Social relevance", "Minimum 8 performers"],
    prize: "Best Nukkad Natak Award"
  },
  { 
    category: "Dramatics", 
    name: "Stage Play", 
    type: "Group", 
    description: "Full-scale theatrical productions brought to life with lights, sound, and intensity.",
    image: "https://images.unsplash.com/photo-1503095396549-80703901828b?q=80&w=800&auto=format&fit=crop",
    rules: ["Max 20 minutes", "Set setup time: 5 mins", "Scripts must be reviewed"],
    prize: "Best Production Trophy"
  },
  { 
    category: "Dramatics", 
    name: "Silent Theatre", 
    type: "Group", 
    description: "The art of mime and physical expression. Communicating deep ideas without words.",
    image: "https://images.unsplash.com/photo-1514302240736-b1fee59ee562?q=80&w=800&auto=format&fit=crop",
    rules: ["No spoken words allowed", "Focus on facial expressions", "Group size: 4-10"],
    prize: "Excellence in Mime Award"
  },

  // Speaking Arts
  { 
    category: "Speaking Arts", 
    name: "English Slam Poetry", 
    type: "Solo", 
    description: "Spoken word poetry that hits hard with linguistic flair and emotional depth.",
    image: "https://images.unsplash.com/photo-1475721021914-90bda207ec1c?q=80&w=800&auto=format&fit=crop",
    rules: ["Original poems only", "No props", "Time limit: 3 minutes"],
    prize: "Best Orator Award"
  },
  { 
    category: "Speaking Arts", 
    name: "Hindi Slam Poetry", 
    type: "Solo", 
    description: "Express your heart through the rhythmic beauty and intensity of Hindi slam poetry.",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=800&auto=format&fit=crop",
    rules: ["Pure Hindi/Urdu content", "No reading from paper", "Emotional impact"],
    prize: "Kavi Excellence Prize"
  },
  { 
    category: "Speaking Arts", 
    name: "Stand-up Comedy", 
    type: "Solo", 
    description: "A battle of wits where you dominate the stage with your humor and perspective.",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedee6?q=80&w=800&auto=format&fit=crop",
    rules: ["Original sets only", "Respect audience", "Time: 5 minutes"],
    prize: "Laugh Riot Trophy"
  },

  // Fine Arts
  { 
    category: "Fine Arts", 
    name: "Painting", 
    type: "Solo", 
    description: "Create a world of your own with colors and brushes in this on-the-spot challenge.",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=800&auto=format&fit=crop",
    rules: ["Theme provided on-spot", "Bring your own colors", "Canvas provided"],
    prize: "Masterpiece Award"
  },
  { 
    category: "Fine Arts", 
    name: "Sketching", 
    type: "Solo", 
    description: "The monochrome dream. Focus on detailing and shading with pencils and charcoal.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    rules: ["Graphite/Charcoal only", "Paper size: A3", "No digital aid"],
    prize: "Visionary Sketch Award"
  },

  // Digital Arts
  { 
    category: "Digital Arts", 
    name: "Short Filmmaking", 
    type: "Group", 
    description: "Capture cinematic stories and showcase your directing, editing, and acting skills.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop",
    rules: ["Duration: 5-10 mins", "Format: MP4/MOV", "Original content only"],
    prize: "Best Director Award"
  },
  { 
    category: "Digital Arts", 
    name: "Ad Making", 
    type: "Group", 
    description: "Merge creativity with branding. Create a compelling 60-second advertisement.",
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fce?q=80&w=800&auto=format&fit=crop",
    rules: ["Focus on creativity", "Sound quality matters", "Logo usage allowed"],
    prize: "Creative Genius Award"
  },
  { 
    category: "Digital Arts", 
    name: "Offline/Online Photography", 
    type: "Solo", 
    description: "Capture the perfect moment. A challenge for both on-field and digital photographers.",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop",
    rules: ["No heavy editing", "Original EXIF data", "Theme based"],
    prize: "Shutter Excellence Trophy"
  },

  // Fashion and Lifestyle
  { 
    category: "Fashion and Lifestyle", 
    name: "Fashion Competition", 
    type: "Group", 
    description: "Set the runway on fire with your team's style, walk, and thematic outfits.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    rules: ["Team size: 8-12", "Theme required", "Walk duration: 3-5 mins"],
    prize: "Best Fashion Team Award"
  },
  { 
    category: "Fashion and Lifestyle", 
    name: "Beauty Pageant", 
    type: "Solo", 
    description: "A search for the next icon. Evaluating grace, personality, and intelligence.",
    image: "https://images.unsplash.com/photo-1496291163653-efcc85c3fe2f?q=80&w=800&auto=format&fit=crop",
    rules: ["Talent round included", "Q&A session", "Formal attire"],
    prize: "Talentron Icon 2026"
  },
  { 
    category: "Fashion and Lifestyle", 
    name: "Cosplay", 
    type: "Solo", 
    description: "Bring fictional characters to life with intricate costumes and roleplay performances.",
    image: "https://images.unsplash.com/photo-1541562232579-2287c8a6f3a7?q=80&w=800&auto=format&fit=crop",
    rules: ["Character similarity", "Craftsmanship focus", "Prop safety check"],
    prize: "Best Cosplayer Award"
  }
];
