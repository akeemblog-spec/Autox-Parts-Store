import "server-only";
import nodemailer from "nodemailer";

function esc(value: string) {
  return value.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] ?? c));
}

export function autoxEmailHtml({ title, intro, buttonLabel, buttonUrl, note, storeName = "AutoX Parts Store", supportEmail = "", supportPhone = "", logoUrl = "" }: { title: string; intro: string; buttonLabel: string; buttonUrl: string; note: string; storeName?: string; supportEmail?: string; supportPhone?: string; logoUrl?: string; }) {
  const support = [supportEmail, supportPhone].filter(Boolean).map(esc).join(" · ");
  return `<!doctype html><html><body style="margin:0;background:#080808;font-family:Arial,Helvetica,sans-serif;color:#f4f4f4"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080808;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#111;border:1px solid #2a2a2a"><tr><td style="padding:24px 28px;background:#050505;border-bottom:3px solid #e11d2e">${logoUrl ? `<img src="${esc(logoUrl)}" alt="${esc(storeName)}" style="display:block;max-width:180px;max-height:54px;border:0" />` : `<div style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#fff">AUTO<span style="color:#e11d2e">X</span></div>`}<div style="margin-top:5px;font-size:11px;letter-spacing:2px;color:#9b9b9b;text-transform:uppercase">Genuine Parts. Trusted Quality.</div></td></tr><tr><td style="padding:36px 28px"><h1 style="margin:0 0 16px;font-size:25px;line-height:1.2;color:#fff">${esc(title)}</h1><p style="margin:0 0 24px;color:#c3c3c3;font-size:14px;line-height:1.75">${esc(intro)}</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:#e11d2e"><a href="${esc(buttonUrl)}" style="display:inline-block;padding:14px 24px;color:#fff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:.5px">${esc(buttonLabel)}</a></td></tr></table><p style="margin:24px 0 0;padding:16px;background:#181818;border-left:3px solid #e11d2e;color:#9f9f9f;font-size:12px;line-height:1.6">${esc(note)}</p><p style="margin:22px 0 0;color:#777;font-size:11px;line-height:1.6">If the button does not work, copy and paste this link into your browser:<br><span style="color:#aaa;word-break:break-all">${esc(buttonUrl)}</span></p></td></tr><tr><td style="padding:22px 28px;background:#090909;border-top:1px solid #292929;color:#777;font-size:11px;line-height:1.7"><strong style="color:#ddd">${esc(storeName)}</strong>${support ? `<br>${support}` : ""}<br>© ${new Date().getFullYear()} ${esc(storeName)}. All Rights Reserved.<br>Made with ♥ in Sri Lanka</td></tr></table></td></tr></table></body></html>`;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from =
    process.env.EMAIL_FROM ||
    (user ? `AutoX Parts Store <${user}>` : "");

  if (!user || !password) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[AutoX email preview] ${subject} -> ${to}`);
    }

    return {
      delivered: false,
      reason: "SMTP email credentials are not configured",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    return {
      delivered: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("[AutoX Email] SMTP delivery failed", error);
    throw new Error("Unable to send transactional email");
  }
}