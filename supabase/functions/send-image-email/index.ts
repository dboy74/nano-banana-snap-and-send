import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const emailRequestSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(100).optional(),
  message: z.string().max(1000).optional(),
  imageUrl: z.string().url().max(2048),
  originalImageUrl: z.string().url().max(2048).optional(),
  promptUsed: z.string().max(500).optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 emails per hour per IP
const RATE_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

interface EmailRequest {
  email: string;
  name?: string;
  message?: string;
  imageUrl: string;
  originalImageUrl?: string;
  promptUsed?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      console.warn(`Email rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many email requests. Please try again later.',
          retryAfter: '1 hour'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate input
    const rawInput = await req.json();
    const validationResult = emailRequestSchema.safeParse(rawInput);
    
    if (!validationResult.success) {
      console.error('Email validation error:', validationResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email request data',
          details: validationResult.error.issues.map((i: any) => i.message)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { email, name, imageUrl }: EmailRequest = validationResult.data;
    
    console.log(`Processing email request for: ${email.substring(0, 3)}***@${email.split('@')[1]}`);

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
      from: "AI Island <ai-island@notifications.scienceparkgotland.se>",
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

    console.log("Email sent successfully:", emailResponse.id);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Email sending error:", error);
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
