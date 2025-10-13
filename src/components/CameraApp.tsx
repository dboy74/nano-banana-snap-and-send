import { useState, useRef, useEffect } from "react";
import { Camera, Aperture, Wand2, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CameraPreview } from "./CameraPreview";
import { ImageEditor } from "./ImageEditor";
import { EmailSender } from "./EmailSender";
import spgLogo from "@/assets/spg-logo.png";

type AppStep = "camera" | "editing" | "email";

export const CameraApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState<string>("");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setCurrentStep("editing");
    toast("📸 Perfekt bild! Nu ska vi göra den rolig!");
  };

  const handleImageEdited = (editedImageUrl: string, prompt: string) => {
    setEditedImage(editedImageUrl);
    setPromptUsed(prompt);
    setCurrentStep("email");
    toast("✨ Fantastisk transformation! Redo att dela?");
  };

  const handleReset = () => {
    setCapturedImage(null);
    setEditedImage(null);
    setPromptUsed("");
    setCurrentStep("camera");
    toast("🔄 Börjar om från början!");
  };

  const handleEmailSent = () => {
    toast("📧 Bilden skickades!");
    setTimeout(() => {
      handleReset();
    }, 2000);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Only set timer if not on camera step
    if (currentStep !== "camera") {
      inactivityTimerRef.current = setTimeout(() => {
        handleReset();
        toast("🔄 Återgår till start efter inaktivitet");
      }, 60000); // 60 seconds
    }
  };

  useEffect(() => {
    // Set up activity listeners
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-bg p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-bounce-in">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={spgLogo} 
              alt="Science Park Gotland" 
              className="h-16 w-auto opacity-90"
            />
          </div>
          <div className="text-center mb-4">
            <h2 className="text-3xl font-montserrat font-bold tracking-wider text-foreground mb-2">
              AI.ISLAND
            </h2>
            <div className="flex items-center justify-center gap-3">
              <Aperture className="w-7 h-7 text-primary animate-pulse-glow drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-wider">
                Foto & Fantasi
              </h1>
            </div>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2">
            {["camera", "editing", "email"].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? "bg-primary shadow-glow scale-125"
                    : index < ["camera", "editing", "email"].indexOf(currentStep)
                    ? "bg-success"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card className="p-6 bg-card/40 backdrop-blur-xl border-border/30 shadow-glow transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
          {currentStep === "camera" && (
            <CameraPreview onImageCaptured={handleImageCaptured} />
          )}
          
          {currentStep === "editing" && capturedImage && (
            <ImageEditor
              originalImage={capturedImage}
              onImageEdited={handleImageEdited}
              onBack={() => setCurrentStep("camera")}
            />
          )}
          
          {currentStep === "email" && editedImage && capturedImage && (
            <EmailSender
              originalImage={capturedImage}
              imageUrl={editedImage}
              promptUsed={promptUsed}
              onEmailSent={handleEmailSent}
              onBack={() => setCurrentStep("editing")}
            />
          )}
        </Card>

        {/* Reset button - always visible */}
        {currentStep !== "camera" && (
          <div className="flex justify-center animate-fade-in">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 transition-all duration-300 hover:scale-105 hover:shadow-glow"
            >
              <RotateCcw className="w-4 h-4" />
              Börja om
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};