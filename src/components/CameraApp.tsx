import { useState, useRef, useEffect } from "react";
import { Camera, Aperture, RotateCcw, Clapperboard, Film, Video, Image as ImageIcon, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CameraPreview } from "./CameraPreview";
import { ImageEditor } from "./ImageEditor";
import { EmailSender } from "./EmailSender";
import spgLogo from "@/assets/spg-logo.png";
import { getSessionId, refreshSession } from "@/lib/session";

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
    // Initialize session on component mount
    const sessionId = getSessionId();
    console.log('App initialized with session:', sessionId);
    
    // Set up activity listeners
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    
    const handleActivity = () => {
      resetInactivityTimer();
      refreshSession(); // Keep session alive on activity
    };
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col relative overflow-hidden">
      {/* Floating camera icons in background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Camera className="absolute top-[10%] left-[5%] w-12 h-12 text-muted-foreground/5 animate-float-1" />
        <Aperture className="absolute top-[20%] right-[8%] w-16 h-16 text-muted-foreground/5 animate-float-2" />
        <Clapperboard className="absolute top-[15%] left-[25%] w-14 h-14 text-muted-foreground/6 animate-float-3" />
        <Film className="absolute top-[35%] right-[12%] w-11 h-11 text-muted-foreground/7 animate-float-1" />
        <Video className="absolute top-[45%] left-[8%] w-13 h-13 text-muted-foreground/5 animate-float-2" />
        <Camera className="absolute top-[60%] left-[10%] w-10 h-10 text-muted-foreground/8 animate-float-3" />
        <ImageIcon className="absolute top-[55%] right-[20%] w-12 h-12 text-muted-foreground/6 animate-float-1" />
        <Aperture className="absolute top-[70%] right-[15%] w-14 h-14 text-muted-foreground/5 animate-float-2" />
        <Focus className="absolute top-[25%] left-[15%] w-9 h-9 text-muted-foreground/7 animate-float-3" />
        <Camera className="absolute bottom-[15%] left-[20%] w-12 h-12 text-muted-foreground/5 animate-float-1" />
        <Film className="absolute bottom-[30%] right-[30%] w-10 h-10 text-muted-foreground/6 animate-float-2" />
        <Aperture className="absolute bottom-[25%] right-[5%] w-10 h-10 text-muted-foreground/8 animate-float-3" />
        <Clapperboard className="absolute bottom-[10%] left-[35%] w-13 h-13 text-muted-foreground/5 animate-float-1" />
        <Video className="absolute top-[80%] left-[40%] w-11 h-11 text-muted-foreground/7 animate-float-2" />
        <Camera className="absolute top-[40%] right-[25%] w-8 h-8 text-muted-foreground/5 animate-float-3" />
        <Aperture className="absolute top-[50%] left-[30%] w-12 h-12 text-muted-foreground/5 animate-float-1" />
        <ImageIcon className="absolute bottom-[40%] left-[5%] w-14 h-14 text-muted-foreground/6 animate-float-2" />
        <Focus className="absolute top-[85%] right-[18%] w-10 h-10 text-muted-foreground/5 animate-float-3" />
      </div>

      {/* Header with logo and PRESENTS */}
      <div className="w-full max-w-4xl mx-auto mb-8 relative z-10">
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
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-lg mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl font-ubuntu font-bold tracking-wide text-foreground">
              AI.ISLAND
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-ubuntu font-normal text-foreground">
                Ge din fantasi medvind
              </h2>
              <p className="text-sm text-muted-foreground">
                Från porträtt till pirat på en prompt
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

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto mt-8 text-center relative z-10">
        <p className="text-xs font-ubuntu text-muted-foreground">
          © 2025 Science Park Gotland • Innovation och entreprenörskap för en hållbar framtid
        </p>
      </footer>
    </div>
  );
};