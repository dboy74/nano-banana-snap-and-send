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
    <div className="min-h-screen bg-background p-8 flex flex-col">
      {/* Header with logo and PRESENTS */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <img 
            src={spgLogo} 
            alt="Science Park Gotland" 
            className="h-8 w-auto"
          />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Presents</span>
        </div>
      </div>

      {/* Main centered content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl font-ubuntu font-bold tracking-wide text-foreground">
              AI.ISLAND
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-ubuntu font-normal text-foreground">
                Foto & Fantasi
              </h2>
              <p className="text-sm text-muted-foreground">
                Ta en bild och låt AI förändra den
              </p>
            </div>
          </div>

          {/* Main card */}
          <Card className="p-8 bg-card border-border shadow-lg">
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

          {/* Reset button */}
          {currentStep !== "camera" && (
            <div className="flex justify-center animate-fade-in">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2 hover:bg-accent transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Börja om
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};