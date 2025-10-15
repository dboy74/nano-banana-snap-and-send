import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// @ts-ignore
const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const emailRequestSchema = z.object({
  sessionId: z.string().uuid({ message: "Invalid session ID" }),
  email: z.string().email().max(255),
  name: z.string().max(100).optional(),
  message: z.string().max(1000).optional(),
  prompt: z.string().max(500).optional(),
  // Accept either data URLs (base64) or regular URLs for images
  imageUrl: z.string().refine(
    (val) => val.startsWith('data:image/') || val.startsWith('http'),
    { message: "Invalid image format - must be base64 data URL or http URL" }
  ),
  originalImageUrl: z.string().refine(
    (val) => val.startsWith('data:image/') || val.startsWith('http'),
    { message: "Invalid image format - must be base64 data URL or http URL" }
  ).optional(),
});

// Session-based rate limiting - DISABLED FOR EVENT
// const sessionRateLimitMap = new Map<string, { count: number; resetTime: number }>();
// const RATE_LIMIT_PER_SESSION = 5; // Max 5 emails per session per hour
// const RATE_WINDOW = 60 * 60 * 1000;

function checkSessionRateLimit(sessionId: string): boolean {
  // Rate limiting disabled for event - always return true
  return true;
  
  /* Original rate limiting code - re-enable after event if needed
  const now = Date.now();
  const record = sessionRateLimitMap.get(sessionId);
  
  if (!record || now > record.resetTime) {
    sessionRateLimitMap.set(sessionId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_PER_SESSION) {
    return false;
  }
  
  record.count++;
  return true;
  */
}

interface EmailRequest {
  sessionId: string;
  email: string;
  name?: string;
  message?: string;
  prompt?: string;
  imageUrl: string;
  originalImageUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input first to get sessionId
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
    
    const { sessionId, email, name, imageUrl, originalImageUrl, message, prompt }: EmailRequest = validationResult.data;
    console.log(`Processing email for session: ${sessionId}, recipient: ${email.substring(0, 3)}***@${email.split('@')[1]}`);

    // Session-based rate limiting
    if (!checkSessionRateLimit(sessionId)) {
      console.warn(`Email rate limit exceeded for session: ${sessionId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many email requests for this session. Please try again later.',
          retryAfter: '1 hour'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert base64 data URL to base64 string
    // imageUrl format: "data:image/png;base64,iVBORw0KGgo..."
    let base64Image = imageUrl;
    if (imageUrl.startsWith('data:')) {
      base64Image = imageUrl.split(',')[1]; // Extract base64 part after comma
    }
    
    console.log('Preparing email with base64 image data (not fetching from storage)');


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
          
          ${prompt ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f0f4ff; border-left: 4px solid #667eea; border-radius: 5px;">
            <p style="color: #333; font-weight: bold; margin: 0 0 5px 0; font-size: 14px;">Din transformation:</p>
            <p style="color: #555; font-style: italic; margin: 0;">"${prompt}"</p>
          </div>
          ` : ''}
          
          ${message ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #764ba2; border-radius: 5px;">
            <p style="color: #555; font-style: italic; margin: 0;">${message}</p>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Här är din coola AI-transformation som bifogad fil.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
            <h3 style="color: #333; margin-top: 0;">Vill du veta mer om hur AI kan hjälpa ditt företag?</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #666;">
              Kontakta Ingmar, vår AI Lead på Science Park Gotland:<br>
              <a href="mailto:ingmar.bertram@scienceparkgotland.se" style="color: #0066cc;">ingmar.bertram@scienceparkgotland.se</a>
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Vi ser fram emot att höra från dig!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666; margin-top: 30px;">
            Hälsningar,<br>
            <strong>AI.Island-teamet</strong><br>
            Science Park Gotland
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            <strong>Science Park Gotland</strong><br>
            Innovation och entreprenörskap för en hållbar framtid
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

    console.log("Email sent successfully:", emailResponse);

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
