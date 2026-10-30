import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── RAG Knowledge for Disease Detection ───
const DISEASE_KNOWLEDGE = [
  {
    keywords: ["rice", "paddy", "blast", "blight", "brown spot", "sheath", "tungro", "false smut"],
    content: `RICE DISEASES: Rice Blast — gray-green lesions, Magnaporthe oryzae. Treat: Tricyclazole 0.6g/L, resistant varieties (IR64). Bacterial Leaf Blight — yellow-white leaf edges, Xanthomonas. Treat: Streptocycline 1g/10L, drain water. Brown Spot — oval brown lesions, nutrient-linked. Treat: Mancozeb 2.5g/L, add zinc+potash. Sheath Blight — gray lesions near water. Treat: Hexaconazole 2ml/L. Tungro — stunted yellow plants, leafhopper vector. No cure, remove plants, control leafhoppers. False Smut — green-black spore balls. Spray Propiconazole at boot stage.`
  },
  {
    keywords: ["tomato", "early blight", "late blight", "leaf curl", "wilt", "bacterial", "fusarium"],
    content: `TOMATO DISEASES: Early Blight — concentric brown rings on lower leaves. Mancozeb 2.5g/L preventive. Remove infected leaves. Late Blight — water-soaked patches, white mold in cool wet weather. Metalaxyl+Mancozeb 2.5g/L. Leaf Curl Virus — upward curling, stunted. Control whitefly (Imidacloprid), remove infected plants, resistant varieties. Fusarium Wilt — one-sided yellowing then wilt, soil-borne. Trichoderma treatment, 3-year rotation. Bacterial Wilt — sudden wilt without yellowing. No cure, remove plant, lime soil, don't replant 3 years. Fruit Borer — Emamectin 0.4ml/L, pheromone traps.`
  },
  {
    keywords: ["wheat", "rust", "smut", "powdery", "blight", "scab"],
    content: `WHEAT DISEASES: Yellow Rust — yellow stripes on leaves. Propiconazole 1ml/L immediately. Brown Rust — scattered brown pustules. Mancozeb+Propiconazole. Stem Rust — dark brown on stems. Very destructive. Powdery Mildew — white powdery growth. Sulfur dust or Carbendazim. Karnal Bunt — fishy black powder in grains, use certified seed, Thiram 2.5g/kg. Loose Smut — Carboxin seed treatment. Head Scab — bleached heads, spray Tebuconazole at flowering.`
  },
  {
    keywords: ["cotton", "bollworm", "wilt", "leaf curl", "root rot"],
    content: `COTTON DISEASES & PESTS: American Bollworm — feeds on bolls. Pheromone traps, Emamectin 0.4ml/L. Pink Bollworm — rosette flowers. Quinalphos 2ml/L. Whitefly — sooty mold. Neem oil 5ml/L, Acetamiprid. Fusarium Wilt — sudden wilting. Resistant varieties, Trichoderma. Root Rot — waterlogging. Improve drainage, Carbendazim drench.`
  },
  {
    keywords: ["potato", "late blight", "early blight", "scab", "wilt"],
    content: `POTATO DISEASES: Late Blight — most destructive. Water-soaked dark patches, white fungus underneath. Metalaxyl+Mancozeb 2.5g/L every 7-10 days in wet weather. Remove infected plants. Early Blight — brown concentric rings. Mancozeb 2.5g/L. Common Scab — rough patches on tuber skin. Maintain soil pH below 5.5, irrigate during tuber formation. Black Scurf — black spots on tubers. Treat seed with Boric acid or Carbendazim.`
  },
  {
    keywords: ["chili", "pepper", "anthracnose", "dieback", "mosaic", "thrips", "mite"],
    content: `CHILI/PEPPER DISEASES: Anthracnose/Fruit Rot — sunken dark spots on fruits. Copper oxychloride 3g/L. Pick and destroy infected fruits. Dieback — branches dry from tip downward. Prune affected parts, Copper spray. Leaf Curl — curling and thickening. Thrips or mite damage. Fipronil for thrips, Dicofol for mites. Mosaic Virus — mottled yellow-green leaves. Remove infected plants, control aphids.`
  },
  {
    keywords: ["mango", "anthracnose", "powdery mildew", "malformation", "hopper"],
    content: `MANGO DISEASES: Anthracnose — black spots on flowers and fruits. Carbendazim 1g/L at flowering. Powdery Mildew — white powder on flowers. Sulfur dust or Hexaconazole. Malformation — bunchy abnormal growth. Prune affected parts, NAA spray. Mango Hopper — sucks flower sap. Imidacloprid 0.3ml/L at bud break. Fruit Fly — larvae in ripe fruits. Methyl eugenol traps, bag fruits.`
  },
  {
    keywords: ["banana", "panama", "sigatoka", "bunchy top", "wilt"],
    content: `BANANA DISEASES: Panama Wilt (Fusarium) — yellowing, splitting pseudostem. No cure. Use resistant variety Grand Naine. Don't replant in infected soil 3+ years. Sigatoka Leaf Spot — yellow spots turning brown. Propiconazole spray. Remove infected leaves. Bunchy Top Virus — rosette growth, upright narrow leaves. Transmitted by aphid. Remove plant completely, control aphids.`
  },
  {
    keywords: ["onion", "garlic", "purple blotch", "downy mildew", "neck rot", "thrips"],
    content: `ONION/GARLIC DISEASES: Purple Blotch — purple spots with concentric rings. Mancozeb 2.5g/L every 10 days. Downy Mildew — pale green to yellow patches, white fungus in humid conditions. Metalaxyl+Mancozeb. Neck Rot — soft decay at neck during storage. Cure bulbs properly, store in ventilated place. Thrips — silvery streaks on leaves. Fipronil 1.5ml/L or Spinosad. Major yield reducer.`
  },
  {
    keywords: ["general", "leaf", "spot", "wilt", "rot", "mold", "fungus", "bacteria", "virus", "nematode"],
    content: `GENERAL PLANT DISEASE GUIDE: FUNGAL — spots, rots, molds, powdery/downy growth. Treat with Mancozeb, Carbendazim, Copper. BACTERIAL — water-soaked spots, soft rots, wilts, cankers. Copper-based sprays, Streptocycline. VIRAL — mosaic, leaf curl, stunting, ring spots. No cure, control insect vectors, remove infected plants. NEMATODE — root knots, galls, stunting. Apply Carbofuran or neem cake. Use resistant rootstocks. PREVENTION: Clean seed, crop rotation (3 years), resistant varieties, balanced nutrition, proper drainage, remove crop debris. IDENTIFICATION: Fungal=spots/mold, Bacterial=water-soaked/slimy, Viral=mosaic/distortion/stunting.`
  },
];

