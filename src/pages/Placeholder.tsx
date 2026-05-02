import { TopNav } from "@/components/TopNav";
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Placeholder = ({ title, blurb }: { title: string; blurb: string }) => (
  <div className="min-h-screen flex flex-col">
    <TopNav />
    <main className="flex-1 container py-16 flex items-center justify-center">
      <div className="glass-strong rounded-3xl p-12 max-w-lg text-center fade-up">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Construction className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{blurb}</p>
        <Button asChild variant="hero"><Link to="/map">Back to map</Link></Button>
      </div>
    </main>
  </div>
);

export default Placeholder;
