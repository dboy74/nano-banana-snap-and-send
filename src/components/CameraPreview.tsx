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
      setError("Camera access denied. Please allow camera permissions and try again.");
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
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-foreground">
        Ready to capture something amazing?
      </h2>

      {/* Camera preview */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-glow">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p>Starting camera...</p>
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
        
        {/* Camera overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50 rounded-br-lg" />
        </div>
      </div>

      {/* Camera controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={switchCamera}
          className="rounded-full w-12 h-12 bg-secondary/50 hover:bg-secondary/70 border-border/50"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        <Button
          onClick={captureImage}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-gradient-capture hover:opacity-90 shadow-capture animate-pulse-glow"
        >
          <Camera className="w-8 h-8" />
        </Button>

        <div className="w-12 h-12" /> {/* Spacer for symmetry */}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};