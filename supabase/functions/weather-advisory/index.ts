import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── RAG Knowledge for Weather-Based Advice ───
const WEATHER_KNOWLEDGE = `CLIMATE-SMART FARMING GUIDE:
- Heavy Rain/Monsoon: Ensure drainage channels. Don't spray pesticides (washes off). Wait 2 days after rain to spray. Apply fungicide preventively. Stake tall plants. Watch for late blight, downy mildew. Avoid sowing in waterlogged fields.
- Drought/Hot (>38°C): Irrigate in evening (less evaporation). Mulch heavily to retain moisture. Apply potash for heat tolerance. Kaolin spray reflects sunlight. Use shade nets for vegetables. Grow drought-tolerant varieties (bajra, jowar, moth bean). Reduce plant population 25%.
- Cold/Frost (<5°C): Irrigate evening before expected frost (water releases heat). Create smoke screens. Cover nurseries with plastic. Don't prune in cold. Apply sulfuric acid spray (controversial traditional method). Protect banana, papaya from cold.
- Humid (>80% humidity): High disease risk — spray fungicides preventively. Improve air circulation (proper spacing). Avoid excess nitrogen. Watch for powdery/downy mildew, leaf spots, fruit rots.
- Windy: Stake tall plants. Provide windbreaks. Delay spraying (drift). Drip irrigation preferred over sprinkler.
- Seasonal Advice India:
  - June-July: Kharif sowing time. Prepare nurseries. Apply basal fertilizer. Start rice transplanting.
  - Aug-Sep: Top-dress nitrogen. Watch for pests (peak season). Drain excess water.
  - Oct-Nov: Rabi sowing. Wheat, mustard, gram. Harvest Kharif crops. Apply FYM to fields.
  - Dec-Jan: Irrigate rabi crops. Frost protection. Harvest early potato/peas.
  - Feb-March: Wheat heading — critical irrigation. Watch for rust. Prepare for Zaid.
  - April-May: Harvest rabi. Summer plowing. Prepare for monsoon. Grow Zaid cucurbits.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { location } = await req.json();
    if (!location) throw new Error("No location provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `You are a weather and agriculture advisor. Use this farming knowledge to give weather-based advice:

${WEATHER_KNOWLEDGE}

RULES:
- Provide realistic weather data for the location and current season
- Give practical farming advice based on conditions
- Use simple farmer-friendly language
- Include specific actionable tips`
          },
          {
            role: "user",
            content: `Provide current weather conditions and a 5-day forecast for ${location}, along with farming advice suitable for the current season and weather.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_weather",
              description: "Return weather data and farming advice",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" },
                  temperature: { type: "string" },
                  condition: { type: "string" },
                  humidity: { type: "string" },
                  wind_speed: { type: "string" },
                  forecast: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "string" },
                        temp: { type: "string" },
                        condition: { type: "string" },
                        icon: { type: "string" }
                      },
                      required: ["day", "temp", "condition", "icon"]
                    }
                  },
                  farming_advice: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-7 practical farming tips based on weather and season"
                  }
                },
                required: ["location", "temperature", "condition", "humidity", "wind_speed", "forecast", "farming_advice"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_weather" } }
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
      throw new Error("Weather request failed");
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
    console.error("weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
