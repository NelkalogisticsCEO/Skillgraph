import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, ChevronUp, MessageSquare, UserPlus, Linkedin, Globe, List, MapPin, Loader2, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Profile, Skill, Interest } from "@/types/database";
import type { SkillLevel, PrimaryRole, LookingFor, Experience, Availability } from "@/types/database";
import { PRIMARY_ROLES, LOOKING_FOR_OPTIONS, EXPERIENCE_OPTIONS, ROLE_COLORS } from "@/types/database";

interface NearbyUser extends Profile {
  skills: Skill[];
  interests: Interest[];
  distance: number;
}

// Haversine in km
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const avatarUrl = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=0ea5e9,06b6d4,14b8a6`;

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const pinHtml = (user: NearbyUser, isSelected: boolean) => {
  const c = ROLE_COLORS[user.primary_role] || ROLE_COLORS.Developer;
  const sz = isSelected ? 54 : 46;
  const bdr = isSelected ? "3px solid #1a73e8" : "3px solid white";
  const shd = isSelected ? "0 2px 14px rgba(26,115,232,.5),0 0 0 4px rgba(26,115,232,.16)" : "0 2px 8px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.06)";
  const halo = isSelected ? `<div style="position:absolute;inset:-7px;border-radius:50%;background:rgba(26,115,232,.1);"></div>` : "";
  const online = user.availability === "Open" ? `<div style="position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:#34a853;border:2.5px solid white;z-index:2;"></div>` : "";
  const src = user.avatar_url || avatarUrl(user.name);
  return `<div style="position:relative;width:${sz}px;height:${sz}px;">${halo}<div style="width:${sz}px;height:${sz}px;border-radius:50%;border:${bdr};box-shadow:${shd};overflow:hidden;background:${c.lt};">
    <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="${user.name}"
         onerror="this.style.display='none';this.parentNode.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:${c.lt};color:${c.bg}\\'>${initials(user.name)}</div>'"/>
  </div>${online}</div>`;
};

const userMarkerIcon = (user: NearbyUser, isSelected: boolean) => {
  const sz = isSelected ? 54 : 46;
  return L.divIcon({
    className: "",
    html: pinHtml(user, isSelected),
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
};

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:46px;height:46px;border-radius:50%;border:3px solid white;background:#1a73e8;box-shadow:0 2px 8px rgba(26,115,232,.5),0 0 0 8px rgba(26,115,232,.12);display:flex;align-items:center;justify-content:center;">
    <div style="width:14px;height:14px;border-radius:50%;background:white;"></div>
  </div>`,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

const FitRadius = ({ center, radiusKm }: { center: [number, number]; radiusKm: number }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLng(center).toBounds(radiusKm * 1000 * 2);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [map, center, radiusKm]);
  return null;
};

const EXP_MAP: Record<Experience, string> = { junior: "0-2 yrs", mid: "3-5 yrs", senior: "6-10 yrs", expert: "10+ yrs" };

