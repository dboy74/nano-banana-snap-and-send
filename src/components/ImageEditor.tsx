import { useState } from "react";
import { ArrowLeft, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageEditorProps {
  originalImage: string;
  onImageEdited: (editedImageUrl: string, promptUsed: string) => void;
  onBack: () => void;
}

const FUNNY_PROMPTS = [
  { text: "Superhjälte 🦸", icon: "🦸‍♂️" },
  { text: "Tecknad figur 🎨", icon: "🎭" },
  { text: "Cool med solglasögon 😎", icon: "🕶️" },
  { text: "Medeltida riddare ⚔️", icon: "⚔️" },
  { text: "Regnbågshår & glitter 🌈", icon: "🌈" },
  { text: "Pirat 🏴‍☠️", icon: "🏴‍☠️" },
];

export const ImageEditor = ({ originalImage, onImageEdited, onBack }: ImageEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const processImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast("Vänligen ange en transformationsidé!");
      return;
    }

    setIsProcessing(true);
    setCurrentPrompt(prompt);
    
    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          imageUrl: originalImage,
          prompt: prompt
        }
      });

      if (error) throw error;

      if (data?.editedImageUrl) {
        onImageEdited(data.editedImageUrl, prompt);
      } else {
        throw new Error("No edited image received");
      }
    } catch (error) {
      console.error("Image editing error:", error);
      toast("Hoppsan! Något gick fel. Vänligen försök igen.");
    } finally {
      setIsProcessing(false);
      setCurrentPrompt("");
    }
  };

  const handlePromptClick = (prompt: string) => {
    processImage(prompt);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processImage(customPrompt);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full transition-all hover:scale-105"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          Transformera din bild
        </h2>
      </div>

      {/* Image preview */}
      <div className="relative rounded-[20px] overflow-hidden bg-black shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <img
          src={originalImage}
          alt="Captured photo"
          className="w-full h-auto max-h-64 object-cover"
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm text-center px-4">
              ✨ Skapar magi med: "{currentPrompt}"
            </p>
          </div>
        )}
      </div>

      {!isProcessing && (
        <>
          {/* Custom prompt - Now at the top */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Vad vill du bli?
            </h3>
            <form onSubmit={handleCustomSubmit} className="flex gap-3">
              <Input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Skriv vad du vill bli..."
                className="flex-1 bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50"
              />
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90 hover:shadow-glow transition-all px-6"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Fun prompt buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Eller välj ett förslag
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {FUNNY_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePromptClick(prompt.text)}
                  className="h-auto p-4 text-left bg-gradient-accent hover:opacity-90 hover:scale-[1.02] border-0 text-accent-foreground font-medium transition-all"
                >
                  <span className="text-sm leading-tight">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};