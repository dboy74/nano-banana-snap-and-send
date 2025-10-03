import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name?: string;
  imageUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, imageUrl }: EmailRequest = await req.json();

    console.log("Skickar email till:", email, "med namn:", name);

    // Fetch the image from the URL and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const emailResponse = await resend.emails.send({
      from: "AI Island <onboarding@resend.dev>",
      to: [email],
      subject: "Din AI-transformation från AI Island 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Hej ${name || "där"}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Tack för att du testade AI Island på Företagardagen i Visby!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Här är din coola AI-transformation som bifogad fil.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
            <h3 style="color: #333; margin-top: 0;">Vill du veta mer om hur AI kan hjälpa ditt företag?</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #666;">
              Kontakta oss på Science Park Gotland:<br>
              <a href="mailto:info@scienceparkgotland.se" style="color: #0066cc;">info@scienceparkgotland.se</a>
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Vi ser fram emot att höra från dig!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666; margin-top: 30px;">
            Hälsningar,<br>
            <strong>AI Island-teamet</strong><br>
            Science Park Gotland
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "ai-island-transformation.jpg",
          content: base64Image,
        },
      ],
    });

    console.log("Email skickat!", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Fel vid email-skickning:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);