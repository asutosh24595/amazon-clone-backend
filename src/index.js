const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStore = new Map();

const generateOtp = () => {
  return crypto.randomBytes(3).toString("hex");
};

app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  console.log(email);
  const otp = generateOtp();

  otpStore.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Amazon Account Verification",
    text: `Your OTP code for Amazon account sign in is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
      res
        .status(500)
        .json({ message: "Error sending OTP email. Please try again." });
    } else {
      console.log("OTP email sent:", info.response);
      res.status(200).json({ message: "OTP sent to email" });
    }
  });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  console.log("Email: ", email, "Otp: ", otp);
  console.log("OTP Store: ", otpStore);

  if (otpStore.has(email)) {
    if(otpStore.get(email) === otp){
    otpStore.delete(email); // Clear OTP after verification
    console.log("OTP Store: ", otpStore);
    res.status(200).json({ message: "OTP verified successfully" });
    } else {
    res
      .status(400)
      .json({ message: "Invalid OTP. Please enter the correct OTP." });
    }
  }else{
    res
      .status(400)
      .json({ message: "Wrong email. Please enter the correct email." });
    }
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
