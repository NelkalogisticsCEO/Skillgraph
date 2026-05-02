// Mock current user + nearby people for the map shell
export type SkillLevel = "Beginner" | "Intermediate" | "Expert";
export type RankTier = "Bronze" | "Silver" | "Gold" | "Elite";
export type Availability = "Open" | "Busy";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface NearbyUser {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  lat: number;
  lng: number;
  skills: Skill[];
  rank: RankTier;
  linkedinVerified: boolean;
  availability: Availability;
  age: number;
  interests: string[];
}

// Centered around London for the demo
export const CURRENT_USER = {
  id: "me",
  name: "You",
  lat: 51.5074,
  lng: -0.1278,
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0ea5e9,06b6d4,14b8a6`;

export const NEARBY_USERS: NearbyUser[] = [
  {
    id: "u1", name: "Aiden Carter", headline: "Senior AI Engineer",
    avatar: avatar("Aiden"),
    lat: 51.5102, lng: -0.1340,
    skills: [{ name: "AI", level: "Expert" }, { name: "Python", level: "Expert" }, { name: "Engineering", level: "Expert" }],
    rank: "Elite", linkedinVerified: true, availability: "Open", age: 29,
    interests: ["AI", "Boxing", "Chess"],
  },
  {
    id: "u2", name: "Maya Patel", headline: "Product Designer · Glassmorphic UIs",
    avatar: avatar("Maya"),
    lat: 51.5050, lng: -0.1200,
    skills: [{ name: "Design", level: "Expert" }, { name: "Figma", level: "Expert" }, { name: "Branding", level: "Intermediate" }],
    rank: "Gold", linkedinVerified: true, availability: "Open", age: 27,
    interests: ["Design", "Music", "Yoga"],
  },
  {
    id: "u3", name: "Diego Romero", headline: "Logistics & Ops Lead",
    avatar: avatar("Diego"),
    lat: 51.5012, lng: -0.1419,
    skills: [{ name: "Logistics", level: "Expert" }, { name: "Finance", level: "Intermediate" }],
    rank: "Gold", linkedinVerified: false, availability: "Busy", age: 34,
    interests: ["Logistics", "Football"],
  },
  {
    id: "u4", name: "Lina Schmidt", headline: "Music Producer",
    avatar: avatar("Lina"),
    lat: 51.5155, lng: -0.1100,
    skills: [{ name: "Music", level: "Expert" }, { name: "Production", level: "Expert" }],
    rank: "Silver", linkedinVerified: true, availability: "Open", age: 31,
    interests: ["Music", "Synths"],
  },
  {
    id: "u5", name: "Tomás Rivera", headline: "Boxing Coach · Strength Trainer",
    avatar: avatar("Tomas"),
    lat: 51.4990, lng: -0.1070,
    skills: [{ name: "Boxing", level: "Expert" }, { name: "Coaching", level: "Expert" }],
    rank: "Gold", linkedinVerified: false, availability: "Open", age: 36,
    interests: ["Boxing", "Fitness"],
  },
  {
    id: "u6", name: "Sara Nakamura", headline: "Renewable Energy Engineer",
    avatar: avatar("Sara"),
    lat: 51.5180, lng: -0.1505,
    skills: [{ name: "Engineering", level: "Expert" }, { name: "Green Energy", level: "Expert" }],
    rank: "Elite", linkedinVerified: true, availability: "Open", age: 30,
    interests: ["Green Energy", "Cycling"],
  },
  {
    id: "u7", name: "Jordan Blake", headline: "Junior Frontend Dev",
    avatar: avatar("Jordan"),
    lat: 51.5210, lng: -0.1190,
    skills: [{ name: "Engineering", level: "Beginner" }, { name: "Design", level: "Beginner" }],
    rank: "Bronze", linkedinVerified: false, availability: "Open", age: 22,
    interests: ["Gaming", "Music"],
  },
  {
    id: "u8", name: "Priya Singh", headline: "Quant Finance Analyst",
    avatar: avatar("Priya"),
    lat: 51.4940, lng: -0.1380,
    skills: [{ name: "Finance", level: "Expert" }, { name: "AI", level: "Intermediate" }],
    rank: "Gold", linkedinVerified: true, availability: "Busy", age: 28,
    interests: ["Finance", "Chess"],
  },
  {
    id: "u9", name: "Noah Williams", headline: "Indie Game Dev",
    avatar: avatar("Noah"),
    lat: 51.5290, lng: -0.1340,
    skills: [{ name: "Engineering", level: "Intermediate" }, { name: "Design", level: "Intermediate" }],
    rank: "Silver", linkedinVerified: false, availability: "Open", age: 25,
    interests: ["Gaming", "Music"],
  },
];

export const ALL_SKILLS = [
  "AI", "Engineering", "Design", "Finance", "Logistics",
  "Music", "Boxing", "Coaching", "Green Energy", "Branding",
  "Python", "Figma", "Production", "Fitness",
];
