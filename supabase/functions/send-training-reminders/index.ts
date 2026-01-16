import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrainingRecord {
  id: string;
  due_date: string;
  status: string;
  course: {
    title: string;
  };
  employee: {
    full_name: string;
    email: string;
  } | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Fetch training records that are:
    // 1. Overdue (due_date < today and status != completed)
    // 2. Expiring soon (due_date <= 7 days from now and status != completed)
    const { data: overdueRecords, error: overdueError } = await supabase
      .from("training_records")
      .select(`
        id,
        due_date,
        status,
        course:training_courses(title),
        employee:employees(full_name, email)
      `)
      .lt("due_date", today.toISOString().split("T")[0])
      .neq("status", "completed");

    if (overdueError) {
      console.error("Error fetching overdue records:", overdueError);
      throw overdueError;
    }

    const { data: expiringRecords, error: expiringError } = await supabase
      .from("training_records")
      .select(`
        id,
        due_date,
        status,
        course:training_courses(title),
        employee:employees(full_name, email)
      `)
      .gte("due_date", today.toISOString().split("T")[0])
      .lte("due_date", sevenDaysFromNow.toISOString().split("T")[0])
      .neq("status", "completed");

    if (expiringError) {
      console.error("Error fetching expiring records:", expiringError);
      throw expiringError;
    }

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Send overdue notifications
    for (const record of (overdueRecords as unknown as TrainingRecord[]) || []) {
      if (!record.employee?.email) continue;

      try {
        await resend.emails.send({
          from: "Training Alerts <onboarding@resend.dev>",
          to: [record.employee.email],
          subject: `⚠️ Overdue Training: ${record.course?.title || "Training Course"}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Overdue Training Alert</h2>
              <p>Hello ${record.employee.full_name},</p>
              <p>This is a reminder that your training is <strong>overdue</strong>:</p>
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Course:</strong> ${record.course?.title || "Training Course"}</p>
                <p style="margin: 8px 0 0 0;"><strong>Due Date:</strong> ${new Date(record.due_date).toLocaleDateString()}</p>
              </div>
              <p>Please complete this training as soon as possible to maintain compliance.</p>
              <p>Best regards,<br>Training Management System</p>
            </div>
          `,
        });
        emailsSent.push(record.employee.email);
      } catch (err: any) {
        errors.push(`Failed to send to ${record.employee.email}: ${err.message}`);
      }
    }

    // Send expiring soon notifications
    for (const record of (expiringRecords as unknown as TrainingRecord[]) || []) {
      if (!record.employee?.email) continue;

      const daysUntilDue = Math.ceil(
        (new Date(record.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      try {
        await resend.emails.send({
          from: "Training Alerts <onboarding@resend.dev>",
          to: [record.employee.email],
          subject: `📅 Training Due Soon: ${record.course?.title || "Training Course"}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Training Due Soon</h2>
              <p>Hello ${record.employee.full_name},</p>
              <p>This is a friendly reminder that your training is due in <strong>${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}</strong>:</p>
              <div style="background: #fefce8; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Course:</strong> ${record.course?.title || "Training Course"}</p>
                <p style="margin: 8px 0 0 0;"><strong>Due Date:</strong> ${new Date(record.due_date).toLocaleDateString()}</p>
              </div>
              <p>Please complete this training before the due date to avoid it becoming overdue.</p>
              <p>Best regards,<br>Training Management System</p>
            </div>
          `,
        });
        emailsSent.push(record.employee.email);
      } catch (err: any) {
        errors.push(`Failed to send to ${record.employee.email}: ${err.message}`);
      }
    }

    // Update overdue records status
    if (overdueRecords && overdueRecords.length > 0) {
      const overdueIds = overdueRecords.map((r: any) => r.id);
      await supabase
        .from("training_records")
        .update({ status: "overdue" })
        .in("id", overdueIds)
        .neq("status", "overdue");
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        overdueCount: overdueRecords?.length || 0,
        expiringCount: expiringRecords?.length || 0,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-training-reminders function:", error);
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
