import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Comprehensive RAG Knowledge Base ───
const KNOWLEDGE_CHUNKS = [
  // RICE
  {
    id: "rice-diseases",
    keywords: ["rice", "paddy", "blast", "blight", "brown spot", "sheath", "tungro", "black patch", "discoloration", "yellow", "leaf spot"],
    content: `RICE DISEASES:
- Rice Blast: Gray-green lesions on leaves, nodes, panicles. Caused by Magnaporthe oryzae. Treatment: Tricyclazole (0.6g/L) or Isoprothiolane. Remove infected debris. Use resistant varieties (IR64, Pusa Basmati-1).
- Bacterial Leaf Blight: Water-soaked lesions turning yellow-white on leaf edges. Caused by Xanthomonas oryzae. Treatment: Streptocycline (1g/10L). Drain excess water. Apply potash.
- Brown Spot: Oval brown lesions. Caused by Cochliobolus miyabeanus. Linked to nutrient deficiency. Treatment: Mancozeb (2.5g/L). Add potash and zinc.
- Sheath Blight: Irregular greenish-gray lesions on sheaths near water. Caused by Rhizoctonia solani. Treatment: Hexaconazole (2ml/L) or Validamycin. Reduce plant density.
- Tungro: Stunted growth, yellow-orange leaves. Transmitted by green leafhoppers. No cure. Remove infected plants. Control leafhoppers with Imidacloprid.
- False Smut: Green-black spore balls on grains. Spray Propiconazole at boot stage. Remove infected panicles.
- Sheath Rot: Brown lesions on flag leaf sheath. Spray Carbendazim (1g/L) at booting.
- Bacterial Leaf Streak: Narrow brown streaks between veins. Apply copper-based fungicide. Avoid overhead irrigation.`
  },
  {
    id: "rice-cultivation",
    keywords: ["rice", "paddy", "planting", "growing", "cultivation", "nursery", "transplant", "harvest", "irrigation", "water", "seed", "sowing"],
    content: `RICE CULTIVATION GUIDE:
- Nursery: Soak seeds 24hrs, incubate 48hrs. Sow in raised beds with 10kg seed/100sqm. Seedlings ready in 20-25 days. Apply light NPK at 10 days.
- Transplanting: Space 20x15cm. 2-3 seedlings per hill at 2-3cm depth. Transplant in evening for less stress.
- Water: 2-5cm standing water during vegetative stage. Alternate wetting-drying saves 25% water. Drain 2 weeks before harvest.
- Fertilizer: NPK 120:60:60 kg/ha. Basal at transplanting, top-dress at tillering and panicle initiation. Add ZnSO4 25kg/ha in zinc-deficient soils.
- Weed Control: Apply Butachlor pre-emergence. Hand weed at 30 and 50 days. Or use cono-weeder.
- Harvest: When 80% grains golden. Moisture 20-22%. Thresh within 24hrs. Sun-dry to 14% moisture for storage.
- Best Season: Kharif (June-July sowing). Some regions grow Rabi rice (Nov sowing). Summer rice in irrigated areas.
- Varieties: Short duration (110 days): IR-64, Pusa-44. Medium (130 days): Swarna, BPT-5204. Basmati: Pusa Basmati-1, 1121.`
  },
  // WHEAT
  {
    id: "wheat-diseases",
    keywords: ["wheat", "rust", "smut", "powdery mildew", "karnal bunt", "wheat disease", "yellow rust", "brown rust"],
    content: `WHEAT DISEASES:
- Yellow/Stripe Rust: Yellow powder on leaves in stripes. Apply Propiconazole (1ml/L) immediately. Use resistant varieties (HD-2967, PBW-550).
- Brown/Leaf Rust: Small brown pustules scattered on leaves. Apply Mancozeb (2.5g/L) + Propiconazole.
- Stem Rust: Dark brown pustules on stems. Very destructive. Apply Propiconazole + Tebuconazole.
- Powdery Mildew: White powdery growth. Apply Sulfur dust or Carbendazim (1g/L). Good air circulation helps.
- Karnal Bunt: Fishy-smelling black powder in grains. Use certified seed. Treat with Thiram (2.5g/kg).
- Loose Smut: Black powdery mass replaces grain. Treat seed with Carboxin (2g/kg seed) or Tebuconazole.
- Head Scab (Fusarium): Bleached heads, shriveled pink grains. Spray Tebuconazole at flowering. Avoid wheat after maize.
- Spot Blotch: Dark brown oval spots. Apply Propiconazole. Use resistant varieties.`
  },
  {
    id: "wheat-cultivation",
    keywords: ["wheat", "planting", "growing", "sowing", "rabi", "winter crop", "harvest wheat"],
    content: `WHEAT CULTIVATION:
- Sowing: Oct-Nov (North India), Nov-Dec (Central). Seed rate: 100kg/ha drill, 125kg/ha broadcast. Treat seed with Thiram+Carboxin.
- Spacing: Row 20-22.5cm. Depth 5-6cm. Zero-till sowing saves time and moisture.
- Irrigation: 4-6 irrigations. Critical: Crown root (21d), Tillering (40-45d), Jointing (60-65d), Flowering (80-85d), Grain filling (100-105d). Skip one? Never skip crown root.
- Fertilizer: NPK 120:60:40 kg/ha. Full P & K + half N basal. Rest N at first and third irrigation.
- Weed: Isoproturon pre-emergence or Sulfosulfuron at 30 days. Hand weed once.
- Harvest: March-April at 12-14% grain moisture. Combine harvester or manual. Don't delay — shattering losses.
- Varieties: Timely sown: HD-2967, WH-1105, PBW-343. Late sown: HD-3086, PBW-590. Irrigated vs rainfed selection matters.`
  },
  // COTTON
  {
    id: "cotton-cultivation",
    keywords: ["cotton", "kapas", "bt cotton", "cotton cultivation", "boll", "fiber", "lint"],
    content: `COTTON CULTIVATION:
- Sowing: April-May. Seed rate: 2.5kg/ha (Bt hybrids). Space 90x60cm (rainfed) or 90x90cm (irrigated).
- Soil: Black/alluvial, pH 6-8. Deep plowing in summer. Apply FYM 10t/ha before sowing.
- Fertilizer: NPK 120:60:60 kg/ha. Apply P & K basal. N in 3 splits: sowing, 30 days, 60 days.
- Irrigation: First at 3 weeks. Critical: Flowering and boll formation. Drip saves 40% water.
- Picking: Start when 60% bolls open. Pick every 15-20 days. Avoid picking wet cotton. Sun-dry to 8% moisture.
- Refuge: For Bt cotton, plant 20% non-Bt border rows to delay pest resistance.
- Intercropping: Grow moong/groundnut between rows for extra income and soil health.`
  },
  {
    id: "cotton-pests",
    keywords: ["cotton", "bollworm", "whitefly", "jassid", "aphid", "pink bollworm", "cotton pest", "mealy bug"],
    content: `COTTON PEST MANAGEMENT:
- American Bollworm: Feeds on bolls. Pheromone traps (5/acre). Spray Emamectin benzoate (0.4ml/L) or NPV. Hand-pick large larvae.
- Pink Bollworm: Larvae bore into bolls causing rosette flowers. Pheromone traps. Quinalphos (2ml/L). Destroy residues after harvest.
- Whitefly: Sucks sap, sooty mold. Neem oil (5ml/L) or Acetamiprid (0.2g/L). Yellow sticky traps.
- Aphids: Cluster on shoots. Dimethoate (1.5ml/L) or Neem oil. Encourage ladybugs.
- Jassids: Leaf curl, yellowing. Imidacloprid (0.3ml/L). Grow hairy-leaf varieties.
- Mealy Bug: White cottony masses on stems. Spray Profenophos (2ml/L). Release Cryptolaemus beetle.
- Thrips: Upward leaf curling. Fipronil (1.5ml/L). Blue sticky traps.
- IPM Strategy: Trap crops (maize/sorghum border), Trichogramma (1.5 lakh eggs/ha), neem first, chemicals last resort.`
  },
  // MAIZE / CORN
  {
    id: "maize-guide",
    keywords: ["maize", "corn", "makka", "baby corn", "sweet corn", "fall armyworm"],
    content: `MAIZE CULTIVATION:
- Sowing: Kharif (June-July), Rabi (Oct-Nov), Spring (Feb-March). Seed rate: 20kg/ha. Space 60x20cm.
- Soil: Well-drained loamy. pH 5.5-7.5. Apply FYM 10t/ha.
- Fertilizer: NPK 120:60:40 kg/ha. Full P&K basal. N in 3 splits. Side-dress N at knee-high stage.
- Irrigation: 4-5 irrigations. Critical: Tasseling and silking (no water stress here — yield drops 50%).
- Pests: Fall Armyworm — most destructive. Spray Emamectin benzoate (0.4ml/L) or Chlorantraniliprole. Apply sand+lime in whorl. Stem borer — Carbofuran granules in whorl.
- Diseases: Turcicum Leaf Blight — Mancozeb spray. Maydis Leaf Blight — resistant varieties.
- Harvest: When husk turns brown, grain dents. Moisture 20-25% at harvest. Dry to 12% for storage.
- Baby Corn: Pick ears 2-3 days after silk emergence. Pick daily. Very profitable — ₹15-20/kg.`
  },
  // SOYBEAN
  {
    id: "soybean-guide",
    keywords: ["soybean", "soya", "soy", "pulse", "oilseed", "kharif pulse"],
    content: `SOYBEAN CULTIVATION:
- Sowing: June-July (Kharif). Seed rate: 60-70kg/ha. Space 45x5cm. Treat seed with Rhizobium + Trichoderma.
- Soil: Well-drained loamy to clay. pH 6-7.5. Soybean fixes nitrogen — good for rotation.
- Fertilizer: NPK 20:60:40 kg/ha. Low N needed due to nitrogen fixation. Apply full dose basal.
- Irrigation: Rainfed mostly. Critical irrigation at flowering and pod filling if dry.
- Pests: Girdle beetle — Quinalphos spray. Stem fly — seed treatment with Thiamethoxam. Tobacco caterpillar — NPV or Emamectin.
- Diseases: Yellow Mosaic Virus — control whitefly vector. Rust — Hexaconazole spray. Charcoal Rot — avoid water stress.
- Harvest: When 95% pods brown, leaves drop. Don't delay — pods shatter. Moisture 13% for storage.
- Rotations: Soybean → Wheat (excellent). Soybean → Gram. Improves soil nitrogen for next crop.`
  },
  // TOMATO & VEGETABLES
  {
    id: "tomato-guide",
    keywords: ["tomato", "tamatar", "leaf curl", "early blight", "late blight", "wilt", "fruit borer", "tomato yellow"],
    content: `TOMATO CULTIVATION & DISEASES:
- Transplant 25-30 day seedlings at 60x45cm. Stake plants for support. Mulch with straw.
- Fertilizer: NPK 120:80:80 kg/ha. Apply vermicompost 5t/ha. Side-dress N at 30 and 60 days.
- DISEASES:
  - Early Blight: Dark concentric rings on lower leaves. Spray Mancozeb (2.5g/L) preventively. Remove lower infected leaves.
  - Late Blight: Water-soaked patches, white mold underneath. Metalaxyl + Mancozeb (2.5g/L). Appears in cool wet weather.
  - Leaf Curl Virus: Upward curling, stunted growth. Control whitefly with Imidacloprid. Remove infected plants. Use resistant varieties.
  - Fusarium Wilt: Lower leaves yellow one side first, plant wilts. Soil-borne. Treat with Trichoderma. Rotate crops.
  - Bacterial Wilt: Sudden wilting without yellowing. No cure. Remove plant. Add lime. Don't plant tomato there for 3 years.
- PESTS:
  - Fruit Borer: Spray Emamectin (0.4ml/L) at fruiting. Install pheromone traps.
  - Whitefly: Yellow sticky traps + Neem oil. Key vector for leaf curl virus.
  - Mites: Bronzing of leaves. Spray Dicofol or Abamectin.`
  },
  {
    id: "vegetable-general",
    keywords: ["vegetable", "potato", "onion", "chili", "pepper", "brinjal", "eggplant", "okra", "bhindi", "cabbage", "cauliflower", "carrot", "pea", "beans"],
    content: `VEGETABLE CULTIVATION:
- Potato: Plant tubers 5-8cm deep, 60x20cm. Earthing up at 30 and 45 days. NPK 150:80:100. Late blight: Metalaxyl+Mancozeb.
- Onion: 45-day seedlings at 15x10cm. Stop irrigation 10 days before harvest. NPK 100:50:50. Purple blotch: Mancozeb. Thrips: Fipronil.
- Chili: 60x45cm. NPK 100:50:50. Fruit rot: Copper oxychloride. Mites: Dicofol. Thrips: Fipronil. Pick ripe fruits regularly.
- Okra (Bhindi): Direct sow 45x30cm. Soak seeds 12hrs. NPK 80:50:50. Pick every 2-3 days when tender. Yellow vein mosaic: control whitefly.
- Brinjal: 75x60cm. NPK 100:50:50. Shoot & fruit borer: Emamectin. Phomopsis blight: Mancozeb. Wilts: Trichoderma soil treatment.
- Cabbage/Cauliflower: 60x45cm. NPK 120:60:60. Diamondback moth: Spinosad. Apply boron for head formation.
- Peas: 30x10cm. NPK 20:40:20 (low N, fixes own). Powdery mildew: Carbendazim. Pick pods regularly.
- Beans: 45x15cm. NPK 20:50:20. Anthracnose: Mancozeb seed treatment. Pod borer: Emamectin.`
  },
  // SOIL
  {
    id: "soil-types",
    keywords: ["soil", "clay", "sandy", "loamy", "silt", "black soil", "red soil", "alluvial", "laterite", "soil type", "soil health", "ph"],
    content: `SOIL TYPES AND MANAGEMENT:
- Clay Soil: Heavy, holds moisture, poor drainage. Add organic matter 15t/ha, gypsum 2t/ha. Good for rice, wheat. pH 6.0-7.5.
- Sandy Soil: Light, drains fast, low nutrients. Add compost, mulch heavily. Good for groundnut, watermelon, carrot. Frequent irrigation needed.
- Loamy Soil: Best for farming — balanced drainage and nutrients. Suits most crops. Maintain with compost annually.
- Black Soil (Regur): Rich in calcium, magnesium, potash. Self-mulching (cracks when dry). Ideal for cotton, soybean, sunflower. Add nitrogen.
- Red Soil: Rich in iron, poor in nitrogen/phosphorus. Add lime for acidity. Good for groundnut, millets, tobacco.
- Alluvial Soil: Very fertile, river plains. Good for rice, wheat, sugarcane. Rich in potash, needs nitrogen.
- Laterite Soil: Highly weathered, acidic. Add lime 2-4t/ha. Grow tea, coffee, cashew, rubber.
- SOIL TESTING: Test every 2 years. Check pH, N, P, K, organic carbon, micronutrients. Collect from 15cm depth, 10 spots, mix.
- pH Management: Acidic (<6): Apply lime. Alkaline (>8): Apply gypsum. Neutral (6.5-7.5) is ideal for most crops.
- Improving Soil: FYM 10-15t/ha, vermicompost 2-3t/ha, green manuring (dhaincha/sunhemp), crop rotation, avoid burning residues.`
  },
  // FERTILIZERS
  {
    id: "fertilizers-guide",
    keywords: ["fertilizer", "npk", "urea", "dap", "potash", "organic", "compost", "manure", "nutrient", "deficiency", "micronutrient", "zinc", "boron", "iron"],
    content: `FERTILIZER GUIDE:
- Urea (46-0-0): Main nitrogen source. Apply in 2-3 splits. Don't apply before heavy rain — nitrogen washes away. Neem-coated urea releases slowly.
- DAP (18-46-0): Phosphorus source. Apply as basal dose at sowing. Don't mix with urea while storing.
- MOP (0-0-60): Potassium source. Apply at sowing/transplanting. Strengthens stems, improves disease resistance.
- SSP (0-16-0): Single Super Phosphate. Also provides sulfur and calcium. Good for oilseeds.
- NPK Complex (12-32-16, 10-26-26, 20-20-0): Balanced nutrition. Convenient but costlier.
- Zinc Sulphate: 25kg/ha for zinc-deficient soils. Essential for rice. Apply basal.
- Borax: 10kg/ha for boron deficiency. Important for mustard, cauliflower, sunflower.
- Ferrous Sulphate: For iron deficiency. Spray 0.5% solution on leaves.
- Vermicompost: 2-3t/ha. Improves soil structure, water retention, microbial activity.
- DEFICIENCY SIGNS:
  - Nitrogen: Yellowing of OLDER leaves, stunted growth. Apply urea 50kg/ha.
  - Phosphorus: Purple/dark green leaves, delayed maturity. Apply DAP.
  - Potassium: Brown leaf EDGES (scorching), weak stems. Apply MOP.
  - Iron: Yellow leaves with GREEN veins on NEW growth. Spray ferrous sulphate.
  - Zinc: Light patches between veins, small leaves. Apply zinc sulphate.
  - Boron: Hollow stems, distorted fruits, poor seed set. Apply borax.
  - Sulfur: Uniform yellowing of NEW leaves (unlike nitrogen). Apply SSP or gypsum.`
  },
  // PEST CONTROL
  {
    id: "pest-control-general",
    keywords: ["pest", "insect", "aphid", "whitefly", "borer", "caterpillar", "mite", "neem", "organic", "ipm", "biological", "spray", "pesticide"],
    content: `INTEGRATED PEST MANAGEMENT (IPM):
- Cultural: Crop rotation, resistant varieties, proper spacing, clean cultivation, trap crops, deep summer plowing.
- Biological: Trichogramma for borers (1.5-2 lakh eggs/ha). NPV for bollworms. Beauveria bassiana for white grub. Ladybugs for aphids. Lacewings for soft pests.
- Mechanical: Light traps (1/acre, 6pm-10pm), pheromone traps (5/acre), yellow sticky traps (whitefly/aphid), blue sticky traps (thrips), hand-picking.
- Botanical: Neem oil 5ml/L, Neem seed kernel extract 5%, Pongamia oil 2%, Garlic-chili extract (boil 50g garlic+50g chili in 1L water, dilute 10x).
- Chemical (Last Resort):
  - Sucking pests (aphid, whitefly, jassid): Imidacloprid 0.3ml/L, Thiamethoxam 0.2g/L, Acetamiprid 0.2g/L
  - Borers: Chlorantraniliprole 0.3ml/L, Flubendiamide 0.2ml/L, Emamectin 0.4ml/L
  - Leaf-eaters: Spinosad 0.3ml/L, Indoxacarb 0.5ml/L
  - Mites: Dicofol 2ml/L, Abamectin 0.5ml/L, Spiromesifen 0.8ml/L
- SAFETY: Wear mask+gloves+goggles. Spray early morning or evening. Follow waiting period (7-21 days before harvest). Rotate chemical groups. Don't spray during flowering (protect bees). Triple-rinse containers.`
  },
  // IRRIGATION
  {
    id: "irrigation-methods",
    keywords: ["irrigation", "water", "drip", "sprinkler", "flood", "furrow", "rain", "drought", "conservation", "mulch"],
    content: `IRRIGATION METHODS:
- Drip: Most efficient (90%). Best for vegetables, fruits, cotton. Saves 30-50% water. Fertigation possible. Govt subsidies available (50-90%).
- Sprinkler: 70-80% efficient. Good for wheat, pulses, groundnut. Not for heavy clay. Mini-sprinklers for orchards.
- Furrow: For row crops. 60-90cm apart. 50-60% efficient. Alternate furrow irrigation saves 25% water.
- Flood/Basin: For rice paddies. 30-40% efficient. Level field with laser leveler for uniform distribution.
- Rainwater Harvesting: Farm ponds (10x10x3m). Line with plastic or silpaulin. Stores 300,000 liters. Can irrigate 0.5-1 acre.
- WATER CONSERVATION:
  - Mulching: Saves 25-30% water. Straw, plastic, or organic mulch.
  - Raised bed planting: Saves 30% water for wheat.
  - Deficit irrigation: Reduce water at less critical stages, full water at critical stages.
  - Avoid irrigation during peak heat (10am-4pm). Evening irrigation reduces evaporation.
- DROUGHT TIPS: Grow short-duration varieties. Mulch heavily. Apply potash for stress tolerance. Reduce plant population 25%. Use moisture sensors.`
  },
  // CLIMATE
  {
    id: "climate-agriculture",
    keywords: ["climate", "drought", "flood", "heat", "cold", "frost", "weather", "season", "monsoon", "kharif", "rabi", "zaid", "temperature"],
    content: `CLIMATE-SMART FARMING:
- Drought: Grow drought-tolerant (bajra, jowar, moth bean, cluster bean). Mulch heavily. Apply potash. Reduce spacing 25%. Use rainwater harvesting.
- Flood: Short-duration varieties. Drainage channels. Raised beds. After flood: spray 2% urea on surviving crops, lime waterlogged fields, re-sow if crop lost.
- Heat (>40°C): Irrigate evening. Kaolin spray reflects sunlight. Shade nets for vegetables (50%). Heat-tolerant varieties. Don't spray chemicals in heat.
- Frost: Irrigate evening before frost. Smoke screens (burn wet straw). Cover nurseries. Spray 0.1% sulfuric acid (controversial but traditional).
- Heavy Rain: Ensure drainage. Stake tall plants. Avoid spraying (pesticide washes off). Wait 2 days after rain to spray. Apply fungicide preventively.
- Seasonal Calendar (India):
  - Kharif (June-Oct): Rice, cotton, maize, soybean, groundnut, sorghum, millets, sesame
  - Rabi (Oct-March): Wheat, mustard, gram, barley, pea, lentil, potato, onion
  - Zaid (March-June): Watermelon, cucumber, muskmelon, moong, fodder, vegetables`
  },
  // ORGANIC FARMING
  {
    id: "organic-farming",
    keywords: ["organic", "natural", "bio", "compost", "vermi", "cow", "dung", "jeevamrut", "panchagavya", "biofertilizer"],
    content: `ORGANIC FARMING PRACTICES:
- Jeevamrut: 10kg cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour + handful soil in 200L water. Ferment 7 days. Apply 500L/acre through irrigation. Boosts soil microbes.
- Panchagavya: Cow dung, urine, milk, curd, ghee in specific ratios. Ferment 21 days. Spray 3% solution. Growth promoter and disease resistance.
- Vermicomposting: Eisenia fetida worms. Bed 2ft wide. Feed crop residues + cow dung. Harvest 45-60 days. Apply 2-3t/ha. Rich in NPK and microbes.
- Green Manuring: Dhaincha/Sunhemp for 45-60 days. Plough in. Adds 60-80kg N/ha. Also Sesbania, Crotolaria.
- Neem Cake: 250kg/ha soil application. Controls nematodes, white grub. Also slow-release nitrogen.
- Bio-fertilizers: Rhizobium (legumes), Azotobacter (cereals, vegetables), Azospirillum (millets, sugarcane), PSB (all crops), Mycorrhiza (trees, vegetables).
- Bio-pesticides: Trichoderma viride (soil-borne diseases), Pseudomonas fluorescens (wilt, blight), Beauveria bassiana (white grub, borers), Metarhizium (termites).
- Crop Rotation for Organic: Cereal → Legume → Oilseed. Example: Rice → Gram → Sesame. Breaks pest cycles, improves soil.`
  },
  // FRUITS
  {
    id: "fruit-cultivation",
    keywords: ["fruit", "mango", "banana", "citrus", "orange", "lemon", "guava", "papaya", "grape", "pomegranate", "apple", "litchi"],
    content: `FRUIT CROP GUIDE:
- Mango: 10x10m spacing. Prune after harvest. NPK 1:0.5:1 kg/tree/year of age. Spray Imidacloprid for hopper at flowering. Bagging reduces fruit fly. Alternance: apply Paclobutrazol.
- Banana: Tissue culture plants at 1.8x1.8m. NPK 200:50:200g/plant. Prop plants when bunching. De-sucker regularly. Harvest when fingers round. Panama wilt: use resistant variety (Grand Naine).
- Citrus: 6x6m. NPK 600:200:100g/tree (5+ years). Copper fungicide for canker. Trunk borer: inject Dichlorvos. Greening disease: remove infected trees.
- Papaya: 2x2m. 70% female/hermaphrodite plants. NPK 250:250:500g/plant/year. Ring spot virus: remove infected plants, control aphids.
- Guava: 6x6m. Prune for shape. Stress irrigation for off-season fruiting. Wilt: Trichoderma soil treatment. Very profitable — low maintenance.
- Pomegranate: 5x5m. Bahar treatment for regulated fruiting. Bacterial blight: Streptocycline spray. Anar butterfly: bag fruits.
- Grape: Trellising essential. 3x1.5m. Heavy pruning twice yearly. Downy mildew: Metalaxyl. Powdery mildew: Sulfur.`
  },
  // SUGARCANE
  {
    id: "sugarcane-guide",
    keywords: ["sugarcane", "ganna", "sugar", "jaggery", "ratoon"],
    content: `SUGARCANE CULTIVATION:
- Planting: Feb-March (spring), Oct (autumn). Setts with 2-3 buds. Furrow spacing 75-90cm. Treat setts with Carbendazim for red rot.
- Fertilizer: NPK 300:100:150 kg/ha. N in 3-4 splits. Apply at 30-day intervals. Earthing up at 90-120 days.
- Irrigation: 25-30 irrigations. Critical: Germination, Tillering, Grand growth. Skip during maturity.
- Pests: Early shoot borer (Carbofuran in leaf whorl), Top borer (release Trichogramma), Scale insect (Dimethoate spray). Intercrop with mustard to attract beneficials.
- Diseases: Red Rot — most devastating. Use resistant varieties. Treat setts with Carbendazim. Smut — remove whip-like structures. Wilt — hot water treat setts at 54°C for 30 min.
- Ratoon: One ratoon crop economical. Apply 25% extra nitrogen. Gap fill within 30 days. Shave stubble close to ground.
- Harvest: 10-12 months (early varieties) to 14-16 months. Cut at ground level. Crush within 24 hours.`
  },
  // PULSES / LEGUMES
  {
    id: "pulses-guide",
    keywords: ["pulse", "gram", "chana", "lentil", "masoor", "moong", "mung", "urad", "pigeon pea", "arhar", "tur", "dal", "legume"],
    content: `PULSE CROPS:
- Chickpea (Gram/Chana): Rabi crop. Sow Oct-Nov. 80kg/ha seed rate. 20:40:20 NPK. One irrigation at flowering if dry. Wilt: Trichoderma seed treatment. Pod borer: Emamectin spray at podding.
- Pigeon Pea (Arhar/Tur): Kharif. Sow June-July. 15-20kg/ha. 20:40:20 NPK. Pod fly + pod borer major pests. Spray Profenophos at 50% podding. Wilt: resistant varieties (ICPL-87119).
- Lentil (Masoor): Rabi. Sow Oct-Nov. 40-50kg/ha. 20:40:20 NPK. Rust: Mancozeb spray. Very drought-sensitive at flowering.
- Mung Bean: Kharif/Zaid. 60 days crop. 15-20kg/ha. 20:40:0 NPK. Yellow mosaic: control whitefly. Short-duration — good for rotation.
- Urad (Black Gram): Similar to mung. Slightly more disease prone. Yellow mosaic major problem. Sow at 25-30kg/ha.
- ALL PULSES: Treat seed with Rhizobium + PSB. Fixes 50-200 kg N/ha. Excellent in rotation. Minimum tillage works well.`
  },
  // OILSEEDS
  {
    id: "oilseeds-guide",
    keywords: ["mustard", "groundnut", "peanut", "sunflower", "sesame", "til", "castor", "safflower", "oilseed", "rapeseed"],
    content: `OILSEED CROPS:
- Mustard/Rapeseed: Rabi. Sow Oct. 5-6kg/ha. 80:40:20 NPK. Aphid: Dimethoate at pod stage. White rust: Metalaxyl. Irrigate at flowering. Harvest when 75% pods turn yellow.
- Groundnut: Kharif/Rabi. 80-100kg/ha kernel. 20:40:40 NPK + Gypsum 250kg/ha at flowering. Tikka disease: Mancozeb. Aflatoxin: dry properly to 8% moisture.
- Sunflower: Any season. 5-6kg/ha. 80:60:30 NPK. Hand-pollinate by rubbing heads together at 50% flowering. Head rot: Mancozeb. Bird netting at maturity.
- Sesame (Til): Kharif. 5kg/ha broadcast. 40:20:20 NPK. Short duration (80-90 days). Phyllody: control leafhoppers. Harvest when lower pods turn brown.
- Castor: 10-15kg/ha. 40:30:30 NPK. Semi-looper: Quinalphos. Wilt: Trichoderma. Drought-tolerant — good for dry areas.`
  },
  // SPICES
  {
    id: "spices-guide",
    keywords: ["spice", "turmeric", "ginger", "garlic", "coriander", "cumin", "fennel", "fenugreek", "cardamom", "black pepper"],
    content: `SPICE CROP GUIDE:
- Turmeric: Plant May-June. Seed rate 2000-2500kg/ha rhizomes. Space 45x15cm. NPK 60:30:90. Mulch with leaves. Harvest at 8-9 months when leaves dry. Rhizome rot: Mancozeb drench.
- Ginger: Plant April-May. 1500kg/ha seed rhizomes. 30x25cm. NPK 75:50:50. Heavy mulching essential. Soft rot: Mancozeb drench + drainage. Harvest 8-9 months.
- Garlic: Plant Oct-Nov. 500kg/ha cloves. 15x10cm. NPK 50:50:50. Stop irrigation 15 days before harvest. Purple blotch: Mancozeb. Thrips: Fipronil.
- Coriander: Sow Oct-Nov for grain, year-round for leaf. 15-20kg/ha. 40:20:20 NPK. Wilt: Trichoderma. Aphid: Neem oil. Powdery mildew: Sulfur.
- Cumin (Jeera): Rabi. 12-15kg/ha. 30:20:20 NPK. Wilt: Trichoderma seed treatment. Blight: Mancozeb. Very sensitive to excess moisture.`
  },
  // MARKET & ECONOMICS
  {
    id: "market-economics",
    keywords: ["price", "market", "sell", "profit", "income", "cost", "msp", "mandi", "storage", "post harvest", "value addition"],
    content: `FARMING ECONOMICS & MARKETING:
- MSP (Minimum Support Price): Government announces annually for 23 crops. Check current MSP before selling.
- Mandi Tips: Grade produce before selling. Clean and sort by size. Sell when arrivals are low (better price). Check prices at multiple mandis.
- Storage: Grain at <12% moisture. Use metal bins or PUSA bags. Neem leaves between layers repel insects. Aluminum phosphide fumigation for stored grain pests.
- Value Addition: Make pickles, jams, dried products. Turmeric powder sells 3-5x raw. Mushroom: very high returns on small area. Vermicompost: sell extra.
- Cost Reduction: Use farm-saved seed (non-hybrid), make own compost, do soil testing to avoid excess fertilizer, use IPM to reduce pesticide costs.
- Subsidies: Check PM-KISAN, PKVY (organic), PMFBY (crop insurance), subsidy on drip/sprinkler, soil health card scheme, NABARD refinance.
- CROP DIVERSIFICATION: Don't depend on one crop. Grow 2-3 crops per year. Mix high-risk high-reward with safe crops.`
  },
  // LIVESTOCK INTEGRATION
  {
    id: "livestock-integration",
    keywords: ["cow", "buffalo", "goat", "poultry", "chicken", "dairy", "milk", "fodder", "animal", "livestock", "cattle"],
    content: `LIVESTOCK & INTEGRATED FARMING:
- Dairy: Keep 2-3 cows/buffaloes. Feed: Green fodder 25-30kg + dry fodder 5-6kg + concentrate 3-4kg per day. Provide clean water 3-4 times.
- Fodder Crops: Napier grass (perennial, cut every 45 days), Berseem (Rabi), Jowar/Maize (Kharif fodder). Azolla — grows in shallow water, protein-rich supplement.
- Goat Farming: Low investment. 10-12 goats sustainable unit. Browse feeding + concentrate 200g/day. Vaccinate for PPR, Enterotoxemia.
- Poultry: 50-100 backyard birds for extra income. Feed: 120-150g/bird/day. Vaccinate for Ranikhet, Marek's. Provide clean water and ventilation.
- Integration Benefits: Cow dung → compost/biogas → fertilizer. Crop residues → fodder. Poultry litter → fertilizer. Fish in farm pond.
- Biogas: 2-3 cows = enough dung for family biogas (2 cubic meter plant). Saves LPG. Slurry is excellent fertilizer.`
  },
  // PROTECTED CULTIVATION
  {
    id: "protected-cultivation",
    keywords: ["greenhouse", "polyhouse", "shade net", "protected", "net house", "nursery", "seedling"],
    content: `PROTECTED CULTIVATION:
- Polyhouse: Fan-pad or naturally ventilated. Cost: ₹800-1500/sqm. Grow capsicum, cucumber, tomato year-round. 3-5x higher yield. Govt subsidy 50-75%.
- Shade Net House: 50-75% shade. Cost: ₹200-400/sqm. Good for nursery, leafy vegetables, flower production. Reduces heat stress 8-10°C.
- Mulch Film: Black plastic mulch controls weeds, conserves moisture. Silver mulch repels aphids. Red mulch benefits tomato.
- Low Tunnels: Cheap protection for early crop. Bamboo hoops + plastic sheet. Good for winter vegetables, strawberry.
- Nursery Management: Use pro-trays (98/200 cells). Cocopeat+vermicompost+perlite (3:1:1) media. Harden seedlings 5-7 days before transplanting.
- Hydroponics: Nutrient Film Technique (NFT) for leafy greens. Cost-effective for urban/peri-urban. High-tech but high returns.`
  },
  // COMMON PLANT PROBLEMS
  {
    id: "common-problems",
    keywords: ["yellow", "wilting", "dying", "drying", "curling", "spots", "holes", "not growing", "stunted", "dropping", "falling", "brown", "black", "white", "red"],
    content: `COMMON PLANT PROBLEMS - QUICK DIAGNOSIS:
- YELLOWING LEAVES:
  - Older leaves yellow → Nitrogen deficiency → Apply urea 25-50kg/ha
  - New leaves yellow with green veins → Iron deficiency → Spray ferrous sulphate 0.5%
  - All leaves uniformly yellow → Waterlogging or root rot → Improve drainage, apply Trichoderma
  - Yellow patches/mosaic → Virus → Control insect vectors, remove infected plants
- WILTING:
  - Sudden wilt without yellowing → Bacterial wilt → Remove plant, add lime, rotate crops
  - Gradual wilt with yellowing → Fusarium wilt → Trichoderma treatment, resistant varieties
  - Wilting in afternoon, recovers morning → Water stress → Increase irrigation
- LEAF SPOTS:
  - Brown spots with rings → Fungal (early blight type) → Mancozeb spray
  - Water-soaked spots → Bacterial → Copper-based spray, reduce humidity
  - White powdery coating → Powdery mildew → Sulfur or Carbendazim
- CURLING LEAVES: Usually viral (whitefly-transmitted) or mite damage. Control vectors.
- HOLES IN LEAVES: Caterpillars or beetles. Hand-pick or spray Emamectin.
- STUNTED GROWTH: Check soil pH, nutrient deficiency, nematodes, or root problems.`
  },
  // SEED TREATMENT
  {
    id: "seed-treatment",
    keywords: ["seed", "treatment", "germination", "nursery", "sowing", "planting material"],
    content: `SEED TREATMENT & MANAGEMENT:
- Chemical Treatment: Thiram (2.5g/kg) for fungal diseases. Imidacloprid (5ml/kg) for sucking pest protection. Carbendazim (2g/kg) for wilt-prone crops.
- Biological Treatment: Trichoderma viride (4g/kg) — best for soil-borne diseases. Pseudomonas (10g/kg) — bacterial disease protection. Apply after chemical treatment, shade dry.
- Bio-fertilizer Treatment: Rhizobium for legumes, Azotobacter for cereals, PSB for all. Apply 25g per kg seed. Shade dry. Don't mix with chemicals.
- Seed Priming: Soak in water 12-24hrs. Improves germination 10-15%. Hydro-priming for drought areas.
- Seed Rate Guide: Rice 40-50kg/ha, Wheat 100-125kg/ha, Maize 20kg/ha, Soybean 60-70kg/ha, Gram 80kg/ha, Mustard 5-6kg/ha.
- Seed Selection: Use certified seed from authorized dealers. Replace seed every 3 years for self-pollinated crops. Always buy hybrid seed fresh.
- Germination Test: Place 100 seeds on wet cloth. Keep moist 7 days. Count sprouted. Below 70% → increase seed rate proportionally.`
  },
];

