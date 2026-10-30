import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// RAG Knowledge for crop planning suitability
const CROP_KNOWLEDGE: Record<string, string> = {
  rice: `RICE: Kharif crop (June-Nov). Needs clayey/alluvial soil, standing water, 20-35°C, heavy rainfall. Best in river plains. NPK 120:60:60. Nursery 20-25 days, transplant 2-3 seedlings/hill at 20x15cm. Harvest when 80% grains golden. Not suitable for sandy/dry regions or winter.`,
  wheat: `WHEAT: Rabi crop (Oct-Mar). Needs loamy/clay-loam soil, cool weather 10-25°C, 4-6 irrigations. Seed rate 100kg/ha, row spacing 20-22.5cm. NPK 120:60:40. Harvest March-April. Not suitable for tropical lowlands, waterlogged or very sandy soils.`,
  tomato: `TOMATO: Year-round in warm climates. Needs well-drained loamy soil, 20-30°C, moderate water. Transplant 30-day seedlings at 60x45cm. Stake plants. NPK 120:80:80. Common issues: early blight, leaf curl, fruit borer. Not suitable for waterlogged or very cold areas.`,
  cotton: `COTTON: Kharif crop (Apr-Oct). Needs black/alluvial soil, 25-35°C, moderate rainfall. Deep-rooted crop. NPK 80:40:40. Space 90x60cm. Watch for bollworms, whitefly. Not suitable for heavy clay with poor drainage, cold/frost areas.`,
  potato: `POTATO: Rabi/cool season. Needs sandy-loam soil, 15-25°C, well-drained. Plant tubers 5-8cm deep at 60x20cm. Earthing up at 30 and 45 days. NPK 150:80:100. Watch for late blight. Not suitable for heavy clay, waterlogged, or hot tropical areas.`,
  onion: `ONION: Rabi crop mainly. Needs well-drained loamy soil, 15-25°C. Transplant 45-day seedlings at 15x10cm. NPK 100:50:50. Stop irrigation 10 days before harvest. Watch for purple blotch, thrips. Not suitable for heavy wet soils.`,
  sugarcane: `SUGARCANE: Tropical crop, 12-18 months duration. Needs deep fertile soil (alluvial/loamy), 20-35°C, plenty of water. Plant setts in furrows at 75-90cm row spacing. NPK 250:100:120. Needs 6-8 irrigations. Not suitable for sandy, saline, or cold areas.`,
  maize: `MAIZE: Kharif mainly, also Rabi in some areas. Needs well-drained loamy soil, 21-30°C. Seed rate 20kg/ha at 60x20cm. NPK 120:60:40. Watch for stem borer, fall armyworm. Not suitable for waterlogged or heavy clay soils.`,
  groundnut: `GROUNDNUT: Kharif crop. Needs sandy-loam/red soil, 25-30°C, well-drained. Seed rate 80-100kg/ha at 30x10cm. NPK 20:40:40 + Gypsum 400kg/ha. Watch for tikka leaf spot. Not suitable for heavy clay or waterlogged soils.`,
  soybean: `SOYBEAN: Kharif crop (June-Oct). Needs well-drained loamy/black soil, 20-30°C. Seed rate 60-80kg/ha at 45x5cm. Treat with Rhizobium. NPK 20:60:40. Watch for girdle beetle, pod borer. Not suitable for waterlogged or very sandy soils.`,
  chili: `CHILI/PEPPER: Warm season. Needs well-drained loamy soil, 20-30°C. Space 60x45cm. NPK 100:50:50. Watch for fruit rot (Copper oxychloride), mites (Dicofol). Not suitable for cold/frost or waterlogged areas.`,
  banana: `BANANA: Tropical, year-round planting. Needs deep fertile loamy soil, 25-35°C, plenty of water. Plant suckers at 1.8x1.8m. NPK 200:50:200g/plant. Prop when bunching. Not suitable for sandy/rocky, cold, or waterlogged areas.`,
  mango: `MANGO: Tropical fruit tree. Needs well-drained alluvial/loamy soil, warm climate. Plant at 10x10m. Prune after harvest. NPK varies by age. Spray for hopper at flowering. Not suitable for waterlogged or very cold/frost areas.`,
};

