import { useState } from "react";
import { motion } from "framer-motion";
import { Wheat, Loader2, MapPin, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const cropOptions = [
  "Rice", "Wheat", "Tomato", "Cotton", "Potato", "Onion",
  "Sugarcane", "Maize", "Groundnut", "Soybean", "Chili", "Banana", "Mango",
];
const soilTypes = ["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Black Soil", "Red Soil", "Alluvial"];
const seasons = ["Summer", "Winter", "Rainy/Monsoon", "Spring", "Autumn"];

interface CultivationGuide {
  land_preparation?: string;
  seed_selection?: string;
  planting?: string;
  fertilizer?: string;
  watering?: string;
  pest_control?: string;
  harvest?: string;
}

interface PlanResult {
  suitable: boolean;
  crop_name: string;
  reason: string;
  cultivation_guide?: CultivationGuide;
  alternatives?: { name: string; reason: string }[];
}

const CropPlanning = () => {
  const [crop, setCrop] = useState("");
  const [customCrop, setCustomCrop] = useState("");
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCrop = crop === "__custom" ? customCrop.trim() : crop;

  const getPlan = async () => {
    if (!selectedCrop || !soilType || !season || !location.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("crop-planning", {
        body: { crop: selectedCrop, soil_type: soilType, season, location: location.trim() },
      });
      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to get plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const guideSteps = result?.cultivation_guide
    ? Object.entries(result.cultivation_guide).filter(([, v]) => v)
    : [];

  const stepLabels: Record<string, string> = {
    land_preparation: "🌍 Land Preparation",
    seed_selection: "🌱 Seed Selection",
    planting: "🪴 Planting",
    fertilizer: "🧪 Fertilizer",
    watering: "💧 Watering",
    pest_control: "🐛 Pest Control",
    harvest: "🌾 Harvest",
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent mb-4">
          <Wheat className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Crop Planning</h2>
        <p className="text-muted-foreground">Check if a crop suits your land and get a full growing guide</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4 mb-6">
        {/* Crop Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">What crop do you want to grow?</label>
          <div className="flex flex-wrap gap-2">
            {cropOptions.map((c) => (
              <button
                key={c}
                onClick={() => { setCrop(c); setCustomCrop(""); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  crop === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setCrop("__custom")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                crop === "__custom" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              Other...
            </button>
          </div>
          {crop === "__custom" && (
            <input
              type="text"
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              placeholder="Type crop name..."
              className="mt-2 w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Soil Type</label>
          <div className="flex flex-wrap gap-2">
            {soilTypes.map((s) => (
              <button
                key={s}
                onClick={() => setSoilType(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  soilType === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Season</label>
          <div className="flex flex-wrap gap-2">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  season === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Your Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Punjab, India"
              className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <Button
          onClick={getPlan}
          disabled={loading || !selectedCrop || !soilType || !season || !location.trim()}
          className="w-full py-6 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Wheat className="w-5 h-5 mr-2" />
              Check Crop Plan
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Suitability Card */}
          <div className={`p-5 rounded-xl border shadow-card ${
            result.suitable
              ? "bg-success/5 border-success/30"
              : "bg-warning/5 border-warning/30"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {result.suitable ? (
                <CheckCircle className="w-7 h-7 text-success" />
              ) : (
                <XCircle className="w-7 h-7 text-warning" />
              )}
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {result.crop_name} — {result.suitable ? "✅ Suitable!" : "⚠️ Not Ideal"}
                </h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
          </div>

          {/* Cultivation Guide */}
          {result.suitable && guideSteps.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-4">🌱 Step-by-Step Cultivation Guide</h4>
              <div className="space-y-4">
                {guideSteps.map(([key, value], i) => (
                  <div key={key} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{stepLabels[key] || key}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {!result.suitable && result.alternatives && result.alternatives.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Better Crops to Try
              </h4>
              <div className="space-y-3">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted">
                    <p className="font-semibold text-sm text-foreground">{alt.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CropPlanning;
