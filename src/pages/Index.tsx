import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, MessageCircle, Cloud, Sprout, Wheat, Menu, X } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import DiseaseDetection from "@/components/DiseaseDetection";
import ChatAssistant from "@/components/ChatAssistant";
import WeatherAdvisory from "@/components/WeatherAdvisory";
import CropRecommendation from "@/components/CropRecommendation";
import CropPlanning from "@/components/CropPlanning";

type Section = "home" | "disease" | "chat" | "weather" | "crop" | "planning";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "disease", label: "Disease", icon: <Leaf className="w-5 h-5" /> },
  { id: "chat", label: "Ask AI", icon: <MessageCircle className="w-5 h-5" /> },
  { id: "weather", label: "Weather", icon: <Cloud className="w-5 h-5" /> },
  { id: "crop", label: "Crops", icon: <Sprout className="w-5 h-5" /> },
  { id: "planning", label: "Plan", icon: <Wheat className="w-5 h-5" /> },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "disease":
        return <DiseaseDetection />;
      case "chat":
        return <ChatAssistant />;
      case "weather":
        return <WeatherAdvisory />;
      case "crop":
        return <CropRecommendation />;
      case "planning":
        return <CropPlanning />;
      default:
        return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => setActiveSection("home")}
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Leaf className="w-7 h-7" />
            <span>FarmWise</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="container py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
