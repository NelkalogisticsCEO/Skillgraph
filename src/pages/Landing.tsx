import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/TopNav";
import {
  MapPin, Users, Sparkles, BadgeCheck, Bell, Trophy, ArrowRight, Radar, Filter,
} from "lucide-react";
import heroImg from "@/assets/hero-map.jpg";

const FEATURES = [
  { icon: Radar, title: "Live GPS Discovery", desc: "Find skilled people around you in real time on an interactive map." },
  { icon: Filter, title: "Skill Filters", desc: "Filter by skill, proficiency, age, and availability — instantly." },
  { icon: Trophy, title: "Skill Ranks", desc: "Earn Bronze → Elite ranks from endorsements and verifications." },
  { icon: BadgeCheck, title: "Verified Identity", desc: "LinkedIn + face authentication keeps the network real." },
  { icon: Users, title: "Communities & Meetups", desc: "Create local groups, schedule meetups, RSVP from the map." },
  { icon: Bell, title: "Smart Proximity Alerts", desc: "Get pinged when someone matching your criteria is nearby." },
];

const Landing = () => (
  <div className="min-h-screen">
    <TopNav />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="container relative grid lg:grid-cols-2 gap-12 py-20 lg:py-28 items-center">
        <div className="fade-up space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Live, location-based discovery
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            The world's <span className="text-gradient">skill map</span>, live around you.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            SkillGraph connects you with verified professionals, hobbyists and friends nearby — by skill, proximity and shared interest.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="hero" size="xl">
              <Link to="/signup">Join SkillGraph <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/map">Explore the map</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> LinkedIn verified</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Real-time GPS</div>
            <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Skill ranks</div>
          </div>
        </div>

        <div className="relative fade-up float">
          <div className="absolute -inset-8 bg-gradient-primary opacity-30 blur-3xl rounded-full" />
          <img
            src={heroImg}
            alt="Glowing world map of connected professionals"
            width={1536} height={1024}
            className="relative rounded-2xl border border-border shadow-elegant w-full h-auto"
          />
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
          A new way to <span className="text-gradient">meet talent</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Six powerful tools, one beautifully simple experience.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container pb-24">
      <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50 pointer-events-none" />
        <div className="relative space-y-5 max-w-xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to find your people?</h2>
          <p className="text-muted-foreground">
            Sign up free. Verify your identity. Discover talent within 1 km.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/signup">Create your account</Link>
          </Button>
        </div>
      </div>
    </section>

    <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
      © 2026 SkillGraph · Built with ❤️ for human connection
    </footer>
  </div>
);

export default Landing;