// ─── TF-IDF–inspired retrieval ───
function retrieveRelevantChunks(query: string, topK = 5): string[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/[\s,;.!?]+/).filter(w => w.length > 2);

  // Simple stemming: remove common suffixes
  const stem = (w: string) => w.replace(/(ing|ed|ly|tion|ment|ness|es|s)$/, "");
  const queryStems = queryWords.map(stem);

  const scored = KNOWLEDGE_CHUNKS.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();

    // Keyword matches (high weight)
    for (const keyword of chunk.keywords) {
      if (queryLower.includes(keyword)) {
        score += 5;
      }
      for (const qs of queryStems) {
        if (keyword.includes(qs) || qs.includes(keyword.substring(0, 4))) {
          score += 2;
        }
      }
    }

    // Content term frequency
    for (const word of queryWords) {
      const regex = new RegExp(word, "gi");
      const matches = contentLower.match(regex);
      if (matches) {
        // IDF-like: shorter chunks with matches score higher per match
        score += matches.length * (1 + 1 / Math.log(chunk.content.length));
      }
    }

    // Bonus for stem matches in content
    for (const qs of queryStems) {
      if (qs.length >= 4 && contentLower.includes(qs)) {
        score += 1.5;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.filter(s => s.score > 0).slice(0, topK);

  if (results.length === 0) {
    return [
      KNOWLEDGE_CHUNKS.find(c => c.id === "common-problems")!.content,
      KNOWLEDGE_CHUNKS.find(c => c.id === "pest-control-general")!.content,
    ];
  }

  return results.map(r => r.chunk.content);
}

const SYSTEM_PROMPT = `You are FarmWise AI — a friendly, practical farming assistant. Talk like you're advising a fellow farmer, not writing a textbook.

RESPONSE FORMAT — Follow this structure for EVERY answer:

✅ **Quick Solution**
• Give 3–4 immediate actions the farmer can take right now
• Use very simple, short sentences
• No technical jargon

🔍 **Possible Reasons**
• List common causes in plain language
• Keep each reason to one short line

🌱 **Detailed Advice**
• Step-by-step instructions a farmer can follow
• Include fertilizer names, pest control methods, watering tips where relevant
• Use numbered steps or bullet points

⚠️ **Safety Tips**
• 2–3 short precautions (protective gear, waiting periods, etc.)

❓ **Need More Info?**
• Ask 1 simple follow-up question to give better advice

STRICT RULES:
- NEVER start with "Based on retrieved data…", "According to the database…", or similar phrases.
- NEVER use heavy scientific terms. If you must mention a chemical, add a simple explanation.
- NEVER write long paragraphs — always use bullet points or numbered lists.
- Keep sentences SHORT (under 15 words when possible).
- Write like you're chatting with a farmer in person.
- Use the emoji headers (✅ 🔍 🌱 ⚠️ ❓) exactly as shown above.
- All advice must be grounded in the retrieved agricultural knowledge context provided.
- Be practical and action-oriented — farmers need things they can DO, not theory.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) throw new Error("Invalid messages");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // RAG Step 1: Extract the latest user query
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const query = lastUserMsg?.content || "";

    // RAG Step 2: Retrieve relevant knowledge chunks
    const retrievedChunks = retrieveRelevantChunks(query);
    const context = retrievedChunks.join("\n\n---\n\n");

    // RAG Step 3: Build augmented prompt
    const augmentedSystemPrompt = `${SYSTEM_PROMPT}

═══ RETRIEVED AGRICULTURAL KNOWLEDGE ═══
Use the following as your PRIMARY source. Ground all advice in this context:

${context}

═══ END OF CONTEXT ═══

Answer the farmer's question using the above knowledge. If context doesn't fully cover the question, provide your best practical agriculture advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: augmentedSystemPrompt },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI request failed with status ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
