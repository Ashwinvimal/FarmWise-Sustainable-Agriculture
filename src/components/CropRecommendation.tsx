import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const soilTypes = ["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Black Soil", "Red Soil", "Alluvial"];
const seasons = ["Summer", "Winter", "Rainy/Monsoon", "Spring", "Autumn"];

interface CropResult {
  crops: {
    name: string;
    cultivation_tips: string[];
    conditions: string;
    season: string;
  }[];
}

const CropRecommendation = () => {
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    if (!soilType || !season || !location.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("crop-recommendation", {
        body: { soil_type: soilType, season, location: location.trim() },
      });
      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-success/10 text-success mb-4">
          <Sprout className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Crop Recommendations
        </h2>
        <p className="text-muted-foreground">
          Find the best crops for your soil, season, and location
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4 mb-6">
        {/* Soil Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Soil Type</label>
          <div className="flex flex-wrap gap-2">
            {soilTypes.map((s) => (
              <button
                key={s}
                onClick={() => setSoilType(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  soilType === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10"
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
                  season === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10"
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
          onClick={getRecommendations}
          disabled={loading || !soilType || !season || !location.trim()}
          className="w-full py-6 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Getting Recommendations...
            </>
          ) : (
            <>
              <Sprout className="w-5 h-5 mr-2" />
              Get Crop Suggestions
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {result?.crops && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {result.crops.map((crop, i) => (
            <div key={i} className="p-5 rounded-xl bg-card border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{crop.name}</h4>
                  <p className="text-xs text-muted-foreground">Best for: {crop.season}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Conditions:</strong> {crop.conditions}
              </p>
              {crop.cultivation_tips?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Cultivation Tips:</p>
                  <ol className="space-y-1">
                    {crop.cultivation_tips.map((tip, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {j + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CropRecommendation;
