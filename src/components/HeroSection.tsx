import { motion } from "framer-motion";
import { Leaf, MessageCircle, Cloud, Sprout, Wheat, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

type Section = "home" | "disease" | "chat" | "weather" | "crop" | "planning";

interface HeroSectionProps {
  onNavigate: (section: Section) => void;
}

const features = [
  {
    id: "disease" as Section,
    icon: <Leaf className="w-8 h-8" />,
    title: "Disease Detection",
    description: "Upload a photo of your plant and get instant disease diagnosis with treatment steps.",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "chat" as Section,
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Ask AI Assistant",
    description: "Get answers to any farming question — from pest control to best fertilizers.",
    color: "bg-accent/10 text-accent",
  },
  {
    id: "weather" as Section,
    icon: <Cloud className="w-8 h-8" />,
    title: "Weather Advisory",
    description: "Check weather forecasts and get farming tips based on conditions.",
    color: "bg-info/10 text-info",
  },
  {
    id: "crop" as Section,
    icon: <Sprout className="w-8 h-8" />,
    title: "Crop Recommendations",
    description: "Find the best crops for your soil, season, and location.",
    color: "bg-success/10 text-success",
  },
  {
    id: "planning" as Section,
    icon: <Wheat className="w-8 h-8" />,
    title: "Crop Planning",
    description: "Check if a crop suits your land and get a full growing guide.",
    color: "bg-accent/10 text-accent",
  },
];

const HeroSection = ({ onNavigate }: HeroSectionProps) => {
  return (
    <div className="pb-24 md:pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Lush farmland" className="w-full h-full object-cover opacity-15" width={1920} height={800} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Leaf className="w-4 h-4" />
              Your Digital Farming Assistant
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4 text-balance leading-tight">
              Smarter Farming,{" "}
              <span className="text-primary">Better Harvests</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get AI-powered crop advice, disease detection, weather insights, and personalized recommendations — all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.button
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              onClick={() => onNavigate(feature.id)}
              className="group text-left p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
