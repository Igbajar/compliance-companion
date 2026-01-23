import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SmtpSettings {
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch SMTP settings from database
    const { data: smtpSettings, error: smtpError } = await supabase
      .from("smtp_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (smtpError) {
      console.error("Error fetching SMTP settings:", smtpError);
      throw new Error("Failed to fetch SMTP settings");
    }

    if (!smtpSettings) {
      return new Response(
        JSON.stringify({ error: "SMTP settings not configured. Please save your SMTP settings first." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const settings = smtpSettings as SmtpSettings;

    // Test SMTP connection
    const client = new SMTPClient({
      connection: {
        hostname: settings.host,
        port: settings.port,
        tls: settings.use_tls,
        auth: settings.username && settings.password ? {
          username: settings.username,
          password: settings.password,
        } : undefined,
      },
    });

    // Try to connect - this will throw if connection fails
    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "SMTP connection successful" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("SMTP connection test failed:", error);
    return new Response(
      JSON.stringify({ error: `SMTP connection failed: ${errorMessage}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
