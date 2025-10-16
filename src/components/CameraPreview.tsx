import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CameraPreviewProps {
  onImageCaptured: (imageDataUrl: string) => void;
}

export const CameraPreview = ({ onImageCaptured }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async (facing: "user" | "environment" = "user") => {
    try {
      setError(null);
      setIsLoading(true);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      setStream(newStream);
      setFacingMode(facing);
      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Kameraåtkomst nekad. Vänligen tillåt kamerabehörigheter och försök igen.");
      setIsLoading(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onImageCaptured(imageDataUrl);
  };

  const startCountdown = () => {
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          captureImage();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownTimerRef.current = timer;
  };

  const switchCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    startCamera(newFacing);
  };

  useEffect(() => {
    startCamera();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => startCamera(facingMode)} 
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <Camera className="w-4 h-4 mr-2" />
          Försök igen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-center text-foreground tracking-wide">
        Vad vill du bli idag?
      </h2>

      {/* Camera preview with glassmorphism frame */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[hsl(240_15%_12%)] to-[hsl(345_20%_25%)] p-1 shadow-glow">
        <div className="relative rounded-[22px] overflow-hidden bg-black aspect-[4/3] backdrop-blur-xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Startar kamera...</p>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
              <div className="text-white text-9xl font-bold animate-scale-in">
                {countdown}
              </div>
            </div>
          )}
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
          
          {/* Camera overlay effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/60 rounded-tl-lg shadow-glow" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/60 rounded-tr-lg shadow-glow" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/60 rounded-bl-lg shadow-glow" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/60 rounded-br-lg shadow-glow" />
          </div>
        </div>
      </div>

      {/* Camera controls */}
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={switchCamera}
          className="rounded-full w-14 h-14 bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 transition-all duration-300 hover:scale-110 hover:shadow-glow"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        <Button
          onClick={startCountdown}
          disabled={isLoading || countdown !== null}
          className="relative w-24 h-24 rounded-full bg-white hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105 group border-4 border-white/30"
        >
          <div className="absolute inset-2 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center">
            <Camera className="w-10 h-10 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
        </Button>

        <div className="w-14 h-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};