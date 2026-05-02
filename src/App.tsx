import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import { LogIn, SignUp } from "./pages/Auth";
import MapPage from "./pages/MapPage";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
            <Route path="/profile/:id" element={<RequireAuth><Placeholder title="Profile coming next" blurb="Skills, ranks, endorsements, hobbies — the full profile page is the next milestone." /></RequireAuth>} />
            <Route path="/profile/me" element={<RequireAuth><Placeholder title="Your profile" blurb="Edit your skills, bio and interests in the next milestone." /></RequireAuth>} />
            <Route path="/communities" element={<RequireAuth><Placeholder title="Communities" blurb="Create local groups and meetups — coming in the next milestone." /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Placeholder title="Notifications" blurb="Smart proximity alerts arrive in the next milestone." /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Placeholder title="Settings" blurb="Privacy, location and notification preferences arrive next." /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