const MapPage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Geo state
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Data
  const [allUsers, setAllUsers] = useState<NearbyUser[]>([]);
  const [allSkillNames, setAllSkillNames] = useState<string[]>([]);
  const [allVerticals, setAllVerticals] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(25);
  const [activeRoles, setActiveRoles] = useState<Set<PrimaryRole>>(new Set(["Founder", "Developer", "Designer", "Marketing", "Data"]));
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedIntents, setSelectedIntents] = useState<Set<LookingFor>>(new Set(["Cofounder"]));
  const [expLevel, setExpLevel] = useState<Experience | "any">("any");
  const [selectedVerticals, setSelectedVerticals] = useState<Set<string>>(new Set());
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyFullTime, setOnlyFullTime] = useState(false);
  const [onlyEquity, setOnlyEquity] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // UI state
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<"dist" | "alpha">("dist");

  // Get browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        setGeoLoading(false);
        if (user) {
          await supabase.from("profiles").update({ lat: loc.lat, lng: loc.lng }).eq("id", user.id);
        }
      },
      () => {
        setGeoError("Location access denied. Please enable location services.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [user]);

  // Fetch nearby profiles + skills + interests
  const fetchNearby = useCallback(async () => {
    if (!myLocation) return;

    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((myLocation.lat * Math.PI) / 180));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .not("lat", "is", null)
      .not("lng", "is", null)
      .gte("lat", myLocation.lat - latDelta)
      .lte("lat", myLocation.lat + latDelta)
      .gte("lng", myLocation.lng - lngDelta)
      .lte("lng", myLocation.lng + lngDelta);

    if (!profiles || profiles.length === 0) {
      setAllUsers([]);
      return;
    }

    const userIds = profiles.map(p => p.id);
    const [{ data: skills }, { data: interests }] = await Promise.all([
      supabase.from("skills").select("*").in("user_id", userIds),
      supabase.from("interests").select("*").in("user_id", userIds),
    ]);

    const skillsByUser = new Map<string, Skill[]>();
    (skills ?? []).forEach(s => {
      const list = skillsByUser.get(s.user_id) ?? [];
      list.push(s);
      skillsByUser.set(s.user_id, list);
    });

    const interestsByUser = new Map<string, Interest[]>();
    (interests ?? []).forEach(i => {
      const list = interestsByUser.get(i.user_id) ?? [];
      list.push(i);
      interestsByUser.set(i.user_id, list);
    });

    const users: NearbyUser[] = profiles
      .filter(p => p.id !== user?.id && p.lat != null && p.lng != null)
      .map(p => ({
        ...p,
        skills: skillsByUser.get(p.id) ?? [],
        interests: interestsByUser.get(p.id) ?? [],
        distance: distanceKm(myLocation, { lat: p.lat!, lng: p.lng! }),
      }))
      .filter(u => u.distance <= radiusKm);

    setAllUsers(users);

    const sNames = new Set<string>();
    (skills ?? []).forEach(s => sNames.add(s.name));
    setAllSkillNames(Array.from(sNames).sort());

    const vNames = new Set<string>();
    (interests ?? []).forEach(i => vNames.add(i.name));
    setAllVerticals(Array.from(vNames).sort());
  }, [myLocation, radiusKm, user]);

  useEffect(() => { fetchNearby(); }, [fetchNearby]);

  const center: [number, number] = myLocation ? [myLocation.lat, myLocation.lng] : [51.8985, -8.4756];

  // Apply all filters
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allUsers
      .filter(u => activeRoles.has(u.primary_role))
      .filter(u => selectedIntents.size === 0 || selectedIntents.has(u.looking_for))
      .filter(u => !onlyOnline || u.availability === "Open")
      .filter(u => !onlyFullTime || u.full_time)
      .filter(u => !onlyEquity || u.open_to_equity)
      .filter(u => expLevel === "any" || u.experience === expLevel)
      .filter(u => selectedSkills.size === 0 || u.skills.some(s => selectedSkills.has(s.name)))
      .filter(u => selectedVerticals.size === 0 || u.interests.some(i => selectedVerticals.has(i.name)))
      .filter(u => {
        if (!q) return true;
        return u.name.toLowerCase().includes(q)
          || u.primary_role.toLowerCase().includes(q)
          || (u.bio ?? "").toLowerCase().includes(q)
          || u.skills.some(s => s.name.toLowerCase().includes(q));
      })
      .sort((a, b) => sortBy === "dist" ? a.distance - b.distance : a.name.localeCompare(b.name));
  }, [allUsers, activeRoles, selectedIntents, onlyOnline, onlyFullTime, onlyEquity, expLevel, selectedSkills, selectedVerticals, searchQuery, sortBy]);

  const toggleRole = (r: PrimaryRole) => {
    setActiveRoles(prev => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  };

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, val: T) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val); else next.add(val);
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedSkills(new Set());
    setSelectedIntents(new Set(["Cofounder"]));
    setExpLevel("any");
    setSelectedVerticals(new Set());
    setOnlyOnline(false);
    setOnlyFullTime(false);
    setOnlyEquity(true);
    setRadiusKm(25);
  };

  const activeFilterCount = [
    selectedSkills.size > 0,
    selectedVerticals.size > 0,
    onlyOnline,
    onlyFullTime,
    !onlyEquity,
    expLevel !== "any",
    radiusKm !== 25,
  ].filter(Boolean).length;

  if (geoLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Getting your location...</p>
      </div>
    );
  }

  if (geoError && !myLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <MapPin className="h-8 w-8" />
        <p>{geoError}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── MAP ── */}
      <MapContainer center={center} zoom={12} className="absolute inset-0 z-0" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitRadius center={center} radiusKm={radiusKm} />
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{ color: "#1a73e8", weight: 1.5, opacity: 0.22, fillColor: "#1a73e8", fillOpacity: 0.04, dashArray: "6 5" }}
        />
        <Marker position={center} icon={meIcon} />
        {filtered.map(u => (
          <Marker
            key={u.id}
            position={[u.lat!, u.lng!]}
            icon={userMarkerIcon(u, selectedUser?.id === u.id)}
            eventHandlers={{ click: () => setSelectedUser(u) }}
          />
        ))}
      </MapContainer>

      {/* ── SEARCH BAR ── */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-[1000] w-[min(640px,calc(100%-28px))]">
        <div className="flex items-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,.18),0_1px_4px_rgba(0,0,0,.1)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 border-r border-gray-200 h-12 shrink-0">
            <div className="w-[22px] h-[22px] bg-blue-600 rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L10.5 3.5V8.5L6 11L1.5 8.5V3.5L6 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="6" cy="6" r="1.6" fill="white"/></svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-gray-900">Skillgraph</span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, skill or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-9 pr-4 border-none outline-none text-sm text-gray-900 bg-transparent placeholder:text-gray-400"
            />
          </div>
          <div className="w-px h-7 bg-gray-200 shrink-0" />
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 px-4 h-12 border-none bg-transparent text-gray-500 text-[13px] font-medium hover:bg-gray-100 transition-colors shrink-0 relative"
          >
            <Filter className="h-3.5 w-3.5 text-blue-600" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute top-2 right-2.5 w-4 h-4 bg-blue-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <div className="w-px h-7 bg-gray-200 shrink-0" />
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="flex items-center gap-1.5 px-3 h-12 border-none bg-transparent text-gray-500 text-[13px] font-medium hover:bg-gray-100 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── ROLE CHIPS ── */}
        <div className="flex items-center gap-1.5 mt-2 px-1 overflow-x-auto scrollbar-hide">
          {PRIMARY_ROLES.map(role => {
            const c = ROLE_COLORS[role];
            const on = activeRoles.has(role);
            return (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  on
                    ? "bg-blue-50 text-blue-600 border-blue-200 shadow-[0_2px_6px_rgba(26,115,232,.2)]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: c.bg }} />
                {role === "Data" ? "Data / AI" : role === "Ops" ? "Ops / PM" : role}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER DRAWER (right) ── */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-[340px] sm:w-[380px] bg-white border-l border-gray-200 overflow-y-auto p-0">
          <div className="flex items-center justify-between px-[18px] py-4 border-b border-gray-200">
            <span className="text-[15px] font-semibold tracking-tight">Filters</span>
            <div className="flex items-center gap-2">
              <button onClick={resetFilters} className="text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Reset all</button>
            </div>
          </div>

          <div className="px-[18px] pb-6">
            {/* Distance */}
            <div className="py-[18px] border-b border-gray-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Distance</div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range" min={1} max={100} value={radiusKm}
                  onChange={e => setRadiusKm(parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-[3px] cursor-pointer"
                />
                <span className="text-xs font-semibold text-blue-600 min-w-[56px] text-right">{radiusKm} km</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2"><span>1 km</span><span>25 km</span><span>50 km</span><span>100 km</span></div>
            </div>

            {/* Skills */}
            <div className="py-[18px] border-b border-gray-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Specific Skills</div>
              <div className="flex flex-wrap gap-[5px]">
                {allSkillNames.length > 0 ? allSkillNames.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSet(setSelectedSkills, s)}
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-[11.5px] font-medium transition-all",
                      selectedSkills.has(s)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                    )}
                  >{s}</button>
                )) : <p className="text-xs text-gray-400">No skills found nearby yet.</p>}
              </div>
            </div>

            {/* Looking for */}
            <div className="py-[18px] border-b border-gray-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Looking For</div>
              <div className="flex flex-wrap gap-1.5">
                {LOOKING_FOR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleSet(setSelectedIntents, opt)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      selectedIntents.has(opt)
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-blue-600"
                    )}
                  >
                    <span className={cn("w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                      selectedIntents.has(opt) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    )}>
                      {selectedIntents.has(opt) && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </span>
                    {opt === "Cofounder" ? "Co-founder" : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="py-[18px] border-b border-gray-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Experience Level</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setExpLevel("any")}
                  className={cn("px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    expLevel === "any" ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-600"
                  )}
                >Any</button>
                {EXPERIENCE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setExpLevel(value)}
                    className={cn("px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      expLevel === value ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-600"
                    )}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Verticals */}
            {allVerticals.length > 0 && (
              <div className="py-[18px] border-b border-gray-200">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Industry Vertical</div>
                <div className="flex flex-wrap gap-[5px]">
                  {allVerticals.map(v => (
                    <button
                      key={v}
                      onClick={() => toggleSet(setSelectedVerticals, v)}
                      className={cn(
                        "px-2.5 py-1 rounded-full border text-[11.5px] font-medium transition-all",
                        selectedVerticals.has(v)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                      )}
                    >{v}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="py-[18px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Availability</div>
              <div className="space-y-2">
                {[
                  { label: "Active now", desc: "Show only people online in the last 24h", checked: onlyOnline, onChange: setOnlyOnline },
                  { label: "Full-time only", desc: "Looking for full-time commitments", checked: onlyFullTime, onChange: setOnlyFullTime },
                  { label: "Open to equity", desc: "Willing to work for equity / pre-revenue", checked: onlyEquity, onChange: setOnlyEquity },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-[12.5px] font-medium text-gray-600">{item.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                    <Switch checked={item.checked} onCheckedChange={item.onChange} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 px-[18px] py-3.5 border-t border-gray-200 bg-white">
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-[13.5px] font-semibold transition-colors"
            >
              Apply filters · {filtered.length} results
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── FAB: view list ── */}
      <button
        onClick={() => setSheetExpanded(!sheetExpanded)}
        className="absolute bottom-6 right-3.5 z-[1000] bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,.18)] px-[18px] py-2.5 flex items-center gap-2 text-[13.5px] font-semibold text-gray-900 hover:shadow-[0_6px_24px_rgba(0,0,0,.2)] transition-all"
      >
        <List className="h-3.5 w-3.5" />
        View list
        <span className="bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{filtered.length}</span>
      </button>

      {/* ── RADIUS BADGE ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow-sm px-3.5 py-1.5 text-xs text-gray-500 flex items-center gap-1.5">
        <MapPin className="h-3 w-3" />
        <strong className="text-gray-700">Your area</strong> · <span>{radiusKm} km radius</span> · <span className="text-green-600 font-semibold">{filtered.length} matches</span>
      </div>

      {/* ── BOTTOM SUMMARY SHEET ── */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-[550] bg-white rounded-t-[20px] shadow-[0_-3px_20px_rgba(0,0,0,.12)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] max-h-[82vh]",
        sheetExpanded ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
      )}>
        {/* Handle */}
        <div className="flex flex-col items-center gap-1.5 pt-2.5 pb-1 cursor-pointer shrink-0" onClick={() => setSheetExpanded(!sheetExpanded)}>
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Peek row */}
        <div className="flex items-center justify-between px-[18px] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center">
              {filtered.slice(0, 3).map((u, i) => (
                <div key={u.id} className="w-[30px] h-[30px] rounded-full border-2 border-white overflow-hidden bg-gray-200 shrink-0" style={{ marginLeft: i > 0 ? -8 : 0 }}>
                  <img src={u.avatar_url || avatarUrl(u.name)} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-[13.5px] font-semibold tracking-tight">{filtered.length} builders nearby</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Tap to see all profiles</div>
            </div>
          </div>
          <button onClick={() => setSheetExpanded(!sheetExpanded)} className="text-[12.5px] font-semibold text-blue-600 flex items-center gap-1">
            See all
            <ChevronUp className={cn("h-3 w-3 transition-transform duration-300", sheetExpanded && "rotate-180")} />
          </button>
        </div>

        <div className="h-px bg-gray-200 mx-[18px] shrink-0" />

        {/* Sort bar */}
        {sheetExpanded && (
          <div className="flex items-center justify-between px-[18px] py-2 border-b border-gray-200 shrink-0">
            <span className="text-[11px] text-gray-500">{filtered.length} people found</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "dist" | "alpha")}
              className="text-[11.5px] font-medium text-gray-600 bg-transparent border border-gray-200 rounded px-1.5 py-0.5 outline-none"
            >
              <option value="dist">Nearest first</option>
              <option value="alpha">Name A-Z</option>
            </select>
          </div>
        )}

        {/* Scrollable card list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-0">
          {filtered.map(u => {
            const c = ROLE_COLORS[u.primary_role] || ROLE_COLORS.Developer;
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="flex items-start gap-3.5 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
              >
                <div className="relative w-[60px] h-[60px] rounded-full shrink-0 overflow-hidden border-2 bg-gray-200" style={{ borderColor: c.bd }}>
                  <img src={u.avatar_url || avatarUrl(u.name)} className="w-full h-full object-cover" alt={u.name} />
                  {u.availability === "Open" && <div className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] rounded-full bg-green-500 border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold tracking-tight mb-1">{u.name}</div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className="text-[10.5px] font-semibold px-[7px] py-[1px] rounded" style={{ background: c.lt, color: c.bg, border: `1px solid ${c.bd}` }}>{u.primary_role}</span>
                    <span className="text-[11px] text-gray-400">{u.looking_for === "Cofounder" ? "Co-founder" : u.looking_for}</span>
                    {u.open_to_equity && <span className="text-[10px] font-semibold text-green-800 bg-green-50 border border-green-200 px-1.5 py-[1px] rounded">equity</span>}
                  </div>
                  {u.bio && <p className="text-[12.5px] text-gray-500 line-clamp-2 leading-relaxed mb-2">{u.bio}</p>}
                  <div className="flex flex-wrap gap-1">
                    {u.skills.slice(0, 4).map(s => (
                      <span key={s.id} className="text-[11px] font-medium px-1.5 py-[1px] rounded bg-gray-100 border border-gray-200 text-gray-500">{s.name}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right shrink-0 pt-0.5">
                  <strong className="block text-[15px] font-bold text-gray-700 tracking-tight">{u.distance.toFixed(1)}</strong>
                  km
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-400 leading-relaxed">
              No builders match your filters.<br />Try adjusting the criteria.
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE DRAWER (left) ── */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-[400px] z-[700] bg-white shadow-[3px_0_20px_rgba(0,0,0,.18)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
        selectedUser ? "translate-x-0" : "-translate-x-full"
      )}>
        {selectedUser && (() => {
          const u = selectedUser;
          const c = ROLE_COLORS[u.primary_role] || ROLE_COLORS.Developer;
          return (
            <>
              {/* Cover */}
              <div className="h-[140px] shrink-0 relative overflow-hidden" style={{ background: c.lt }}>
                {u.avatar_url && (
                  <img src={u.avatar_url} className="absolute inset-0 w-full h-full object-cover blur-[14px] brightness-[.6] scale-[1.12]" alt="" />
                )}
                <button onClick={() => setSelectedUser(null)} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 flex items-center justify-center text-white hover:bg-black/55 z-10">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/35 flex items-center justify-center text-white hover:bg-black/55 z-10">
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute -bottom-7 left-5 z-[3]">
                  <div className="w-[72px] h-[72px] rounded-full border-[3px] border-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.2)] bg-gray-200">
                    <img src={u.avatar_url || avatarUrl(u.name)} className="w-full h-full object-cover" alt={u.name} />
                  </div>
                  {u.availability === "Open" && <div className="absolute bottom-1 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-[2.5px] border-white" />}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 pb-6">
                <div className="pt-10 mb-3.5">
                  <h2 className="text-xl font-bold tracking-tight mb-1.5">{u.name}</h2>
                  <div className="flex items-center gap-[7px] flex-wrap mb-1.5">
                    <span className="text-[11.5px] font-bold px-[9px] py-[2px] rounded" style={{ background: c.lt, color: c.bg, border: `1px solid ${c.bd}` }}>{u.primary_role}</span>
                    <span className="text-[11px] text-gray-400">{u.looking_for === "Cofounder" ? "Looking for co-founder" : u.looking_for}</span>
                    {u.linkedin_verified && (
                      <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-[1px] rounded flex items-center gap-1">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {u.distance.toFixed(1)} km away · {EXP_MAP[u.experience]} experience
                  </div>
                </div>

                {u.bio && (
                  <>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mb-2">About</div>
                    <p className="text-[13.5px] text-gray-600 leading-relaxed">{u.bio}</p>
                    <div className="h-px bg-gray-200 my-4" />
                  </>
                )}

                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {u.skills.map(s => (
                    <span key={s.id} className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600">{s.name}</span>
                  ))}
                  {u.skills.length === 0 && <span className="text-xs text-gray-400">No skills listed yet</span>}
                </div>

                <div className="h-px bg-gray-200 my-4" />

                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Details</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-gray-100 rounded-lg px-3 py-2.5">
                    <div className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Experience</div>
                    <div className="text-[12.5px] font-semibold text-gray-600">{EXP_MAP[u.experience]}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2.5">
                    <div className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Availability</div>
                    <div className="text-[12.5px] font-semibold text-gray-600">{u.full_time ? "Full-time" : "Part-time"}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2.5">
                    <div className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Equity</div>
                    <div className="text-[12.5px] font-semibold text-gray-600">{u.open_to_equity ? "Open to equity" : "Paid only"}</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2.5">
                    <div className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Status</div>
                    <div className="text-[12.5px] font-semibold text-gray-600 flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", u.availability === "Open" ? "bg-green-500" : "bg-yellow-500")} />
                      {u.availability === "Open" ? "Active" : "Busy"}
                    </div>
                  </div>
                </div>

                {u.interests.length > 0 && (
                  <>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mt-4 mb-2">Industry Verticals</div>
                    <div className="flex flex-wrap gap-[5px]">
                      {u.interests.map(i => (
                        <span key={i.id} className="text-[11.5px] font-medium px-2 py-[3px] rounded bg-blue-50 text-blue-600 border border-blue-100">{i.name}</span>
                      ))}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => toast.info("Messaging coming soon")}
                    className="flex-1 h-[42px] rounded-full border-[1.5px] border-gray-200 bg-gray-100 text-gray-600 text-[13.5px] font-semibold flex items-center justify-center gap-[7px] hover:bg-gray-200 transition-colors"
                  >
                    <MessageSquare className="h-[15px] w-[15px]" />
                    Message
                  </button>
                  <button
                    onClick={() => toast.success("Connection request sent!")}
                    className="flex-1 h-[42px] rounded-full bg-blue-600 text-white text-[13.5px] font-semibold flex items-center justify-center gap-[7px] hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-[15px] w-[15px]" />
                    Connect
                  </button>
                </div>

                {/* Social */}
                <div className="flex gap-2 mt-3">
                  {u.linkedin_url && (
                    <a href={u.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 font-medium">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {u.portfolio_url && (
                    <a href={u.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 font-medium">
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default MapPage;
