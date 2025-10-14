import { useState, useEffect } from "react";
import { ArrowLeft, Send, Mail, Loader2, CheckCircle, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailSenderProps {
  originalImage: string;
  imageUrl: string;
  promptUsed: string;
  onEmailSent: () => void;
  onBack: () => void;
}

export const EmailSender = ({ originalImage, imageUrl, promptUsed, onEmailSent, onBack }: EmailSenderProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Kolla vilken cool transformation jag gjorde på AI Island! 🚀");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedOriginalUrl, setUploadedOriginalUrl] = useState<string | null>(null);
  const [uploadedGeneratedUrl, setUploadedGeneratedUrl] = useState<string | null>(null);


  // Upload images when component mounts
  useEffect(() => {
    const uploadImages = async () => {
      setIsUploadingImages(true);
      try {
        console.log("Laddar upp bilder till Supabase Storage...");
        
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        
        // Convert base64 to blob for original image
        const originalBlob = await fetch(originalImage).then(r => r.blob());
        const originalFileName = `${timestamp}-original-${randomId}.jpg`;
        
        // Convert base64 to blob for generated image
        const generatedBlob = await fetch(imageUrl).then(r => r.blob());
        const generatedFileName = `${timestamp}-generated-${randomId}.jpg`;
        
        // Upload original image
        const { data: originalData, error: originalError } = await supabase.storage
          .from('transformations')
          .upload(originalFileName, originalBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });
        
        if (originalError) throw originalError;
        
        // Upload generated image
        const { data: generatedData, error: generatedError } = await supabase.storage
          .from('transformations')
          .upload(generatedFileName, generatedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });
        
        if (generatedError) throw generatedError;
        
        // Get public URLs
        const { data: { publicUrl: originalPublicUrl } } = supabase.storage
          .from('transformations')
          .getPublicUrl(originalFileName);
        
        const { data: { publicUrl: generatedPublicUrl } } = supabase.storage
          .from('transformations')
          .getPublicUrl(generatedFileName);
        
        setUploadedOriginalUrl(originalPublicUrl);
        setUploadedGeneratedUrl(generatedPublicUrl);
        
        console.log("Bilder uppladdade!", { originalPublicUrl, generatedPublicUrl });
      } catch (error) {
        console.error("Bilduppladdningsfel:", error);
        toast("Kunde inte ladda upp bilder. Försök igen.");
      } finally {
        setIsUploadingImages(false);
      }
    };
    
    uploadImages();
  }, [originalImage, imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast("Vänligen ange en e-postadress!");
      return;
    }

    if (!email.includes("@")) {
      toast("Vänligen ange en giltig e-postadress!");
      return;
    }

    if (!gdprConsent) {
      toast("Du måste godkänna att vi sparar din e-post!");
      return;
    }

    if (!uploadedOriginalUrl || !uploadedGeneratedUrl) {
      toast("Bilder laddas fortfarande upp, vänta lite...");
      return;
    }

    setIsSending(true);

    try {
      // 1. Spara till databas först
      console.log("Sparar transformation till databas...");
      
      const { data, error } = await supabase
        .from('transformations')
        .insert({
          email: email.trim(),
          name: name.trim() || null,
          message: message.trim() || null,
          consent: gdprConsent,
          prompt_used: promptUsed,
          original_image_url: uploadedOriginalUrl,
          generated_image_url: uploadedGeneratedUrl
        })
        .select();

      if (error) throw error;

      console.log("Transformation sparad!", data);

      // 2. Skicka email med bilden
      try {
        console.log("Skickar email...");
        
        const { error: emailError } = await supabase.functions.invoke('send-image-email', {
          body: {
            email: email.trim(),
            name: name.trim() || undefined,
            imageUrl: uploadedGeneratedUrl
          }
        });

        if (emailError) {
          console.error("Email-fel:", emailError);
          toast("Bilden sparad men email kunde inte skickas");
        } else {
          console.log("Email skickat!");
          toast("Klart! Din transformation är sparad och skickad 📧");
        }
      } catch (emailError) {
        console.error("Email-fel:", emailError);
        toast("Bilden sparad men email kunde inte skickas");
      }

      setIsSent(true);
      
      // Redirect to start page after 3 seconds
      setTimeout(() => {
        onEmailSent();
      }, 3000);
    } catch (error) {
      console.error("Databas-fel:", error);
      toast("Något gick fel, försök igen");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Loading overlay while uploading images */}
      {isUploadingImages && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="text-center space-y-3">
            <Upload className="w-8 h-8 animate-bounce mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Laddar upp bilder...</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full transition-all hover:scale-105"
          disabled={isSending || isSent}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />
          Dela din skapelse
        </h2>
      </div>

      {/* Image preview with reveal animation */}
      <div className="relative rounded-[20px] overflow-hidden bg-black shadow-[0_8px_30px_rgb(0,0,0,0.4)] animate-reveal">
        <div className="absolute inset-0 animate-sparkle pointer-events-none">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-primary/60" />
          <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-accent/60" />
          <Sparkles className="absolute top-1/2 left-1/4 w-4 h-4 text-primary/40" />
        </div>
        <img
          src={imageUrl}
          alt="Transformed photo"
          className="w-full h-auto max-h-80 object-cover"
        />
        <div className="absolute top-3 right-3 bg-success rounded-full p-2 shadow-glow">
          <CheckCircle className="w-6 h-6 text-success-foreground" />
        </div>
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">
            Skicka till e-postadress *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.se"
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50 font-ubuntu"
            required
            disabled={isSending || isSent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground font-medium">
            Ditt namn (valfritt)
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt namn"
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50 font-ubuntu"
            disabled={isSending || isSent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-foreground font-medium">
            Meddelande (valfritt)
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Kolla vilken cool transformation jag gjorde på AI Island! 🚀"
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50 min-h-[80px] resize-none font-ubuntu"
            disabled={isSending || isSent}
          />
        </div>

        {/* GDPR Consent */}
        <div className="flex items-start gap-3 p-4 bg-card/30 rounded-lg border border-border/50">
          <Checkbox
            id="gdpr"
            checked={gdprConsent}
            onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
            disabled={isSending || isSent}
            className="mt-0.5"
          />
          <Label
            htmlFor="gdpr"
            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
          >
            Jag godkänner att Science Park Gotland sparar min e-post för att kontakta mig om AI Island och samarbetsmöjligheter
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isSending || isSent || !gdprConsent || isUploadingImages}
          className={`w-full h-12 text-lg transition-all ${
            isSent 
              ? "bg-success hover:bg-success" 
              : "bg-gradient-primary hover:opacity-90 hover:shadow-glow hover:scale-[1.02]"
          }`}
        >
          {isSent ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Skickat! ✓
            </>
          ) : isSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Skickar...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Skicka bild
            </>
          )}
        </Button>
      </form>
    </div>
  );
};