const SOIL_CROP_MAP: Record<string, string[]> = {
  clay: ["rice", "wheat", "sugarcane", "cotton"],
  sandy: ["groundnut", "potato", "watermelon", "carrot"],
  loamy: ["tomato", "wheat", "maize", "onion", "chili", "soybean", "potato"],
  silt: ["rice", "wheat", "sugarcane"],
  peaty: ["potato", "onion", "cabbage"],
  chalky: ["barley", "beet", "cabbage"],
  "black soil": ["cotton", "soybean", "sunflower", "sugarcane"],
  "red soil": ["groundnut", "millet", "tobacco", "chili"],
  alluvial: ["rice", "wheat", "sugarcane", "maize", "banana"],
};

const SEASON_CROP_MAP: Record<string, string[]> = {
  summer: ["tomato", "maize", "groundnut", "cotton", "chili", "okra", "watermelon"],
  winter: ["wheat", "potato", "onion", "mustard", "pea", "barley"],
  "rainy/monsoon": ["rice", "maize", "soybean", "cotton", "groundnut", "sugarcane"],
  spring: ["maize", "tomato", "chili", "onion", "sunflower"],
  autumn: ["wheat", "potato", "onion", "mustard"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { crop, soil_type, season, location } = await req.json();
    if (!crop || !soil_type || !season || !location) throw new Error("Missing required fields");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const cropLower = crop.toLowerCase();
    const soilLower = soil_type.toLowerCase();
    const seasonLower = season.toLowerCase();

    // RAG: Retrieve crop knowledge
    const cropKnowledge = CROP_KNOWLEDGE[cropLower] || `No specific data for ${crop}. General advice will be provided.`;
    const soilCrops = SOIL_CROP_MAP[soilLower] || [];
    const seasonCrops = SEASON_CROP_MAP[seasonLower] || [];
    const isSoilMatch = soilCrops.includes(cropLower);
    const isSeasonMatch = seasonCrops.includes(cropLower);

    const contextInfo = `
CROP KNOWLEDGE: ${cropKnowledge}

SOIL SUITABILITY: ${soilLower} soil is best for: ${soilCrops.join(", ") || "various crops"}.
${crop} is ${isSoilMatch ? "SUITABLE" : "NOT ideal"} for ${soilLower} soil.

SEASON SUITABILITY: ${seasonLower} season is best for: ${seasonCrops.join(", ") || "various crops"}.
${crop} is ${isSeasonMatch ? "SUITABLE" : "NOT ideal"} for ${seasonLower} season.

LOCATION: ${location}
`;

    const systemPrompt = `You are FarmWise AI — a practical crop planning advisor. You help farmers decide what to grow.

RETRIEVED AGRICULTURAL KNOWLEDGE:
${contextInfo}

TASK: Analyze whether "${crop}" is suitable to grow in "${soilLower}" soil during "${seasonLower}" season in "${location}".

You MUST respond using the JSON tool provided. Be practical and farmer-friendly in your explanations. Use simple language.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Is ${crop} suitable to grow in ${soil_type} soil during ${season} in ${location}? Give me a full crop plan if suitable, or suggest better alternatives if not.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "crop_plan",
              description: "Return crop planning analysis",
              parameters: {
                type: "object",
                properties: {
                  suitable: { type: "boolean", description: "Whether the crop is suitable for given conditions" },
                  crop_name: { type: "string" },
                  reason: { type: "string", description: "Simple 1-2 sentence explanation of suitability" },
                  cultivation_guide: {
                    type: "object",
                    description: "Step-by-step guide (only if suitable)",
                    properties: {
                      land_preparation: { type: "string" },
                      seed_selection: { type: "string" },
                      planting: { type: "string" },
                      fertilizer: { type: "string" },
                      watering: { type: "string" },
                      pest_control: { type: "string" },
                      harvest: { type: "string" },
                    },
                  },
                  alternatives: {
                    type: "array",
                    description: "2-3 better crop suggestions (only if NOT suitable)",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["name", "reason"],
                    },
                  },
                },
                required: ["suitable", "crop_name", "reason"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "crop_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Planning request failed");
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
    console.error("crop-planning error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
