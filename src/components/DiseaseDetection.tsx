import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Leaf, AlertTriangle, CheckCircle, Loader2, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface DiseaseResult {
  disease_name: string;
  confidence: string;
  description: string;
  causes: string[];
  treatment_steps: string[];
  recommended_pesticides: { name: string; usage: string; precautions: string }[];
}

const DiseaseDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB.");
      return;
    }
    setError(null);
    setResult(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("disease-detection", {
        body: { image: image },
      });
      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
          <Leaf className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Crop Disease Detection
        </h2>
        <p className="text-muted-foreground">
          Take a photo or upload an image of your plant to detect diseases
        </p>
      </div>

      {/* Upload Area */}
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer bg-card hover:bg-muted transition-colors">
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Upload Plant Image</p>
              <p className="text-sm text-muted-foreground mt-1">Tap to take a photo or choose from gallery</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-card border border-border">
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-foreground/70 text-background hover:bg-foreground/90 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <img src={image} alt="Uploaded plant" className="w-full max-h-80 object-contain bg-muted" />
          <div className="p-4">
            <Button
              onClick={analyzeImage}
              disabled={loading}
              className="w-full text-base font-semibold py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Analyze Plant
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Disease Name */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${result.disease_name.toLowerCase() === "healthy" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {result.disease_name.toLowerCase() === "healthy" ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{result.disease_name}</h3>
                <p className="text-sm text-muted-foreground">Confidence: {result.confidence}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.description}</p>
          </div>

          {/* Causes */}
          {result.causes?.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-3">Possible Causes</h4>
              <ul className="space-y-2">
                {result.causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment */}
          {result.treatment_steps?.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-3">Treatment Steps</h4>
              <ol className="space-y-3">
                {result.treatment_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Pesticides */}
          {result.recommended_pesticides?.length > 0 && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-card">
              <h4 className="font-bold text-foreground mb-3">Recommended Pesticides</h4>
              <div className="space-y-3">
                {result.recommended_pesticides.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted">
                    <p className="font-semibold text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1"><strong>Usage:</strong> {p.usage}</p>
                    <p className="text-xs text-muted-foreground mt-1"><strong>Precautions:</strong> {p.precautions}</p>
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

export default DiseaseDetection;