function retrieveDiseaseContext(query: string): string {
  const qLower = query.toLowerCase();
  const stem = (w: string) => w.replace(/(ing|ed|ly|tion|es|s)$/, "");
  const words = qLower.split(/[\s,;.!?]+/).filter(w => w.length > 2).map(stem);

  const scored = DISEASE_KNOWLEDGE.map(chunk => {
    let score = 0;
    for (const kw of chunk.keywords) {
      if (qLower.includes(kw)) score += 5;
      for (const w of words) {
        if (kw.includes(w) || w.includes(kw.substring(0, 4))) score += 2;
      }
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter(s => s.score > 0).slice(0, 3);
  if (top.length === 0) {
    return DISEASE_KNOWLEDGE[DISEASE_KNOWLEDGE.length - 1].content;
  }
  return top.map(r => r.chunk.content).join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    if (!image) throw new Error("No image provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // RAG: retrieve disease knowledge for context
    const ragContext = retrieveDiseaseContext("plant disease detection general");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert plant pathologist and farmer advisor. Analyze plant images to detect diseases.

Use this agricultural knowledge to ground your diagnosis:

${ragContext}

RULES:
- Use simple farmer-friendly language
- Be practical and actionable
- If the plant looks healthy, say so
- Give specific product names and dosages`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this plant image for diseases. Provide diagnosis, causes, treatment steps, and pesticide recommendations." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "diagnose_plant",
              description: "Return plant disease diagnosis with treatment",
              parameters: {
                type: "object",
                properties: {
                  disease_name: { type: "string" },
                  confidence: { type: "string", enum: ["High", "Medium", "Low"] },
                  description: { type: "string", description: "Simple farmer-friendly description" },
                  causes: { type: "array", items: { type: "string" } },
                  treatment_steps: { type: "array", items: { type: "string" }, description: "Step-by-step treatment a farmer can follow" },
                  prevention_tips: { type: "array", items: { type: "string" }, description: "How to prevent this disease in future" },
                  recommended_pesticides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        usage: { type: "string" },
                        precautions: { type: "string" }
                      },
                      required: ["name", "usage", "precautions"]
                    }
                  }
                },
                required: ["disease_name", "confidence", "description", "causes", "treatment_steps", "prevention_tips", "recommended_pesticides"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "diagnose_plant" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "{}";
      result = JSON.parse(content);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("disease-detection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
