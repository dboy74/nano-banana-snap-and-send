import { useState } from "react";
import { ArrowLeft, Send, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailSenderProps {
  imageUrl: string;
  onEmailSent: () => void;
  onBack: () => void;
}

export const EmailSender = ({ imageUrl, onEmailSent, onBack }: EmailSenderProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast("Please enter an email address!");
      return;
    }

    if (!email.includes("@")) {
      toast("Please enter a valid email address!");
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-image-email', {
        body: {
          to: email,
          name: name || "Someone",
          message: message || "Check out this amazing photo transformation!",
          imageUrl: imageUrl
        }
      });

      if (error) throw error;

      toast("🎉 Your transformed photo has been sent!");
      onEmailSent();
    } catch (error) {
      console.error("Email sending error:", error);
      toast("Oops! Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
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
          disabled={isSending}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Share Your Creation
        </h2>
      </div>

      {/* Image preview */}
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-glow">
        <img
          src={imageUrl}
          alt="Transformed photo"
          className="w-full h-auto max-h-64 object-cover"
        />
        <div className="absolute top-2 right-2 bg-success rounded-full p-1">
          <CheckCircle className="w-4 h-4 text-success-foreground" />
        </div>
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Send to email address *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="bg-input/50 border-border/50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Your name (optional)
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-input/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-foreground">
            Message (optional)
          </Label>
          <Input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Check out this amazing photo transformation!"
            className="bg-input/50 border-border/50"
          />
        </div>

        <Button
          type="submit"
          disabled={isSending}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-glow h-12 text-lg"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending Magic...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Photo
            </>
          )}
        </Button>
      </form>
    </div>
  );
};