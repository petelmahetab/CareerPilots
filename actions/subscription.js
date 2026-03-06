"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Shared email wrapper ──────────────────────────────────────
function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>AI Career Coach</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">

      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

        <!-- Header bar -->
        <tr>
          <td style="background:#18181b;padding:20px 32px;">
            <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.2px;">AI Career Coach</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
              AI Career Coach &mdash; If you did not request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>

      <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">AI Career Coach &nbsp;&middot;&nbsp; Powered by Groq AI</p>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Submit Pro Request ────────────────────────────────────────
export async function submitProRequest({ name, email, reason }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Please sign in first." };

    if (!name?.trim() || !email?.trim() || !reason?.trim()) {
      return { success: false, error: "Please fill in all fields." };
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found. Please try again." };

    if (user.plan === "pro") {
      return { success: false, error: "You already have Pro access!" };
    }

    const existing = await db.proRequest.findFirst({
      where: { userId: user.id, status: "pending" },
    });

    if (existing) {
      return {
        success: false,
        error: "You already submitted a request. We will review it shortly!",
      };
    }

    const proRequest = await db.proRequest.create({
      data: {
        userId: user.id,
        name: name.trim(),
        email: email.trim(),
        reason: reason.trim(),
        status: "pending",
      },
    });

    // ── Secure one-click approval token ──────────────────────
    const token = Buffer.from(
      `${user.id}-${process.env.APPROVAL_SECRET}`
    ).toString("base64");

    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/approve-pro?userId=${user.id}&requestId=${proRequest.id}&token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

    // ── Admin notification email ──────────────────────────────
    await resend.emails.send({
      from: "AI Career Coach <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: `Pro access request from ${name}`,
      html: emailWrapper(`
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">New Request</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">Pro access requested</h1>

        <!-- Request details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f4f4f5;">
            <td style="padding:12px 16px;width:110px;background:#fafafa;">
              <span style="font-size:13px;color:#71717a;font-weight:500;">Name</span>
            </td>
            <td style="padding:12px 16px;background:#fafafa;border-left:1px solid #f4f4f5;">
              <span style="font-size:13px;color:#18181b;font-weight:600;">${name}</span>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #f4f4f5;">
            <td style="padding:12px 16px;background:#fafafa;">
              <span style="font-size:13px;color:#71717a;font-weight:500;">Email</span>
            </td>
            <td style="padding:12px 16px;background:#fafafa;border-left:1px solid #f4f4f5;">
              <span style="font-size:13px;color:#18181b;">${email}</span>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #f4f4f5;">
            <td style="padding:12px 16px;background:#fafafa;vertical-align:top;">
              <span style="font-size:13px;color:#71717a;font-weight:500;">Reason</span>
            </td>
            <td style="padding:12px 16px;background:#fafafa;border-left:1px solid #f4f4f5;">
              <span style="font-size:13px;color:#18181b;">${reason}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;background:#fafafa;">
              <span style="font-size:13px;color:#71717a;font-weight:500;">Request ID</span>
            </td>
            <td style="padding:12px 16px;background:#fafafa;border-left:1px solid #f4f4f5;">
              <span style="font-size:11px;color:#a1a1aa;font-family:monospace;">${proRequest.id}</span>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 16px;font-size:14px;color:#52525b;line-height:1.6;">
          Click below to instantly approve this user and send them access.
        </p>

        <a href="${approvalUrl}"
          style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:-0.1px;">
          Approve and give Pro access
        </a>

        <p style="margin:14px 0 0;font-size:12px;color:#a1a1aa;">
          This link is secure. Clicking it upgrades the user immediately.
        </p>
      `),
    });

    // ── User confirmation email ───────────────────────────────
    await resend.emails.send({
      from: "AI Career Coach <onboarding@resend.dev>",
      to: email,
      subject: "We received your Pro access request",
      html: emailWrapper(`
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Request Received</p>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">Thanks, ${name}</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
          We have received your request for Pro access. Our team reviews every request personally and will get back to you within <strong style="color:#18181b;">24 hours</strong>.
        </p>

        <!-- What's included -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:20px;margin-bottom:24px;">
          <tr><td>
            <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#18181b;">Once approved, you will get access to:</p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:5px 0;font-size:13px;color:#52525b;">
                <span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>AI Career Score Card
              </td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#52525b;">
                <span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>30-Day Personalized Action Plan
              </td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#52525b;">
                <span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>Skill Gap Analysis
              </td></tr>
              <tr><td style="padding:5px 0;font-size:13px;color:#52525b;">
                <span style="color:#18181b;font-weight:700;margin-right:10px;">&#8594;</span>Priority AI responses
              </td></tr>
            </table>
          </td></tr>
        </table>

        <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
          You will receive another email as soon as your request is reviewed. No action is needed from your side.
        </p>
      `),
    });

    return {
      success: true,
      message: "Request submitted. Check your email — we will approve within 24 hours.",
    };

  } catch (error) {
    console.error("Pro request error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Get current user plan ─────────────────────────────────────
export async function getUserPlan() {
  try {
    const { userId } = await auth();
    if (!userId) return "free";
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { plan: true },
    });
    return user?.plan || "free";
  } catch {
    return "free";
  }
}