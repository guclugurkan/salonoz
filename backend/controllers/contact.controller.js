const { sendEmail } = require("../mailer");

// POST /api/contact
async function postContact(req, res) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Naam, e-mail en bericht zijn verplicht.",
      });
    }

    const emailSent = await sendEmail({
      to: "guclugrkn@gmail.com",
      subject: `Nieuw contactbericht van ${name} — Salon OZ`,
      text: `
Naam: ${name}
E-mail: ${email}

Bericht:
${message}
      `,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e5e5e5;">
          <h2 style="font-family: Georgia, serif; font-weight: 300; font-size: 24px; color: #111; margin: 0 0 24px; letter-spacing: 0.04em;">
            Nieuw contactbericht — Salon OZ
          </h2>
          <div style="border-top: 1px solid #e5e5e5; padding-top: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
              <tr>
                <td style="padding: 10px 0; color: #9a9a9a; width: 100px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">Naam</td>
                <td style="padding: 10px 0; color: #111;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9a9a9a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em;">E-mail</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #111;">${email}</a></td>
              </tr>
            </table>
          </div>
          <div style="margin-top: 24px; padding: 24px; background: #fafafa; border-left: 2px solid #111;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9a9a9a; margin: 0 0 12px;">Bericht</p>
            <p style="font-size: 15px; color: #333; line-height: 1.8; margin: 0;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="margin-top: 32px; font-size: 11px; color: #ccc; text-align: center; letter-spacing: 0.1em;">
            SALON OZ — Vierhekkenstraat 3A, Drongen BE-9031
          </p>
        </div>
      `,
    });

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: "Bericht succesvol verzonden.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Verzenden mislukt. Probeer het later opnieuw.",
      });
    }
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({
      success: false,
      error: "Serverfout. Probeer het later opnieuw.",
    });
  }
}

module.exports = { postContact };