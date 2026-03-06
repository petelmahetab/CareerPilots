import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { searchParams } = new URL(req.url);
    const userId    = searchParams.get("userId");
    const requestId = searchParams.get("requestId");
    const token     = searchParams.get("token");
    const userEmail = searchParams.get("email");
    const userName  = searchParams.get("name");

    // ── Verify secret token ──────────────────────────────────
    const expectedToken = Buffer.from(
      `${userId}-${process.env.APPROVAL_SECRET}`
    ).toString("base64");

    if (token !== expectedToken) {
      return new NextResponse(
        buildHTML("Invalid Link", "This approval link is invalid or has already been used.", "error", appUrl),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // ── Find user ────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true, name: true },
    });

    if (!user) {
      return new NextResponse(
        buildHTML("User Not Found", "This user no longer exists in the system.", "error", appUrl),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // ── Already Pro? ─────────────────────────────────────────
    if (user.plan === "pro") {
      return new NextResponse(
        buildHTML("Already Approved", `${user.name || userName} already has Pro access.`, "already", appUrl),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // ── Upgrade user to Pro ──────────────────────────────────
    await db.user.update({
      where: { id: userId },
      data: { plan: "pro" },
    });

    // ── Update ProRequest status ─────────────────────────────
    if (requestId) {
      await db.proRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      }).catch(() => {});
    }

    // ── Send approval email to user ──────────────────────────
    const email = user.email || userEmail;
    const name  = user.name  || userName || "there";

    await resend.emails.send({
      from: "AI Career Coach <onboarding@resend.dev>",
      to: email,
      subject: "Your Pro access has been approved",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Pro Access Approved</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr>
          <td style="background:#18181b;padding:20px 32px;">
            <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.2px;">AI Career Coach</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Access Granted</p>
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">Your Pro access is approved</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
              Hi ${name}, your request has been reviewed and <strong style="color:#18181b;">approved</strong>. You now have full access to all Pro features on AI Career Coach.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:20px;margin-bottom:24px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#18181b;">What you now have access to:</p>
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:5px 0;font-size:13px;color:#52525b;"><span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>AI Career Score Card</td></tr>
                  <tr><td style="padding:5px 0;font-size:13px;color:#52525b;"><span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>30-Day Personalized Action Plan</td></tr>
                  <tr><td style="padding:5px 0;font-size:13px;color:#52525b;"><span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>Skill Gap Analysis</td></tr>
                  <tr><td style="padding:5px 0;font-size:13px;color:#52525b;"><span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>Priority AI responses</td></tr>
                </table>
              </td></tr>
            </table>
            <a href="${appUrl}/career-score" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:-0.1px;">
              Get my Career Score
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">AI Career Coach &mdash; If you did not request this, you can safely ignore this email.</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">AI Career Coach &nbsp;&middot;&nbsp; Powered by Groq AI</p>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return new NextResponse(
      buildHTML("Approved Successfully", `${name} (${email}) has been upgraded to Pro and notified by email.`, "success", appUrl),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  } catch (error) {
    console.error("Approval error:", error);
    return new NextResponse(
      buildHTML("Something went wrong", error.message, "error", appUrl),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// ── SVG Icons ────────────────────────────────────────────────
const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  already: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

const META = {
  success: {
    label: "Pro Approved",
    labelColor: "#4ade80",
    labelBg: "rgba(74,222,128,0.1)",
    labelBorder: "rgba(74,222,128,0.25)",
    iconBg: "rgba(74,222,128,0.1)",
    iconBorder: "rgba(74,222,128,0.2)",
    cardBorder: "rgba(74,222,128,0.2)",
    cardGlow: "0 0 40px rgba(74,222,128,0.08)",
  },
  already: {
    label: "Already Active",
    labelColor: "#818cf8",
    labelBg: "rgba(99,102,241,0.12)",
    labelBorder: "rgba(99,102,241,0.25)",
    iconBg: "rgba(99,102,241,0.12)",
    iconBorder: "rgba(99,102,241,0.2)",
    cardBorder: "rgba(99,102,241,0.25)",
    cardGlow: "0 0 40px rgba(99,102,241,0.08)",
  },
  error: {
    label: "Error",
    labelColor: "#f87171",
    labelBg: "rgba(248,113,113,0.1)",
    labelBorder: "rgba(248,113,113,0.25)",
    iconBg: "rgba(248,113,113,0.1)",
    iconBorder: "rgba(248,113,113,0.2)",
    cardBorder: "rgba(248,113,113,0.2)",
    cardGlow: "0 0 40px rgba(248,113,113,0.06)",
  },
};

function buildHTML(title, message, type = "success", appUrl = "") {
  const m       = META[type];
  const icon    = ICONS[type];
  const showBtn = type === "success" || type === "already";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>${title} — AI Career Coach</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #09090b;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      /* Subtle grid background like the dashboard */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
        background-size: 40px 40px;
        pointer-events: none;
        z-index: 0;
      }

      .wrap {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Brand bar */
      .brand-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
      }
      .brand-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
      }
      .brand-text {
        font-size: 14px;
        font-weight: 700;
        color: #71717a;
        letter-spacing: -0.2px;
      }

      /* Card */
      .card {
        background: #111113;
        border: 1px solid ${m.cardBorder};
        border-radius: 20px;
        padding: 48px 44px;
        max-width: 460px;
        width: 100%;
        text-align: center;
        box-shadow: ${m.cardGlow}, 0 1px 0 rgba(255,255,255,0.04) inset;
      }

      .icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 68px; height: 68px;
        border-radius: 18px;
        background: ${m.iconBg};
        border: 1px solid ${m.iconBorder};
        margin-bottom: 20px;
      }

      .label {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: ${m.labelBg};
        border: 1px solid ${m.labelBorder};
        color: ${m.labelColor};
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        margin-bottom: 16px;
      }

      .title {
        color: #fafafa;
        font-size: 23px;
        font-weight: 700;
        margin-bottom: 10px;
        letter-spacing: -0.4px;
        line-height: 1.3;
      }

      .message {
        color: #71717a;
        font-size: 14px;
        line-height: 1.75;
        margin-bottom: 28px;
        max-width: 320px;
        margin-left: auto;
        margin-right: auto;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #ffffff;
        padding: 12px 26px;
        border-radius: 10px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.1px;
        margin-bottom: 28px;
        box-shadow: 0 4px 14px rgba(99,102,241,0.35);
      }

      .divider {
        height: 1px;
        background: rgba(255,255,255,0.06);
        margin: 0 0 18px;
      }

      .footer {
        color: #3f3f46;
        font-size: 12px;
        letter-spacing: 0.1px;
      }

      .sub-brand {
        font-size: 12px;
        color: #3f3f46;
        margin-top: 20px;
        letter-spacing: 0.1px;
      }
    </style>
  </head>
  <body>
    <div class="wrap">

      <!-- Brand -->
      <div class="brand-bar">
        <div class="brand-dot"></div>
        <span class="brand-text">AI Career Coach</span>
      </div>

      <!-- Card -->
      <div class="card">
        <div class="icon-wrap">${icon}</div>
        <div class="label">${m.label}</div>
        <div class="title">${title}</div>
        <p class="message">${message}</p>

        ${showBtn ? `
        <a href="${appUrl}/dashboard" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Go to Dashboard
        </a>
        ` : ""}

        <div class="divider"></div>
        <div class="footer">Admin Panel &mdash; AI Career Coach</div>
      </div>

      <p class="sub-brand">AI Career Coach &nbsp;&middot;&nbsp; Powered by Groq AI</p>
    </div>
  </body>
</html>`;
}