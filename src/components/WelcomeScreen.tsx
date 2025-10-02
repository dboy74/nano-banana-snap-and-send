import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const EXAMPLE_IMAGES = [
  {
    before: "Person standing normally",
    after: "Superhero with cape and mask",
  },
  {
    before: "Regular selfie",
    after: "Astronaut in space",
  },
  {
    before: "Simple portrait",
    after: "Pirate captain",
  },
  {
    before: "Normal photo",
    after: "Rock star on stage",
  },
];

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [currentExample, setCurrentExample] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % EXAMPLE_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 overflow-hidden flex items-center justify-center">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-pink-500/50 to-blue-500/50 animate-pulse-glow" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-12 px-6 max-w-4xl mx-auto">
        {/* Logo/Icon */}
        <div className="flex justify-center animate-bounce-in">
          <div className="relative">
            <Sparkles className="w-24 h-24 text-white drop-shadow-2xl animate-pulse-glow" />
            <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Main heading with glow effect */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-7xl md:text-8xl font-black text-white drop-shadow-2xl">
            <span className="inline-block animate-pulse-glow">
              AI ISLAND
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-medium drop-shadow-lg">
            Förvandla dig själv med AI-magi ✨
          </p>
        </div>

        {/* Example gallery preview */}
        <div 
          className="relative h-32 max-w-2xl mx-auto overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/30 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center space-y-2 transition-opacity duration-500">
              <p className="text-white/70 text-sm font-medium">Exempel:</p>
              <p className="text-white text-xl font-bold">
                {EXAMPLE_IMAGES[currentExample].before}
              </p>
              <p className="text-white/90 text-lg">→</p>
              <p className="text-white text-xl font-bold">
                {EXAMPLE_IMAGES[currentExample].after}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button - Extra large and impossible to miss */}
        <div className="animate-bounce-in pt-8" style={{ animationDelay: "0.6s" }}>
          <Button
            onClick={onStart}
            size="lg"
            className="text-3xl px-16 py-12 rounded-3xl font-black bg-white text-purple-600 hover:bg-white/90 shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse-glow border-4 border-white/50"
          >
            STARTA NU! 🚀
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <p className="text-white/60 text-sm font-medium">
            Powered by Science Park Gotland
          </p>
        </div>
      </div>
    </div>
  );
};
