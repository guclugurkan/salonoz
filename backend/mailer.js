require("dotenv").config();
const nodemailer = require("nodemailer");

// ============================================
// URL DE BASE — changer quand tu as un domaine
// ============================================
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================
// EMAIL TRANSPORTER
// ============================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// SEND EMAIL
// ============================================

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"SALON OZ" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

// ============================================
// HELPERS
// ============================================

function formatAppointmentDate(dateString) {
  return new Date(dateString).toLocaleDateString("nl-BE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildEmailHTML({
  title,
  intro,
  appointment,
  extraMessage = "",
  statusLabel,
  statusColor = "#b08d57",
  cancelUrl = null,
}) {
  return `
    <div style="margin:0; padding:0; background-color:#f7f3ee; font-family:Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f7f3ee; padding:30px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.08);">
              
              <tr>
                <td style="background:#1f1a17; padding:28px 32px; text-align:center;">
                  <div style="color:#d6b98c; font-size:12px; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px;">
                    Salon OZ — Drongen
                  </div>
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:600;">
                    ${title}
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 18px; color:#2f2a26; font-size:16px; line-height:1.6;">
                    ${intro}
                  </p>

                  <div style="display:inline-block; background:${statusColor}; color:#ffffff; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:8px 14px; border-radius:999px; margin-bottom:22px;">
                    ${statusLabel}
                  </div>

                  <div style="border:1px solid #eadfce; border-radius:12px; overflow:hidden; margin-bottom:22px;">
                    <div style="background:#fbf7f2; padding:14px 18px; font-size:16px; font-weight:700; color:#2f2a26; border-bottom:1px solid #eadfce;">
                      Afspraakgegevens
                    </div>
                    <div style="padding:18px;">
                      <p style="margin:0 0 10px; color:#4a433d; font-size:15px;"><strong>Service:</strong> ${appointment.service}</p>
                      <p style="margin:0 0 10px; color:#4a433d; font-size:15px;"><strong>Stylist:</strong> ${appointment.staff}</p>
                      <p style="margin:0 0 10px; color:#4a433d; font-size:15px;"><strong>Datum:</strong> ${formatAppointmentDate(appointment.date)}</p>
                      <p style="margin:0; color:#4a433d; font-size:15px;"><strong>Tijdstip:</strong> ${appointment.time || "N/A"}</p>
                    </div>
                  </div>

                  ${extraMessage ? `
                    <div style="background:#f8f1e8; border-left:4px solid ${statusColor}; padding:16px 18px; border-radius:8px; margin-bottom:22px;">
                      <p style="margin:0; color:#3b342f; font-size:15px; line-height:1.6;">
                        ${extraMessage}
                      </p>
                    </div>
                  ` : ""}

                  ${cancelUrl ? `
                    <div style="background:#fafafa; border:1px solid #e5e5e5; padding:16px 18px; border-radius:8px; margin-bottom:22px;">
                      <p style="margin:0 0 10px; color:#3b342f; font-size:14px; line-height:1.6;">
                        <strong>Afspraak annuleren?</strong><br>
                        Annulatie is mogelijk tot 24u voor de afspraak via onderstaande link:
                      </p>
                      <a href="${cancelUrl}" style="display:inline-block; background:#1f1a17; color:#ffffff; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; padding:10px 20px; border-radius:6px; text-decoration:none;">
                        Afspraak Annuleren
                      </a>
                      <p style="margin:10px 0 0; color:#9a9a9a; font-size:12px;">
                        Na 24u voor de afspraak is annulatie niet meer mogelijk via deze link.<br>
                        Telefonisch: <a href="tel:+320485550271" style="color:#9a9a9a;">0485 55 02 71</a>
                      </p>
                    </div>
                  ` : ""}

                  <p style="margin:0; color:#5c554f; font-size:15px; line-height:1.7;">
                    Bedankt om te kiezen voor <strong>SALON OZ</strong>.<br>
                    We kijken ernaar uit u te verwelkomen.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background:#f3ece3; padding:18px 32px; text-align:center;">
                  <p style="margin:0; color:#7a7068; font-size:13px;">
                    SALON OZ · Vierhekkenstraat 3A, Drongen BE-9031 · 0485 55 02 71
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

function getPendingAppointmentEmail(appointment) {
  const subject = "Uw afspraakverzoek is ontvangen — SALON OZ";

  // Lien d'annulation avec le token
  const cancelUrl = appointment.cancelToken
    ? `${BASE_URL}/cancel?token=${appointment.cancelToken}`
    : null;

  const text = `Hallo ${appointment.name},

Wij hebben uw afspraakverzoek bij SALON OZ ontvangen.

Afspraakgegevens:
- Service: ${appointment.service}
- Stylist: ${appointment.staff}
- Datum: ${formatAppointmentDate(appointment.date)}
- Tijdstip: ${appointment.time}

Uw verzoek is momenteel in behandeling.
Wij nemen contact met u op zodra het is bevestigd of bijgewerkt.

Wilt u annuleren? Dat kan tot 24u voor de afspraak via: ${cancelUrl || "neem telefonisch contact op"}

Tot binnenkort,
SALON OZ`;

  const html = buildEmailHTML({
    title: "Verzoek Ontvangen",
    intro: `Hallo <strong>${appointment.name}</strong>,<br><br>Wij hebben uw afspraakverzoek bij <strong>SALON OZ</strong> ontvangen.`,
    appointment,
    extraMessage: "Uw verzoek is momenteel in behandeling. Wij nemen contact met u op zodra het is bevestigd of bijgewerkt.",
    statusLabel: "In behandeling",
    statusColor: "#b08d57",
    cancelUrl,
  });

  return { subject, text, html };
}

function getConfirmedAppointmentEmail(appointment) {
  const subject = "Uw afspraak is bevestigd — SALON OZ";

  const cancelUrl = appointment.cancelToken
    ? `${BASE_URL}/cancel?token=${appointment.cancelToken}`
    : null;

  const text = `Hallo ${appointment.name},

Uw afspraak bij SALON OZ is bevestigd.

Afspraakgegevens:
- Service: ${appointment.service}
- Stylist: ${appointment.staff}
- Datum: ${formatAppointmentDate(appointment.date)}
- Tijdstip: ${appointment.time}

Wij kijken ernaar uit u te verwelkomen.

Wilt u annuleren? Dat kan tot 24u voor de afspraak via: ${cancelUrl || "neem telefonisch contact op"}

Tot binnenkort,
SALON OZ`;

  const html = buildEmailHTML({
    title: "Afspraak Bevestigd",
    intro: `Hallo <strong>${appointment.name}</strong>,<br><br>Uw afspraak bij <strong>SALON OZ</strong> is bevestigd.`,
    appointment,
    extraMessage: "Uw afspraak is bevestigd. We kijken ernaar uit u te verwelkomen in het salon.",
    statusLabel: "Bevestigd",
    statusColor: "#4f7c59",
    cancelUrl,
  });

  return { subject, text, html };
}

function getRejectedAppointmentEmail(appointment) {
  const subject = "Uw afspraakverzoek is geweigerd — SALON OZ";

  const text = `Hallo ${appointment.name},

Het spijt ons u te meedelen dat uw afspraakverzoek bij SALON OZ is geweigerd.

Afspraakgegevens:
- Service: ${appointment.service}
- Stylist: ${appointment.staff}
- Datum: ${formatAppointmentDate(appointment.date)}
- Tijdstip: ${appointment.time}

Reden:
${appointment.rejectionReason || "Geen reden opgegeven."}

U kunt een nieuw verzoek indienen voor een ander tijdslot.

Met vriendelijke groeten,
SALON OZ`;

  const html = buildEmailHTML({
    title: "Afspraak Geweigerd",
    intro: `Hallo <strong>${appointment.name}</strong>,<br><br>Het spijt ons u te meedelen dat uw afspraakverzoek bij <strong>SALON OZ</strong> is geweigerd.`,
    appointment,
    extraMessage: `<strong>Reden:</strong><br>${appointment.rejectionReason || "Geen reden opgegeven."}<br><br>U kunt een nieuw verzoek indienen voor een ander tijdslot.`,
    statusLabel: "Geweigerd",
    statusColor: "#a44d4d",
  });

  return { subject, text, html };
}

function getCancelledAppointmentEmail(appointment) {
  const subject = "Uw afspraak is geannuleerd — SALON OZ";

  const text = `Hallo ${appointment.name},

Uw afspraak bij SALON OZ is geannuleerd.

Afspraakgegevens:
- Service: ${appointment.service}
- Stylist: ${appointment.staff}
- Datum: ${formatAppointmentDate(appointment.date)}
- Tijdstip: ${appointment.time || "N/A"}

Indien gewenst kunt u een nieuwe afspraak boeken op een ander tijdstip.

Met vriendelijke groeten,
SALON OZ`;

  const html = buildEmailHTML({
    title: "Afspraak Geannuleerd",
    intro: `Hallo <strong>${appointment.name}</strong>,<br><br>Uw afspraak bij <strong>SALON OZ</strong> is geannuleerd.`,
    appointment,
    extraMessage: "Indien gewenst kunt u een nieuwe afspraak boeken op een ander tijdstip.",
    statusLabel: "Geannuleerd",
    statusColor: "#8a6a4a",
  });

  return { subject, text, html };
}

function getTestEmail() {
  const subject = "Test e-mail SALON OZ";
  const text = `Als u deze e-mail ontvangt, werkt het e-mailsysteem correct.`;

  const html = buildEmailHTML({
    title: "Test E-mail",
    intro: `Dit is een test e-mail van <strong>SALON OZ</strong>.`,
    appointment: {
      service: "Test Service",
      staff: "Test Stylist",
      date: new Date().toISOString(),
      time: "10:00",
    },
    extraMessage: "Als u deze e-mail correct opgemaakt ziet, werkt uw HTML e-mailsysteem.",
    statusLabel: "Test",
    statusColor: "#b08d57",
  });

  return { subject, text, html };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sendEmail,
  getPendingAppointmentEmail,
  getConfirmedAppointmentEmail,
  getRejectedAppointmentEmail,
  getCancelledAppointmentEmail,
  getTestEmail,
};