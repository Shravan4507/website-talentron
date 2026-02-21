export interface Competition {
  category: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rules?: string[];
}

export const competitionsData: Competition[] = [
  // Singing & Music
  { 
    category: "Singing & Music", 
    name: "Hindi Solo Singing", 
    type: "Solo", 
    description: "A platform for vocalists to showcase their prowess in Hindi music, from Bollywood hits to soulful ghazals.",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Singing & Music", 
    name: "Solo Classical Singing", 
    type: "Solo", 
    description: "Experience the depth of Indian tradition with classical raga-based performances.",
    image: "https://images.unsplash.com/photo-1520529277867-dbf8c5e0b340?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Singing & Music", 
    name: "Solo Rap", 
    type: "Solo", 
    description: "Spit fire and dominate the stage with your rhythm, flow, and lyrical genius.",
    image: "https://images.unsplash.com/photo-1571453272461-93d36a928926?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Singing & Music", 
    name: "Instrumental Performance", 
    type: "Solo / Duo", 
    description: "Let your instruments speak. A display of technical skill and musical harmony.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop"
  },
  // Dance
  { 
    category: "Dance", 
    name: "Group Non-Thematic Dance", 
    type: "Group", 
    description: "Energetic and powerful group choreography focused on technique and synchronization.",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dance", 
    name: "Group Thematic Dance", 
    type: "Group", 
    description: "Tell a story through motion. Narrative-driven group performances that touch the soul.",
    image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dance", 
    name: "Solo Dance", 
    type: "Solo", 
    description: "A chance for individual dancers to shine and express their unique style on stage.",
    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dance", 
    name: "Group Folk & Classical Dance", 
    type: "Group", 
    description: "Celebrating the rich heritage of folk and classical dance forms in a group setup.",
    image: "https://images.unsplash.com/photo-1582230325493-2713f01fdf96?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dance", 
    name: "Solo Classical Dance", 
    type: "Solo", 
    description: "Intricate footwork and expressive mudras in the timeless tradition of classical dance.",
    image: "https://images.unsplash.com/photo-1502773860571-211a597d6e4b?q=80&w=800&auto=format&fit=crop"
  },
  // Dramatics
  { 
    category: "Dramatics", 
    name: "Street Play (Nukkad Natak)", 
    type: "Group", 
    description: "Raw, energetic, and socially relevant performances aimed at awakening the masses.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dramatics", 
    name: "Stage Play", 
    type: "Group", 
    description: "Classical and modern theatre productions brought to life under the bright stage lights.",
    image: "https://images.unsplash.com/photo-1503095396549-80703901828b?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Dramatics", 
    name: "Group Silent Theatre", 
    type: "Group", 
    description: "The art of mime and physical expression. Communicating profound ideas without a single word.",
    image: "https://images.unsplash.com/photo-1514302240736-b1fee59ee562?q=80&w=800&auto=format&fit=crop"
  },
  // Speaking Arts
  { 
    category: "Speaking Arts", 
    name: "English Slam Poetry", 
    type: "Solo", 
    description: "Powerful spoken word poetry that challenges the status quo with linguistic flair.",
    image: "https://images.unsplash.com/photo-1475721021914-90bda207ec1c?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Speaking Arts", 
    name: "Hindi Slam Poetry", 
    type: "Solo", 
    description: "Express your heart through the beauty and depth of the Hindi language.",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Speaking Arts", 
    name: "Stand-up Comedy", 
    type: "Solo", 
    description: "Tickle the funny bone with your wit, timing, and unique perspective on life.",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedee6?q=80&w=800&auto=format&fit=crop"
  },
  // Fine Arts
  { 
    category: "Fine Arts", 
    name: "Painting", 
    type: "Solo", 
    description: "Translate your imagination onto canvas with a brush and a vibrant palette.",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Fine Arts", 
    name: "Sketching", 
    type: "Solo", 
    description: "Master the play of light and shadow with your strokes and shading techniques.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop"
  },
  // Digital Arts
  { 
    category: "Digital Arts", 
    name: "Short Filmmaking", 
    type: "Group", 
    description: "The art of cinematic storytelling. Capture life through your lens and edit with vision.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Digital Arts", 
    name: "Ad Making", 
    type: "Group", 
    description: "Create impactful messages in a short span. Merging creativity with persuasion.",
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fce?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Digital Arts", 
    name: "Offline Photography", 
    type: "Solo", 
    description: "On-the-spot photography challenge where you capture the essence of the moment.",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Digital Arts", 
    name: "Online Photography", 
    type: "Solo", 
    description: "Submit your best shots taken around a given theme for digital curation.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop"
  },
  // Fashion & Lifestyle
  { 
    category: "Fashion & Lifestyle", 
    name: "Group Fashion Competition", 
    type: "Group", 
    description: "Set the runway on fire with your collective style, grace, and thematic walks.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Fashion & Lifestyle", 
    name: "Beauty Pageant", 
    type: "Solo", 
    description: "Celebrating beauty, brains, and elegance. A search for the next talent icon.",
    image: "https://images.unsplash.com/photo-1496291163653-efcc85c3fe2f?q=80&w=800&auto=format&fit=crop"
  },
  { 
    category: "Fashion & Lifestyle", 
    name: "Cosplay", 
    type: "Solo", 
    description: "Bring your favorite characters to life with intricate costumes and roleplay.",
    image: "https://images.unsplash.com/photo-1541562232579-2287c8a6f3a7?q=80&w=800&auto=format&fit=crop"
  }
];
