import { useState, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User as UserIcon, Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password required"),
});

const Shell = ({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <div className="absolute inset-0 bg-gradient-hero pointer-events-none -z-10" />
    <header className="container py-6">
      <Link to="/" className="inline-flex items-center gap-3" aria-label="SkillGraph home">
        {/* Logo placeholder — replace with your logo image */}
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
      <div className="w-full max-w-md fade-up">
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    setTimeout(() => {
      toast.success("Welcome to SkillGraph!", { description: "Your account is ready. Let's find your people." });
      navigate("/map");
    }, 800);
  };

  return (
    <Shell
      title="Create your account"
      subtitle="Join the skill map. It takes less than a minute."
      footer={<>Already a member? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field id="name" name="name" label="Full name" icon={UserIcon} placeholder="Ada Lovelace" error={errors.name} />
        <Field id="email" name="email" label="Email" icon={Mail} type="email" placeholder="you@domain.com" error={errors.email} />
        <Field id="password" name="password" label="Password" icon={Lock} type="password" placeholder="At least 8 characters" error={errors.password} />

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Verify with</span>
          </div>
        </div>

        <Button type="button" variant="glass" className="w-full" onClick={() => toast.info("LinkedIn verification", { description: "Connect Lovable Cloud to enable this." })}>
          <Linkedin className="h-4 w-4 text-primary" /> Verify with LinkedIn
        </Button>
      </form>
    </Shell>
  );
};

export const LogIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    setTimeout(() => {
      toast.success("Welcome back!");
      navigate("/map");
    }, 600);
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
