import { useState } from "react";
import { ArrowLeft, Send, Mail, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailSenderProps {
  imageUrl: string;
  promptUsed: string;
  onEmailSent: () => void;
  onBack: () => void;
}

export const EmailSender = ({ imageUrl, promptUsed, onEmailSent, onBack }: EmailSenderProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Kolla vilken cool transformation jag gjorde på AI Island! 🚀");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

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

    setIsSending(true);

    try {
      console.log("Sparar transformation till databas...");
      
      const { data, error } = await supabase
        .from('transformations')
        .insert({
          email: email.trim(),
          name: name.trim() || null,
          message: message.trim() || null,
          consent: gdprConsent,
          prompt_used: promptUsed
        })
        .select();

      if (error) throw error;

      console.log("Transformation sparad!", data);

      setIsSent(true);
      toast("Klart! Din transformation är sparad 📧");
      
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
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50"
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
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50"
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
            className="bg-input/50 border-border/50 transition-all focus:shadow-glow focus:border-primary/50 min-h-[80px] resize-none"
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
          disabled={isSending || isSent || !gdprConsent}
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