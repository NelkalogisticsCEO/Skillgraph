import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import { LogIn, SignUp } from "./pages/Auth";
import MapPage from "./pages/MapPage";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile/:id" element={<Placeholder title="Profile coming next" blurb="Skills, ranks, endorsements, hobbies — the full profile page is the next milestone." />} />
          <Route path="/profile/me" element={<Placeholder title="Your profile" blurb="Edit your skills, bio and interests in the next milestone." />} />
          <Route path="/communities" element={<Placeholder title="Communities" blurb="Create local groups and meetups — coming in the next milestone." />} />
          <Route path="/notifications" element={<Placeholder title="Notifications" blurb="Smart proximity alerts arrive in the next milestone." />} />
          <Route path="/settings" element={<Placeholder title="Settings" blurb="Privacy, location and notification preferences arrive next." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
