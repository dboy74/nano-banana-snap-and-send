import { useState } from "react";
import { ArrowLeft, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageEditorProps {
  originalImage: string;
  onImageEdited: (editedImageUrl: string) => void;
  onBack: () => void;
}

const FUNNY_PROMPTS = [
  { text: "Turn me into a superhero!", icon: "🦸‍♂️" },
  { text: "Make me look like a cartoon character", icon: "🎭" },
  { text: "Add silly sunglasses and a mustache", icon: "🕶️" },
  { text: "Transform into a medieval knight", icon: "⚔️" },
  { text: "Give me rainbow hair and sparkles", icon: "🌈" },
  { text: "Make me look like a pirate", icon: "🏴‍☠️" },
  { text: "Turn into a space astronaut", icon: "🚀" },
  { text: "Add cat ears and whiskers", icon: "🐱" },
];

export const ImageEditor = ({ originalImage, onImageEdited, onBack }: ImageEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const processImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast("Please enter a transformation idea!");
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
        onImageEdited(data.editedImageUrl);
      } else {
        throw new Error("No edited image received");
      }
    } catch (error) {
      console.error("Image editing error:", error);
      toast("Oops! Something went wrong. Please try again.");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          Transform Your Photo
        </h2>
      </div>

      {/* Image preview */}
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-glow">
        <img
          src={originalImage}
          alt="Captured photo"
          className="w-full h-auto max-h-64 object-cover"
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm text-center px-4">
              ✨ Creating magic with: "{currentPrompt}"
            </p>
          </div>
        )}
      </div>

      {!isProcessing && (
        <>
          {/* Fun prompt buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Quick Transformations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FUNNY_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePromptClick(prompt.text)}
                  className="h-auto p-3 text-left bg-gradient-accent hover:opacity-90 border-0 text-accent-foreground font-medium"
                >
                  <span className="mr-2 text-lg">{prompt.icon}</span>
                  <span className="text-xs leading-tight">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Or Create Your Own
            </h3>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <Input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your transformation..."
                className="flex-1 bg-input/50 border-border/50"
              />
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90 px-6"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};