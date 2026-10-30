import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, Droplets, Wind, Thermometer, Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  humidity: string;
  wind_speed: string;
  forecast: { day: string; temp: string; condition: string; icon: string }[];
  farming_advice: string[];
}

const WeatherAdvisory = () => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getWeather = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("weather-advisory", {
        body: { location: location.trim() },
      });
      if (fnError) throw fnError;
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const conditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return <Sun className="w-6 h-6 text-warning" />;
    if (c.includes("rain") || c.includes("drizzle")) return <Droplets className="w-6 h-6 text-info" />;
    return <Cloud className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-info/10 text-info mb-4">
          <Cloud className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Weather Advisory
        </h2>
        <p className="text-muted-foreground">
          Check weather and get farming tips for your area
        </p>
      </div>

      {/* Location Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getWeather()}
              placeholder="Enter your city or area..."
              className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button onClick={getWeather} disabled={loading || !location.trim()} className="px-6 py-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {weather && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Current Weather */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-1">{weather.location}</p>
            <div className="flex items-center justify-center gap-4 my-4">
              {conditionIcon(weather.condition)}
              <span className="text-4xl font-extrabold text-foreground">{weather.temperature}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{weather.condition}</p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Droplets className="w-4 h-4" /> {weather.humidity}</span>
              <span className="flex items-center gap-1"><Wind className="w-4 h-4" /> {weather.wind_speed}</span>
            </div>
          </div>

          {/* Forecast */}
          {weather.forecast?.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {weather.forecast.map((day, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border text-center">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{day.day}</p>
                  {conditionIcon(day.condition)}
                  <p className="text-sm font-bold text-foreground mt-2">{day.temp}</p>
                </div>
              ))}
            </div>
          )}

          {/* Farming Advice */}
          {weather.farming_advice?.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-3">🌾 Farming Advice</h4>
              <ul className="space-y-2">
                {weather.farming_advice.map((advice, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WeatherAdvisory;
