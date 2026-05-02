export type SkillLevel = "Beginner" | "Intermediate" | "Expert";
export type UserRole = "founder" | "talent" | "both";
export type PrimaryRole = "Founder" | "Developer" | "Designer" | "Marketing" | "Data" | "CTO" | "Finance" | "Ops";
export type LookingFor = "Cofounder" | "Collaborator" | "Advisor" | "Hiring" | "Mentorship";
export type Experience = "junior" | "mid" | "senior" | "expert";
export type Availability = "Open" | "Busy";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          headline: string | null;
          bio: string | null;
          avatar_url: string | null;
          role: UserRole;
          primary_role: PrimaryRole;
          looking_for: LookingFor;
          experience: Experience;
          lat: number | null;
          lng: number | null;
          availability: Availability;
          open_to_equity: boolean;
          full_time: boolean;
          age: number | null;
          linkedin_verified: boolean;
          linkedin_url: string | null;
          twitter_url: string | null;
          portfolio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          level: SkillLevel;
        };
        Insert: Omit<Database["public"]["Tables"]["skills"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
      };
      interests: {
        Row: {
          id: string;
          user_id: string;
          name: string;
        };
        Insert: Omit<Database["public"]["Tables"]["interests"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["interests"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type Interest = Database["public"]["Tables"]["interests"]["Row"];

export const PRIMARY_ROLES: PrimaryRole[] = ["Founder", "Developer", "Designer", "Marketing", "Data", "CTO", "Finance", "Ops"];
export const LOOKING_FOR_OPTIONS: LookingFor[] = ["Cofounder", "Collaborator", "Advisor", "Hiring", "Mentorship"];
export const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "junior", label: "Junior (0-2 yrs)" },
  { value: "mid", label: "Mid (3-5 yrs)" },
  { value: "senior", label: "Senior (6-10 yrs)" },
  { value: "expert", label: "Expert (10+ yrs)" },
];

export const ROLE_COLORS: Record<PrimaryRole, { bg: string; lt: string; bd: string }> = {
  Founder:   { bg: "#5b21b6", lt: "#f5f3ff", bd: "#ddd6fe" },
  Developer: { bg: "#075985", lt: "#f0f9ff", bd: "#bae6fd" },
  Designer:  { bg: "#92400e", lt: "#fffbeb", bd: "#fde68a" },
  Marketing: { bg: "#991b1b", lt: "#fef2f2", bd: "#fecaca" },
  Data:      { bg: "#065f46", lt: "#f0fdfa", bd: "#99f6e4" },
  CTO:       { bg: "#3730a3", lt: "#eef2ff", bd: "#c7d2fe" },
  Finance:   { bg: "#14532d", lt: "#f0fdf4", bd: "#bbf7d0" },
  Ops:       { bg: "#9d174d", lt: "#fdf2f8", bd: "#fbcfe8" },
};
