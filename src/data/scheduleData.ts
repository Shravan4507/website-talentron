export interface ScheduleEvent {
    id: string;
    time: string;
    name: string;
    venue: string;
    category: string;
    description: string;
    type: 'flagship' | 'regular' | 'ceremony';
}

export interface DaySchedule {
    day: number;
    date: string;
    events: ScheduleEvent[];
}

export const scheduleData: DaySchedule[] = [
    {
        day: 1,
        date: "March 16, 2026",
        events: [
            {
                id: "1-1",
                time: "09:00 AM",
                name: "Elimination Rounds Kickoff",
                venue: "Zeal Campus - Main Auditorium",
                category: "General",
                description: "The screening process begins for all registered participants across categories.",
                type: "ceremony"
            },
            {
                id: "1-2",
                time: "11:30 AM",
                name: "Solo Singing (Eliminations)",
                venue: "Music Studio",
                category: "Singing & Music",
                description: "Preliminary rounds for the vocal powerhouse competition.",
                type: "regular"
            },
            {
                id: "1-3",
                time: "02:00 PM",
                name: "Dance Battles (Eliminations)",
                venue: "Dance Hall",
                category: "Dance",
                description: "筛选 (Selection) for the top dance acts of Talentron '26.",
                type: "regular"
            }
        ]
    },
    {
        day: 2,
        date: "March 23, 2026",
        events: [
            {
                id: "2-1",
                time: "10:00 AM",
                name: "Grand Opening - Talentron '26",
                venue: "ZCOER Main Stadium",
                category: "General",
                description: "The official start of the main festival with celebrity guests and mega performances.",
                type: "ceremony"
            },
            {
                id: "2-2",
                time: "01:00 PM",
                name: "Fashion Show (Flagship)",
                venue: "Main Stage",
                category: "Fashion",
                description: "Premium modeling and lifestyle competition for the ultimate crown.",
                type: "flagship"
            },
            {
                id: "2-3",
                time: "06:00 PM",
                name: "Mega Concert & Results",
                venue: "Festival Ground",
                category: "Music",
                description: "Live concert followed by the grand crowning of Talentron winners.",
                type: "ceremony"
            }
        ]
    }
];
