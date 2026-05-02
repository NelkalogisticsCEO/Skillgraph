import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CURRENT_USER, NEARBY_USERS, ALL_SKILLS, type NearbyUser, type SkillLevel, type Availability } from "@/data/mockUsers";
import { RankBadge } from "@/components/RankBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Filter, List, MapIcon, Eye, EyeOff, Users as UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

const userIcon = (avatar: string, ring = "hsl(199 100% 55%)") =>
  L.divIcon({
    className: "skillgraph-pin",
    html: `
      <div style="position:relative;width:48px;height:48px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:${ring};opacity:.35;animation:pulse-ring 2.4s infinite ease-out;"></div>
        <img src="${avatar}" alt="" style="position:relative;width:48px;height:48px;border-radius:9999px;border:2px solid ${ring};box-shadow:0 6px 20px hsl(222 47% 2% / .6);background:#0b1220;object-fit:cover;" />
      </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

const meIcon = L.divIcon({
  className: "skillgraph-me",
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:-8px;border-radius:9999px;background:hsl(199 100% 55% / .25);animation:pulse-ring 2s infinite ease-out;"></div>
      <div style="position:relative;width:22px;height:22px;border-radius:9999px;background:hsl(199 100% 55%);border:3px solid white;box-shadow:0 0 24px hsl(199 100% 55% / .8);"></div>
    </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const RecenterOnRadius = ({ center, radiusKm }: { center: [number, number]; radiusKm: number }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLng(center).toBounds(radiusKm * 1000 * 2);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [map, center, radiusKm]);
  return null;
};

const LEVEL_ORDER: Record<SkillLevel, number> = { Beginner: 1, Intermediate: 2, Expert: 3 };

const MapPage = () => {
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minLevel, setMinLevel] = useState<SkillLevel | "Any">("Any");
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [availability, setAvailability] = useState<Availability | "Any">("Any");
  const [view, setView] = useState<"map" | "list">("map");
  const [hideMyLocation, setHideMyLocation] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<NearbyUser | null>(null);

  const center: [number, number] = [CURRENT_USER.lat, CURRENT_USER.lng];

  const filtered = useMemo(() => {
    return NEARBY_USERS
      .map(u => ({ ...u, distance: distanceKm(CURRENT_USER, u) }))
      .filter(u => u.distance <= radiusKm)
      .filter(u => availability === "Any" || u.availability === availability)
      .filter(u => u.age >= ageRange[0] && u.age <= ageRange[1])
      .filter(u => {
        if (selectedSkills.length === 0) return true;
        return u.skills.some(s => selectedSkills.includes(s.name));
      })
      .filter(u => {
        if (minLevel === "Any") return true;
        const need = LEVEL_ORDER[minLevel];
        return u.skills.some(s => LEVEL_ORDER[s.level] >= need &&
          (selectedSkills.length === 0 || selectedSkills.includes(s.name)));
      })
      .sort((a, b) => a.distance - b.distance);
  }, [radiusKm, selectedSkills, minLevel, ageRange, availability]);

  const toggleSkill = (s: string) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      {/* Map / List toggle bar */}
      <div className="container py-4 flex flex-wrap items-center gap-3">
        <div className="glass rounded-full p-1 flex">
          <Toggle pressed={view === "map"} onPressedChange={() => setView("map")} className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1.5">
            <MapIcon className="h-4 w-4" /> Map
          </Toggle>
          <Toggle pressed={view === "list"} onPressedChange={() => setView("list")} className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1.5">
            <List className="h-4 w-4" /> List
          </Toggle>
        </div>

        <div className="glass rounded-full px-4 py-2 flex items-center gap-3 text-sm flex-1 min-w-[260px] max-w-md">
          <span className="text-muted-foreground whitespace-nowrap">Radius</span>
          <Slider
            value={[radiusKm]}
            min={1} max={100} step={1}
            onValueChange={(v) => setRadiusKm(v[0])}
            className="flex-1"
          />
          <span className="font-semibold text-primary tabular-nums w-14 text-right">{radiusKm} km</span>
        </div>

        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="glass" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
              {selectedSkills.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 text-primary text-[10px] px-2 py-0.5">{selectedSkills.length}</span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px] sm:w-[420px] glass-strong border-l border-border overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filter people nearby</SheetTitle>
              <SheetDescription>Refine the map and list view in real time.</SheetDescription>
            </SheetHeader>

            <div className="space-y-7">
              <div>
                <Label className="mb-2 block">Skills</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SKILLS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-all",
                        selectedSkills.includes(s)
                          ? "bg-primary text-primary-foreground border-primary shadow-glow"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Minimum proficiency</Label>
                <div className="flex gap-1.5">
                  {(["Any", "Beginner", "Intermediate", "Expert"] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setMinLevel(l)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                        minLevel === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Age range</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">{ageRange[0]}–{ageRange[1]}</span>
                </div>
                <Slider
                  value={ageRange}
                  min={18} max={70} step={1}
                  onValueChange={(v) => setAgeRange([v[0], v[1]] as [number, number])}
                />
              </div>

              <div>
                <Label className="mb-2 block">Availability</Label>
                <div className="flex gap-1.5">
                  {(["Any", "Open", "Busy"] as const).map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvailability(a)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                        availability === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {a === "Open" ? "Open to connect" : a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  {hideMyLocation ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                  <div>
                    <Label htmlFor="hide-loc" className="cursor-pointer">Hide my location</Label>
                    <p className="text-xs text-muted-foreground">Show only an approximate area.</p>
                  </div>
                </div>
                <Switch id="hide-loc" checked={hideMyLocation} onCheckedChange={setHideMyLocation} />
              </div>

              <Button
                variant="outline" className="w-full"
                onClick={() => { setSelectedSkills([]); setMinLevel("Any"); setAgeRange([18, 60]); setAvailability("Any"); }}
              >
                Reset filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          <span><span className="text-foreground font-semibold">{filtered.length}</span> nearby</span>
        </div>
      </div>

      {/* Body */}
      {view === "map" ? (
        <div className="flex-1 px-4 lg:px-6 pb-6">
          <div className="relative h-[calc(100vh-180px)] min-h-[520px] rounded-2xl overflow-hidden border border-border shadow-elegant">
            <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={true}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterOnRadius center={center} radiusKm={radiusKm} />

              <Circle
                center={center}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: "hsl(199 100% 55%)",
                  fillColor: "hsl(199 100% 55%)",
                  fillOpacity: 0.06,
                  weight: 1.5,
                  dashArray: "6 6",
                }}
              />

              {!hideMyLocation && <Marker position={center} icon={meIcon} />}

              {filtered.map(u => (
                <Marker
                  key={u.id}
                  position={[u.lat, u.lng]}
                  icon={userIcon(u.avatar)}
                  eventHandlers={{ click: () => setSelected(u) }}
                >
                  <Popup>
                    <UserHoverCard user={u} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : (
        <div className="container pb-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <UserCard key={u.id} user={u} distance={distanceKm(CURRENT_USER, u)} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No one matches your filters in {radiusKm} km. Try widening the radius.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const UserHoverCard = ({ user }: { user: NearbyUser }) => (
  <div className="w-56 -m-1 p-1">
    <div className="flex items-center gap-3">
      <img src={user.avatar} className="h-12 w-12 rounded-full border-2 border-primary/50" alt={user.name} />
      <div className="min-w-0">
        <p className="font-semibold text-foreground truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.headline}</p>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
      {user.skills.slice(0, 3).map(s => (
        <span key={s.name} className="text-[10px] rounded-full bg-secondary/80 px-2 py-0.5 text-foreground">{s.name}</span>
      ))}
    </div>
    <div className="mt-2 flex items-center gap-1.5">
      <RankBadge tier={user.rank} size="sm" />
      {user.linkedinVerified && <VerifiedBadge />}
    </div>
    <Link
      to={`/profile/${user.id}`}
      className="mt-3 block w-full text-center rounded-md bg-gradient-primary text-primary-foreground text-xs font-semibold py-1.5 hover:opacity-90"
    >
      View profile
    </Link>
  </div>
);

const UserCard = ({ user, distance }: { user: NearbyUser; distance: number }) => (
  <Link
    to={`/profile/${user.id}`}
    className="glass rounded-2xl p-5 hover:-translate-y-1 hover:border-primary/40 transition-all block"
  >
    <div className="flex items-start gap-3">
      <div className="relative">
        <img src={user.avatar} className="h-14 w-14 rounded-full border-2 border-primary/40" alt={user.name} />
        {user.linkedinVerified && (
          <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-background">✓</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.headline}</p>
        <div className="mt-1 flex items-center gap-2">
          <RankBadge tier={user.rank} size="sm" />
          <span className="text-[10px] text-muted-foreground">{distance.toFixed(1)} km away</span>
        </div>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1">
      {user.skills.map(s => (
        <span key={s.name} className="text-[11px] rounded-full bg-secondary/80 px-2 py-0.5">{s.name} · <span className="text-primary">{s.level}</span></span>
      ))}
    </div>
    <div className="mt-3 flex items-center justify-between text-xs">
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        user.availability === "Open" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {user.availability === "Open" ? "Open to connect" : "Busy"}
      </span>
      <span className="text-muted-foreground">Age {user.age}</span>
    </div>
  </Link>
);

export default MapPage;
