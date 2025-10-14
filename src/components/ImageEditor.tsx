import { useState } from "react";
import { ArrowLeft, Wand2, Loader2, Sparkles, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";

interface ImageEditorProps {
  originalImage: string;
  onImageEdited: (editedImageUrl: string, promptUsed: string) => void;
  onBack: () => void;
}

const CRAZY_PROMPT_EXAMPLES = [
  "Förvandla personen till en galen 80-årig skateboardåkare med rosa mohawk och neongrön kavaj som spelar elbas",
  "Gör personen till en vikingakrigare med discokula istället för sköld och lasersvärd, omgiven av neonljus",
  "Förvandla personen till en astronaut-pirat som rider på en regnbågsfärgad enhörning genom ett moln av glass",
  "Gör personen till en cyberpunk-farmor med robotarmar som jonglerar med flammande pizzor",
  "Förvandla personen till en medeltida riddare i full rustning som surfar på en jättevåg av choklad",
  "Gör personen till en DJ-vampyr med lysande headset och vingar gjorda av vinylskivor",
  "Förvandla personen till en ninja-kock som hoppar mellan gigantiska sushirullar i rymden",
  "Gör personen till en steampunk-detektiv med jetpack gjord av koppar och mässing som flyger över London",
  "Förvandla personen till en zombie-ballerina i tutu som dansar balett på månen med neonrosa tutuskor",
  "Gör personen till en cowboy-alv med laserrevolver och magiska kristaller i hatten, ridande på en jätte-tacobjörn",
  "Förvandla personen till framtidens tidsresande trädgårdsmästare med holografiska blommor och ett rymdskottkärra",
  "Gör personen till en superhero-bibliotekarie med manteln gjord av flygande böcker och glasögon som skjuter laser",
  "Förvandla personen till en dinosaurie-barista som lagar kaffe med vulkanutbrott i en djungelcafé",
  "Gör personen till en intergalaktisk tandfe med robotvingar och en väska full av guldtänder och stjärnstoft",
  "Förvandla personen till en punkrock-munk med tatueringar på skalpen, eldgitarr och kärleksfull aura i ett neonljust tempel",
  "Gör personen till en tidsmaskinsoperatör-pingvin i frack med klocka i näbben och portaler bakom sig",
];

const FUNNY_PROMPTS = [
  { text: "Förvandla personen till en superhjälte med lasersvärd 🦸", icon: "🦸‍♂️" },
  { text: "Förvandla personen till en pirat med papegoja 🏴‍☠️", icon: "🏴‍☠️" },
  { text: "Gör om personen till en cyberpunk-rockstjärna 🎸", icon: "🎸" },
  { text: "Förvandla personen till en rymdäventyrare 🚀", icon: "🚀" },
  { text: "Gör personen till en medeltida trollkarl 🧙", icon: "🧙" },
  { text: "Förvandla personen till en dinosaurietämjare 🦖", icon: "🦖" },
];

export const ImageEditor = ({ originalImage, onImageEdited, onBack }: ImageEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentExample, setCurrentExample] = useState(
    CRAZY_PROMPT_EXAMPLES[Math.floor(Math.random() * CRAZY_PROMPT_EXAMPLES.length)]
  );

  const getRandomExample = () => {
    const newExample = CRAZY_PROMPT_EXAMPLES[Math.floor(Math.random() * CRAZY_PROMPT_EXAMPLES.length)];
    setCurrentExample(newExample);
  };

  const processImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast("Vänligen ange en transformationsidé!");
      return;
    }

    setIsProcessing(true);
    setCurrentPrompt(prompt);
    
    try {
      const sessionId = getSessionId();
      
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          sessionId: sessionId,
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
            
            {/* Encouraging example section */}
            <div className="bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white mb-1">💡 JU MER GALEN, DESTO ROLIGARE!</p>
                  <p className="text-sm text-foreground/90 italic">
                    "{currentExample}"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={getRandomExample}
                  className="shrink-0 h-8 w-8 hover:bg-accent/20"
                  type="button"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Var kreativ! Kombinera olika världar, lägg till galna detaljer, blanda tidsperioder..."
                className="min-h-[120px] bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50 resize-none font-ubuntu"
              />
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90 hover:shadow-glow transition-all w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Transformera
              </Button>
            </form>
          </div>

          {/* Fun prompt buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Eller välj ett förslag
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {FUNNY_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePromptClick(prompt.text)}
                  className="h-auto p-3 text-left hover:bg-accent hover:text-accent-foreground font-medium transition-all text-sm font-ubuntu"
                >
                  <span className="leading-tight">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};