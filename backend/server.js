require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const categoriesRoutes = require("./routes/categories.routes");
const appointmentsRoutes = require("./routes/appointments.routes");
const imagesRoutes = require("./routes/images.routes");
const contactRoutes = require("./routes/contact.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const authRoutes = require("./routes/auth.routes");
const settingsRoutes = require("./routes/settings.routes");
const staffRoutes = require("./routes/staff.routes");

const { sendEmail, getTestEmail } = require("./mailer");

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================================
// MIDDLEWARES
// ============================================

app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

app.use("/api", categoriesRoutes);
app.use("/api", appointmentsRoutes);
app.use("/api", imagesRoutes);
app.use("/api", contactRoutes);
app.use("/api", reviewsRoutes);
app.use("/api", settingsRoutes);
app.use("/api", staffRoutes);
app.use("/api/auth", authRoutes);

// Test email route
app.get("/test-email", async (req, res) => {
  try {
    const testEmail = getTestEmail();

    const emailSent = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: testEmail.subject,
      text: testEmail.text,
      html: testEmail.html,
    });

    if (emailSent) {
      res.send("Email sent successfully");
    } else {
      res.status(500).send("Email failed");
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).send("Email failed");
  }
});

// ============================================
// SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`SALON OZ Backend running on http://localhost:${PORT}`);
  console.log("");
  console.log("Available endpoints:");
  console.log(`GET  http://localhost:${PORT}/api/services`);
  console.log(`GET  http://localhost:${PORT}/api/staff`);
  console.log(`GET  http://localhost:${PORT}/api/appointments`);
  console.log(`POST http://localhost:${PORT}/api/appointments`);
  console.log(`PUT  http://localhost:${PORT}/api/appointments/:id`);
  console.log(`GET  http://localhost:${PORT}/api/images`);
  console.log(`POST http://localhost:${PORT}/api/contact`);
  console.log(`GET  http://localhost:${PORT}/api/reviews`);
  console.log(`POST http://localhost:${PORT}/api/reviews`);
  console.log(`GET  http://localhost:${PORT}/test-email`);
});