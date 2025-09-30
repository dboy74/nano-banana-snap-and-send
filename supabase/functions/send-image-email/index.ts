import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendImageEmailRequest {
  to: string;
  name: string;
  message: string;
  imageUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, message, imageUrl }: SendImageEmailRequest = await req.json();

    console.log(`Sending email to: ${to}`);

    // Convert base64 image to attachment
    let attachment = null;
    if (imageUrl.startsWith('data:image/')) {
      const [header, base64Data] = imageUrl.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const extension = mimeType.split('/')[1] || 'jpg';
      
      attachment = {
        filename: `transformed-photo.${extension}`,
        content: base64Data,
        path: undefined
      };
    }

    const emailResponse = await resend.emails.send({
      from: "Snap & Transform <onboarding@resend.dev>",
      to: [to],
      subject: `🎉 ${name} sent you an amazing photo transformation!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin-bottom: 10px;">✨ Photo Transformation Magic! ✨</h1>
            <p style="color: #6b7280; font-size: 18px;">From ${name}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
            <p style="color: white; font-size: 18px; margin: 0; line-height: 1.6;">
              "${message}"
            </p>
          </div>

          ${imageUrl ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${imageUrl}" alt="Transformed photo" style="max-width: 100%; height: auto; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" />
            </div>
          ` : ''}

          <div style="background: #f9fafb; padding: 20px; border-radius: 15px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This photo was created using <strong>Snap & Transform</strong> - an AI-powered photo editing app that turns ordinary photos into extraordinary art!
            </p>
          </div>
        </div>
      `,
      attachments: attachment ? [attachment] : undefined,
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
    console.error("Error in send-image-email function:", error);
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