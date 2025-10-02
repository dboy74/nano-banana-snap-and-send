import { useState, useRef, useEffect } from "react";
import { Camera, Aperture, Wand2, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CameraPreview } from "./CameraPreview";
import { ImageEditor } from "./ImageEditor";
import { EmailSender } from "./EmailSender";

type AppStep = "camera" | "editing" | "email";

export const CameraApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleImageCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setCurrentStep("editing");
    toast("📸 Perfekt bild! Nu ska vi göra den rolig!");
  };

  const handleImageEdited = (editedImageUrl: string) => {
    setEditedImage(editedImageUrl);
    setCurrentStep("email");
    toast("✨ Fantastisk transformation! Redo att dela?");
  };

  const handleReset = () => {
    setCapturedImage(null);
    setEditedImage(null);
    setCurrentStep("camera");
    toast("🔄 Börjar om från början!");
  };

  const handleEmailSent = () => {
    toast("📧 Bilden skickades!");
    setTimeout(() => {
      handleReset();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-bounce-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Aperture className="w-8 h-8 text-primary animate-pulse-glow" />
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Foto & Fantasi
            </h1>
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
        <Card className="p-6 bg-card/80 backdrop-blur-lg border-border/50 shadow-glow">
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
          
          {currentStep === "email" && editedImage && (
            <EmailSender
              imageUrl={editedImage}
              onEmailSent={handleEmailSent}
              onBack={() => setCurrentStep("editing")}
            />
          )}
        </Card>

        {/* Reset button - always visible */}
        {currentStep !== "camera" && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 bg-secondary/50 hover:bg-secondary/70 border-border/50"
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