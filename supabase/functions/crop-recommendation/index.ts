import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── RAG Knowledge for Crop Recommendation ───
const CROP_KNOWLEDGE = [
  {
    keywords: ["clay", "heavy", "waterlogged"],
    content: `CLAY SOIL CROPS: Best — Rice (paddy), Wheat, Sugarcane, Cabbage. Good — Cotton, Soybean, Sunflower. Clay holds moisture well. Add organic matter to improve drainage. Gypsum 2t/ha helps heavy clay. Avoid root crops (carrot, radish) in heavy clay.`
  },
  {
    keywords: ["sandy", "light", "dry"],
    content: `SANDY SOIL CROPS: Best — Groundnut, Watermelon, Carrot, Cucumber, Pearl Millet (Bajra). Good — Potato, Sweet Potato, Sesame. Sandy drains fast — needs frequent irrigation. Add compost 15t/ha to improve water retention. Mulch heavily.`
  },
  {
    keywords: ["loamy", "medium"],
    content: `LOAMY SOIL CROPS: Best for almost everything. Excellent for — Wheat, Maize, Vegetables (tomato, okra, brinjal), Fruits, Pulses. Loamy is ideal — balanced drainage and nutrients. Maintain with annual compost application.`
  },
  {
    keywords: ["black", "regur", "vertisol"],
    content: `BLACK SOIL CROPS: Best — Cotton (king crop of black soil), Soybean, Sunflower, Gram (Chickpea), Sorghum. Good — Wheat, Safflower, Linseed. Rich in calcium/magnesium/potash but low nitrogen. Self-mulching. Add nitrogen supplements.`
  },
  {
    keywords: ["red", "laterite", "acidic"],
    content: `RED/LATERITE SOIL CROPS: Best — Groundnut, Millets (Ragi, Bajra), Tobacco, Pulses. Good — Cotton (with irrigation), Potato, Sweet Potato. Iron-rich but poor in N/P. Apply lime 2-4t/ha for acidity. Need phosphorus supplements.`
  },
  {
    keywords: ["alluvial", "river", "fertile"],
    content: `ALLUVIAL SOIL CROPS: Best — Rice, Wheat, Sugarcane, Maize, Jute. Good — All vegetables, Pulses, Oilseeds. Very fertile (river deposits). Rich in potash. Supplement with nitrogen. Most productive soil in India.`
  },
  {
    keywords: ["kharif", "monsoon", "rainy", "june", "july", "august"],
    content: `KHARIF SEASON (June-October): Rice, Cotton, Maize, Soybean, Groundnut, Sorghum (Jowar), Pearl Millet (Bajra), Pigeon Pea (Tur/Arhar), Sesame, Jute, Sugarcane (planting). Heavy rainfall crops. Ensure drainage for waterlogging-prone areas.`
  },
  {
    keywords: ["rabi", "winter", "october", "november", "december", "cold"],
    content: `RABI SEASON (October-March): Wheat, Mustard, Chickpea (Gram), Barley, Pea, Lentil (Masoor), Potato, Onion, Garlic, Coriander, Fenugreek, Sunflower. Cool-weather crops. Need irrigation. Lower pest pressure than Kharif.`
  },
  {
    keywords: ["zaid", "summer", "march", "april", "may", "hot"],
    content: `ZAID SEASON (March-June): Watermelon, Muskmelon, Cucumber, Bottle Gourd, Ridge Gourd, Moong Bean, Fodder crops (Jowar, Bajra). Need regular irrigation. Short-duration high-value crops. Good for extra income between main seasons.`
  },
  {
    keywords: ["punjab", "haryana", "north", "indo-gangetic"],
    content: `NORTH INDIA (Punjab/Haryana/UP): Rice-Wheat system dominant. Also: Sugarcane, Maize, Cotton, Mustard, Potato. Well-irrigated regions. Diversify with vegetables and pulses for income. MSP procurement available for wheat/rice.`
  },
  {
    keywords: ["maharashtra", "madhya pradesh", "central", "deccan"],
    content: `CENTRAL INDIA (Maharashtra/MP/Gujarat): Cotton, Soybean, Sugarcane, Gram, Groundnut, Sunflower, Sorghum. Mix of irrigated and rainfed. Black soil dominant. Pomegranate and grapes in Maharashtra. Soybean-Wheat rotation popular in MP.`
  },
  {
    keywords: ["south", "tamil nadu", "karnataka", "andhra", "telangana", "kerala"],
    content: `SOUTH INDIA: Rice (both Kharif+Rabi), Coconut, Arecanut, Spices (pepper, cardamom, turmeric), Coffee, Tea, Banana, Mango, Sugarcane, Cotton, Groundnut. Multiple cropping possible due to longer growing season. Diverse agro-climatic zones.`
  },
  {
    keywords: ["rajasthan", "dry", "arid", "desert"],
    content: `ARID/SEMI-ARID (Rajasthan/Gujarat): Bajra (Pearl Millet), Cluster Bean (Guar), Moth Bean, Mustard, Cumin, Castor. Drought-tolerant crops essential. Rainwater harvesting critical. Drip irrigation for high-value crops. Low water requirement varieties.`
  },
  {
    keywords: ["east", "bengal", "odisha", "bihar", "jharkhand", "assam", "northeast"],
    content: `EAST/NORTHEAST INDIA: Rice (main crop), Jute, Tea, Bamboo, Pineapple, Banana, Turmeric, Ginger, Maize. High rainfall areas. Fisheries integration possible. Organic farming potential. Flood-tolerant rice varieties important.`
  },
];

function retrieveCropContext(soil: string, season: string, location: string): string {
  const query = `${soil} ${season} ${location}`.toLowerCase();
  const words = query.split(/[\s,]+/).filter(w => w.length > 2);

  const scored = CROP_KNOWLEDGE.map(chunk => {
    let score = 0;
    for (const kw of chunk.keywords) {
      if (query.includes(kw)) score += 5;
      for (const w of words) {
        if (kw.includes(w) || w.includes(kw)) score += 2;
      }
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, 4).map(r => r.chunk.content).join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { soil_type, season, location } = await req.json();
    if (!soil_type || !season || !location) throw new Error("Missing required fields");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ragContext = retrieveCropContext(soil_type, season, location);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are FarmWise AI — a practical crop advisor. Use the following agricultural knowledge to make recommendations:

${ragContext}

RULES:
- Recommend crops ranked by suitability — best first
- Mark Top 2-3 as "Best Pick"
- Keep descriptions short and scannable
- Use bullet points
- Simple farmer-friendly language
- Include practical cultivation tips`
          },
          {
            role: "user",
            content: `Recommend 5 suitable crops for: Soil: ${soil_type}, Season: ${season}, Location: ${location}. Rank by suitability. Include short cultivation tips and required conditions.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_crops",
              description: "Return crop recommendations ranked by suitability",
              parameters: {
                type: "object",
                properties: {
                  crops: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        is_best_pick: { type: "boolean", description: "True for top 2-3 most suitable crops" },
                        cultivation_tips: { type: "array", items: { type: "string" } },
                        conditions: { type: "string" },
                        season: { type: "string" }
                      },
                      required: ["name", "is_best_pick", "cultivation_tips", "conditions", "season"]
                    }
                  }
                },
                required: ["crops"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_crops" } }
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
      throw new Error("Recommendation request failed");
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
    console.error("crop-rec error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
