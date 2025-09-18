const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

// --- Twilio Safe Initialization ---
let twilioClient = null;
if (
  process.env.TWILIO_ACCOUNT_SID?.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER &&
  process.env.RECEIVER_PHONE_NUMBER
) {
  try {
    const twilio = require("twilio");
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("✅ Twilio configured successfully.");
  } catch (error) {
    console.warn(
      "⚠️ Twilio initialization failed. Falling back to console logging."
    );
    twilioClient = null;
  }
} else {
  console.warn(
    "⚠️ Twilio credentials missing. Messages will only be logged, not sent."
  );
}

// --- Helper: Detect Messaging Type ---
function detectMessagingType() {
  const from = process.env.TWILIO_PHONE_NUMBER || "";
  return from.startsWith("whatsapp:") ? "whatsapp" : "sms";
}

// --- Appointment Booking API ---
app.post("/api/book-appointment", async (req, res) => {
  try {
    const { name, phone, email, date, message } = req.body;

    if (!name || !phone || !date) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields (name, phone, date)." });
    }

    const messageBody = `📅 New Appointment Request:
Name: ${name}
Phone: ${phone}
Email: ${email || "N/A"}
Date: ${date}
Message: ${message || "N/A"}`;

    const type = detectMessagingType();

    if (twilioClient) {
      try {
        const result = await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.RECEIVER_PHONE_NUMBER,
        });
        console.log(`✅ ${type.toUpperCase()} message sent. SID: ${result.sid}`);
      } catch (sendError) {
        console.error(`❌ Failed to send ${type} message:`, sendError.message);
      }
    } else {
      console.log(`💬 ${type.toUpperCase()} log only:\n${messageBody}`);
    }

    res.json({ success: true, message: "Appointment received successfully!" });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
