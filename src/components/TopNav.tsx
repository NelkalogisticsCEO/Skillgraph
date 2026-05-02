import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Map, User, Users, Bell, Settings, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/map", label: "Map", icon: Map },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile/me", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const TopNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAuthed = !!user;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" aria-label="SkillGraph home">
            {/* Logo placeholder — drop your logo image here */}
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-[10px] font-semibold uppercase tracking-wide text-primary/70 transition-colors group-hover:border-primary/60"
              aria-label="Logo placeholder"
            >
              Logo
            </div>
            <span className="text-lg font-bold tracking-tight">
              Skill<span className="text-gradient">Graph</span>
            </span>
          </Link>

          {isAuthed ? (
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#communities" className="hover:text-foreground transition-colors">Communities</a>
            </nav>
          )}

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                Log out
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/login"><LogIn className="h-4 w-4" />Log in</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {isAuthed && (
        <nav className="md:hidden glass border-b border-border/50">
          <div className="flex items-center justify-around py-2">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
