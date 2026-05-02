import { useState, useEffect, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Linkedin, Loader2, Briefcase, Search, ArrowRight, ArrowLeft, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { PRIMARY_ROLES, LOOKING_FOR_OPTIONS, EXPERIENCE_OPTIONS, ROLE_COLORS, type PrimaryRole, type LookingFor, type Experience } from "@/types/database";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password required"),
});

const COMMON_SKILLS = [
  "React", "Node.js", "Python", "TypeScript", "AWS", "Go", "Postgres", "Swift", "iOS",
  "Figma", "Branding", "Webflow", "UI/UX",
  "Growth", "SEO", "Content", "GTM", "Sales",
  "Fundraising", "FP&A", "VC", "Finance",
  "PyTorch", "NLP", "LLMs", "Data Science",
  "Kubernetes", "DevOps", "Firebase",
  "Agile", "Product", "Operations",
];

const VERTICALS = [
  "Fintech", "Health Tech", "SaaS", "EdTech", "E-commerce", "Climate",
  "HR Tech", "Logistics", "AI/ML", "Media", "Consumer", "B2B",
];

const Shell = ({ title, subtitle, children, footer, wide }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode; wide?: boolean }) => (
  <div className="min-h-screen flex flex-col">
    <div className="absolute inset-0 bg-gradient-hero pointer-events-none -z-10" />
    <header className="container py-6">
      <Link to="/" className="inline-flex items-center gap-3" aria-label="SkillGraph home">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-[10px] font-semibold uppercase tracking-wide text-primary/70"
          aria-label="Logo placeholder"
        >
          Logo
        </div>
        <span className="text-lg font-bold">Skill<span className="text-gradient">Graph</span></span>
      </Link>
    </header>
    <main className="flex-1 flex items-center justify-center px-4 pb-16">
      <div className={cn("w-full fade-up", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="glass-strong rounded-3xl p-8 shadow-elegant">
          <div className="space-y-1 mb-7">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
      </div>
    </main>
  </div>
);

const Field = ({
  id, label, icon: Icon, error, ...props
}: { id: string; label: string; icon: typeof Mail; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input id={id} className="pl-9 h-11 bg-input/60" {...props} />
    </div>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);

  // Step 2 state
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>("Developer");
  const [lookingFor, setLookingFor] = useState<LookingFor>("Cofounder");
  const [experience, setExperience] = useState<Experience>("mid");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [customSkill, setCustomSkill] = useState("");
  const [selectedVerticals, setSelectedVerticals] = useState<Set<string>>(new Set());
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [openToEquity, setOpenToEquity] = useState(false);
  const [fullTime, setFullTime] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Request geolocation as soon as step 2 loads
  useEffect(() => {
    if (step === 2 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [step]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.has(trimmed)) {
      setSelectedSkills(prev => new Set(prev).add(trimmed));
      setCustomSkill("");
    }
  };

  const toggleVertical = (v: string) => {
    setSelectedVerticals(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };

  // Step 1: create account
  const onSubmitStep1 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signupSchema.safeParse({
      name: fd.get("name"), email: fd.get("email"), password: fd.get("password"),
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = await signUp(result.data.email, result.data.password, result.data.name);
    setLoading(false);

    if (error) {
      toast.error("Sign up failed", { description: error });
      return;
    }

    setStep(2);
  };

  // Step 2: save profile details + skills + interests
  const onSubmitStep2 = async () => {
    if (selectedSkills.size === 0) {
      toast.error("Add at least one skill");
      return;
    }

    setLoading(true);

    const userId = user?.id;
    if (!userId) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    // Upload avatar if provided
    let avatarUrl: string | null = null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadErr) {
        toast.error("Failed to upload photo", { description: uploadErr.message });
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }

    // Update profile (including location if available)
    const { error: profileErr } = await supabase.from("profiles").update({
      primary_role: primaryRole,
      looking_for: lookingFor,
      experience,
      headline: headline || null,
      bio: bio || null,
      open_to_equity: openToEquity,
      full_time: fullTime,
      ...(location ? { lat: location.lat, lng: location.lng } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    }).eq("id", userId);

    if (profileErr) {
      toast.error("Failed to save profile", { description: profileErr.message });
      setLoading(false);
      return;
    }

    // Insert skills
    const skillRows = Array.from(selectedSkills).map(name => ({
      user_id: userId,
      name,
      level: "Intermediate" as const,
    }));
    if (skillRows.length > 0) {
      const { error: skillErr } = await supabase.from("skills").insert(skillRows);
      if (skillErr) {
        toast.error("Failed to save skills", { description: skillErr.message });
        setLoading(false);
        return;
      }
    }

    // Insert interests/verticals
    const interestRows = Array.from(selectedVerticals).map(name => ({
      user_id: userId,
      name,
    }));
    if (interestRows.length > 0) {
      const { error: intErr } = await supabase.from("interests").insert(interestRows);
      if (intErr) {
        toast.error("Failed to save interests", { description: intErr.message });
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    toast.success("Welcome to SkillGraph!", { description: "Your profile is live. Let's find your people." });
    navigate("/map");
  };

  if (step === 2) {
    return (
      <Shell
        title="Set up your profile"
        subtitle="Tell us about yourself so we can match you with the right people."
        footer={<>Step 2 of 2 · You can edit this later</>}
        wide
      >
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setAvatarFile(null); setAvatarPreview(null); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </label>
            <div>
              <p className="text-sm font-semibold">Profile photo</p>
              <p className="text-xs text-muted-foreground">Optional · Max 2MB · JPG or PNG</p>
            </div>
          </div>

          {/* Role */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">I am a...</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRIMARY_ROLES.map(role => {
                const c = ROLE_COLORS[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setPrimaryRole(role)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                      primaryRole === role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: c.bg }} />
                    {role === "Data" ? "Data / AI" : role === "Ops" ? "Ops / PM" : role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Looking for */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">Looking for...</Label>
            <div className="flex flex-wrap gap-1.5">
              {LOOKING_FOR_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLookingFor(opt)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    lookingFor === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {opt === "Cofounder" ? "Co-founder" : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">Experience level</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExperience(value)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    experience === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">
              Your skills <span className="text-muted-foreground font-normal">(select or type your own)</span>
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_SKILLS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all",
                    selectedSkills.has(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Custom skills that aren't in COMMON_SKILLS */}
            {Array.from(selectedSkills).filter(s => !COMMON_SKILLS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Array.from(selectedSkills).filter(s => !COMMON_SKILLS.includes(s)).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className="px-2.5 py-1 rounded-full border text-[11px] font-medium bg-primary text-primary-foreground border-primary flex items-center gap-1"
                  >
                    {s} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Add a custom skill..."
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                Add
              </Button>
            </div>
            {selectedSkills.size > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{selectedSkills.size} skill{selectedSkills.size !== 1 ? "s" : ""} selected</p>
            )}
          </div>

          {/* Verticals */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">Industry interests <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <div className="flex flex-wrap gap-1.5">
              {VERTICALS.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVertical(v)}
                  className={cn(
                    "px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all",
                    selectedVerticals.has(v)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Headline + Bio */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="headline" className="mb-1.5 block text-sm font-semibold">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. Full-Stack Engineer"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={openToEquity} onChange={e => setOpenToEquity(e.target.checked)} className="accent-primary" />
                <span className="text-xs text-muted-foreground">Open to equity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fullTime} onChange={e => setFullTime(e.target.checked)} className="accent-primary" />
                <span className="text-xs text-muted-foreground">Full-time</span>
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="bio" className="mb-1.5 block text-sm font-semibold">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Tell people what you're building, what you bring to the table..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { navigate("/map"); }} className="gap-2">
              Skip for now
            </Button>
            <Button type="button" variant="hero" size="lg" className="flex-1 gap-2" disabled={loading} onClick={onSubmitStep2}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Complete profile <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Create your account"
      subtitle="Join the skill map. It takes less than a minute."
      footer={<>Already a member? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link></>}
    >
      <form onSubmit={onSubmitStep1} className="space-y-4" noValidate>
        <Field id="name" name="name" label="Full name" icon={UserIcon} placeholder="Ada Lovelace" error={errors.name} />
        <Field id="email" name="email" label="Email" icon={Mail} type="email" placeholder="you@domain.com" error={errors.email} />
        <Field id="password" name="password" label="Password" icon={Lock} type="password" placeholder="At least 8 characters" error={errors.password} />

        <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <p className="text-xs text-center text-muted-foreground">Step 1 of 2 · Account details</p>
      </form>
    </Shell>
  );
};

export const LogIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = await signIn(result.data.email, result.data.password);
    setLoading(false);

    if (error) {
      toast.error("Login failed", { description: error });
      return;
    }

    toast.success("Welcome back!");
    navigate("/map");
  };

  return (
    <Shell
      title="Welcome back"
      subtitle="Log in to see who's near you right now."
      footer={<>New to SkillGraph? <Link to="/signup" className="text-primary hover:underline font-medium">Create account</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field id="email" name="email" label="Email" icon={Mail} type="email" placeholder="you@domain.com" error={errors.email} />
        <Field id="password" name="password" label="Password" icon={Lock} type="password" placeholder="Your password" error={errors.password} />

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Verified members get a LinkedIn badge on their profile.
        </p>
      </form>
    </Shell>
  );
};
