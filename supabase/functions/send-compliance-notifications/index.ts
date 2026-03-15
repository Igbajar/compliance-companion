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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for notification type
    let notificationType = "weekly_digest";
    try {
      const body = await req.json();
      notificationType = body.type || "weekly_digest";
    } catch {
      // default to weekly digest
    }

    // Fetch SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabase
      .from("smtp_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (smtpError || !smtpSettings) {
      return new Response(
        JSON.stringify({ error: "SMTP settings not configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const settings = smtpSettings as SmtpSettings;

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: settings.host,
        port: settings.port,
        tls: settings.use_tls,
        auth: settings.username && settings.password
          ? { username: settings.username, password: settings.password }
          : undefined,
      },
    });

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Helper to log email
    async function logEmail(
      recipientEmail: string,
      subject: string,
      emailType: string,
      status: "sent" | "failed",
      errorMessage?: string,
      metadata?: Record<string, unknown>
    ) {
      try {
        await supabase.from("email_notifications").insert({
          recipient_email: recipientEmail,
          subject,
          email_type: emailType,
          status,
          error_message: errorMessage || null,
          metadata: metadata || null,
          sent_at: status === "sent" ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error("Failed to log email:", err);
      }
    }

    // Fetch compliance data
    const [clausesRes, evidenceRes, linksRes, ncsRes, risksRes, capasRes] = await Promise.all([
      supabase.from("iso_clauses").select("id, clause_number, title"),
      supabase.from("clause_evidence").select("clause_id"),
      supabase.from("clause_document_links").select("clause_id"),
      supabase.from("nonconformities").select("id, status, title").in("status", ["open", "investigating", "corrective_action", "verification"]),
      supabase.from("risks").select("id, status, impact, likelihood").in("status", ["open", "mitigating"]),
      supabase.from("capa_actions").select("id, status").in("status", ["open", "in_progress", "verification"]),
    ]);

    const clauses = clausesRes.data || [];
    const evidenceClauseIds = new Set((evidenceRes.data || []).map((e: any) => e.clause_id));
    const linkClauseIds = new Set((linksRes.data || []).map((l: any) => l.clause_id));

    const totalClauses = clauses.length;
    const compliantClauses = clauses.filter((c: any) => evidenceClauseIds.has(c.id) || linkClauseIds.has(c.id)).length;
    const gapClauses = clauses.filter((c: any) => !evidenceClauseIds.has(c.id) && !linkClauseIds.has(c.id));
    const compliancePct = totalClauses > 0 ? Math.round((compliantClauses / totalClauses) * 100) : 0;

    // Also create a compliance snapshot
    await supabase.from("compliance_snapshots").insert({
      total_clauses: totalClauses,
      compliant_clauses: compliantClauses,
      non_compliant_clauses: gapClauses.length,
      compliance_percentage: compliancePct,
      open_ncs: (ncsRes.data || []).length,
      open_risks: (risksRes.data || []).length,
      open_capas: (capasRes.data || []).length,
    }).then(() => {}).catch(() => {});

    // Get admin/manager emails for notifications
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "manager"]);

    const adminUserIds = (adminRoles || []).map((r: any) => r.user_id);
    
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", adminUserIds);

    const recipients = (profiles || []).filter((p: any) => p.email);

    if (recipients.length === 0) {
      await client.close();
      return new Response(
        JSON.stringify({ success: true, message: "No recipients found", emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build email content based on type
    if (notificationType === "weekly_digest" || notificationType === "gaps_detected") {
      const subject = notificationType === "weekly_digest"
        ? `📊 Weekly Compliance Digest - ${compliancePct}% Compliant`
        : `⚠️ Compliance Gaps Detected - ${gapClauses.length} clauses need attention`;

      const gapListHtml = gapClauses.slice(0, 10).map((c: any) =>
        `<li>${c.clause_number} - ${c.title}</li>`
      ).join("");

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">${notificationType === "weekly_digest" ? "Weekly Compliance Digest" : "Compliance Gap Alert"}</h2>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
            <p style="font-size: 48px; font-weight: bold; color: ${compliancePct >= 80 ? '#16a34a' : compliancePct >= 50 ? '#ca8a04' : '#dc2626'}; margin: 0;">${compliancePct}%</p>
            <p style="color: #64748b; margin: 4px 0 0;">Overall Compliance</p>
          </div>

          <div style="display: flex; gap: 12px; margin: 16px 0;">
            <div style="flex: 1; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${compliantClauses}</p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">Compliant</p>
            </div>
            <div style="flex: 1; background: #fef2f2; padding: 12px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">${gapClauses.length}</p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">Gaps</p>
            </div>
            <div style="flex: 1; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${(ncsRes.data || []).length}</p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">Open NCs</p>
            </div>
          </div>

          ${gapClauses.length > 0 ? `
            <h3 style="color: #dc2626;">Clauses Requiring Attention</h3>
            <ul style="color: #334155;">${gapListHtml}</ul>
            ${gapClauses.length > 10 ? `<p style="color: #64748b; font-size: 12px;">...and ${gapClauses.length - 10} more</p>` : ""}
          ` : ""}

          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            This is an automated notification from your ISO Compliance Management System.
          </p>
        </div>
      `;

      for (const recipient of recipients) {
        try {
          await client.send({
            from: `${settings.from_name} <${settings.from_email}>`,
            to: recipient.email,
            subject,
            html,
          });
          emailsSent.push(recipient.email);
          await logEmail(recipient.email, subject, notificationType, "sent", undefined, { compliance_pct: compliancePct, gaps: gapClauses.length });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Failed to send to ${recipient.email}: ${msg}`);
          await logEmail(recipient.email, subject, notificationType, "failed", msg);
        }
      }
    }

    if (notificationType === "evidence_added") {
      // Get recent evidence additions (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: recentEvidence } = await supabase
        .from("clause_audit_trail")
        .select("*, clause:iso_clauses(clause_number, title)")
        .eq("action_type", "evidence_added")
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false });

      if (recentEvidence && recentEvidence.length > 0) {
        const evidenceListHtml = recentEvidence.slice(0, 10).map((e: any) =>
          `<li>${(e.clause as any)?.clause_number || ""} - ${(e.details as any)?.file_name || "File"} (by ${e.user_email || "Unknown"})</li>`
        ).join("");

        const subject = `📎 ${recentEvidence.length} new evidence file(s) added`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Evidence Added</h2>
            <p>${recentEvidence.length} evidence file(s) were added in the last 24 hours:</p>
            <ul style="color: #334155;">${evidenceListHtml}</ul>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
              This is an automated notification from your ISO Compliance Management System.
            </p>
          </div>
        `;

        for (const recipient of recipients) {
          try {
            await client.send({
              from: `${settings.from_name} <${settings.from_email}>`,
              to: recipient.email,
              subject,
              html,
            });
            emailsSent.push(recipient.email);
            await logEmail(recipient.email, subject, "evidence_added", "sent", undefined, { evidence_count: recentEvidence.length });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Failed to send to ${recipient.email}: ${msg}`);
            await logEmail(recipient.email, subject, "evidence_added", "failed", msg);
          }
        }
      }
    }

    if (notificationType === "gap_resolved") {
      // Check previous snapshot vs current for resolved gaps
      const { data: prevSnapshot } = await supabase
        .from("compliance_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(2);

      if (prevSnapshot && prevSnapshot.length >= 2) {
        const current = prevSnapshot[0] as any;
        const previous = prevSnapshot[1] as any;
        const resolvedCount = previous.non_compliant_clauses - current.non_compliant_clauses;

        if (resolvedCount > 0) {
          const subject = `✅ ${resolvedCount} compliance gap(s) resolved`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Compliance Gaps Resolved</h2>
              <p>${resolvedCount} clause(s) are now compliant with supporting evidence.</p>
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Previous:</strong> ${previous.compliance_percentage}% compliant</p>
                <p style="margin: 8px 0 0;"><strong>Current:</strong> ${current.compliance_percentage}% compliant</p>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
                This is an automated notification from your ISO Compliance Management System.
              </p>
            </div>
          `;

          for (const recipient of recipients) {
            try {
              await client.send({
                from: `${settings.from_name} <${settings.from_email}>`,
                to: recipient.email,
                subject,
                html,
              });
              emailsSent.push(recipient.email);
              await logEmail(recipient.email, subject, "gap_resolved", "sent", undefined, { resolved_count: resolvedCount });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              errors.push(`Failed to send to ${recipient.email}: ${msg}`);
              await logEmail(recipient.email, subject, "gap_resolved", "failed", msg);
            }
          }
        }
      }
    }

    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        notificationType,
        compliancePct,
        gaps: gapClauses.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-compliance-notifications:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
