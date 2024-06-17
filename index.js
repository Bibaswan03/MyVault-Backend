import express from "express";
import cors from "cors";
import conndb from "./middleware/Connections.js";
import User from "./Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Note from "./Models/Note.js";
import Routine from "./Models/Routine.js";
import Password from "./Models/Password.js";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";

const port=process.env.PORT || 5000;
const secretkey=process.env.JWT_USER_SECRET;
const app = express();
conndb();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const u = new User({ name, email, password: hashedPassword });
    const u1 = await u.save();
    res
      .status(200)
      .json({ success: true, message: "User signed up successfully" });
  } catch (e) {
    res.status(201).json({ success: false, message: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(201)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET
      );
      res
        .status(200)
        .json({ success: true, message: "Login successful", token: token });
    } else {
      res.status(201).json({ success: false, message: "Invalid credentials" });
    }
  } catch (e) {
    console.error(e);
    res.status(201).json({ success: false, message: "Login failed" });
  }
});

app.post("/checklogin", async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res
        .status(201)
        .json({ success: false, message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res
          .status(201)
          .json({ success: false, message: "Invalid token" });
      }
      res
        .status(200)
        .json({ success: true, message: "Login successful", data: decoded });
    } catch (e) {
      res.status(201).json({ success: false, message: "Incorrect token" });
    }
  } catch (e) {
    res.status(201).json({ success: false, message: "Login failed" });
  }
});

app.post("/checkuser", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if(user){
      res.status(200).json({ success: true, message: "User found" });
    }
    else{
      res.status(201).json({ success: false, message: "User not found" });
    }
  } catch (e) {
    res.status(201).json({ success: false, message: "Failed to find user" });
  }
});
//notes-----------------------------------------------------------------

app.post("/addNote", async (req, res) => {
  try {
    const { email, title, description, time } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const n = new Note({ email, title, description, time });
      const n1 = await n.save();
      res
        .status(200)
        .json({ success: true, message: "Note added successfully" });
    } else {
      res.status(201).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to add note" });
  }
});

app.post("/fetchNote", async (req, res) => {
  try {
    const email = req.body.email;
    const notes = await Note.find({ email });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to fetch notes" });
  }
});

app.post("/updateNote", async (req, res) => {
  try {
    const { _id, title, description } = req.body;
    const note = await Note.findByIdAndUpdate(_id, { title, description });
    if (note) {
      res
        .status(200)
        .json({ success: true, message: "Note updated successfully" });
    } else {
      res.status(201).json({ success: false, message: "Note not found" });
    }
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to update note" });
  }
});

app.post("/deleteNote", async (req, res) => {
  try {
    const { _id } = req.body;
    const note = await Note.findByIdAndDelete(_id);
    if (note) {
      res
        .status(200)
        .json({ success: true, message: "Note deleted successfully" });
    } else {
      res.status(201).json({ success: false, message: "Note not found" });
    }
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to delete note" });
  }
});

//routine------------------------------------------------------------------------------

app.post("/addDummyRoutine", async (req, res) => {
  const { email } = req.body;
  try {
    let routine1 = new Routine({ email, day: "Sunday" });
    await routine1.save();
    let routine2 = new Routine({ email, day: "Monday" });
    await routine2.save();
    let routine3 = new Routine({ email, day: "Tuesday" });
    await routine3.save();
    let routine4 = new Routine({ email, day: "Wednesday" });
    await routine4.save();
    let routine5 = new Routine({ email, day: "Thursday" });
    await routine5.save();
    let routine6 = new Routine({ email, day: "Friday" });
    await routine6.save();
    let routine7 = new Routine({ email, day: "Saturday" });
    await routine7.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(201).json({ success: false, message: err.message });
  }
});

app.post("/fetchRoutine", async (req, res) => {
  try {
    const routines = await Routine.find({ email: req.body.email });
    res.status(200).json({ success: true, data: routines });
  } catch (err) {
    res.status(201).json({ success: false, message: err.message });
  }
});

app.post("/saveRoutine", async (req, res) => {
  const { email, day, details } = req.body;
  try {
    let routine = await Routine.findOne({ email, day });
    if (routine) {
      routine.details = details;
    } else {
      routine = new Routine({ email, day, details });
    }
    await routine.save();
    res.status(200).json({ success: true, data: routine });
  } catch (err) {
    res.status(201).json({ success: false, message: err.message });
  }
});

app.post("/deleteRoutine", async (req, res) => {
  const { email, day, taskId } = req.body;
  try {
    let routine = await Routine.findOne({ email, day });
    if (routine) {
      routine.details = routine.details.filter(
        (task) => task._id.toString() !== taskId
      );
      await routine.save();
      res.status(200).json({ success: true, data: routine });
    } else {
      res.status(201).json({ success: false, message: "Routine not found" });
    }
  } catch (err) {
    res.status(201
    ).json({ success: false, message: err.message });
  }
});

//passwords----------------------------------------------------------------
// Function to encrypt data
const encryptData = (text) => {
  const ciphertext = CryptoJS.AES.encrypt(text, secretkey).toString();
  const encodedCiphertext = Buffer.from(ciphertext).toString('base64');
  return encodedCiphertext;
};

// Function to decrypt data
const decryptData = (encodedCiphertext) => {
  const ciphertext = Buffer.from(encodedCiphertext, 'base64').toString('ascii');
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretkey);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
};


app.post("/addPassword", async (req, res) => {
  try {
    const { email, domain, username, password, additional_details } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      let encrypted_username=encryptData(username);
      let encrypted_password=encryptData(password);
      const n = new Password({
        email,
        domain,
        username:encrypted_username,
        password:encrypted_password,
        additional_details,
      });
      const n1 = await n.save();
      res
        .status(200)
        .json({ success: true, message: "Password added successfully" });
    } else {
      res.status(201).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to add password" });
  }
});

app.post("/fetchPassword", async (req, res) => {
  try {
    const email = req.body.email;
    const passwords = await Password.find({ email });
    for(let pass of passwords){
      pass.username=decryptData(pass.username);
      pass.password=decryptData(pass.password);
    }
    res.status(200).json({ success: true, data: passwords });
  } catch (error) {
    res
      .status(201)
      .json({ success: false, message: "Failed to fetch passwords" });
  }
});

app.post("/updatePassword", async (req, res) => {
  try {
    const { _id, domain, username, password, additional_details } = req.body;
    const encrypted_username=encryptData(username);
    const encrypted_password=encryptData(password);
    const passwords = await Password.findByIdAndUpdate(_id, {
      domain,
      username:encrypted_username,
      password:encrypted_password,
      additional_details,
    });
    if (passwords) {
      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } else {
      res.status(201).json({ success: false, message: "Password not found" });
    }
  } catch (error) {
    res
      .status(201)
      .json({ success: false, message: "Failed to update password" });
  }
});

app.post("/deletePassword", async (req, res) => {
  try {
    const { _id } = req.body;
    const password = await Password.findByIdAndDelete(_id);
    if (password) {
      res
        .status(200)
        .json({ success: true, message: "Password deleted successfully" });
    } else {
      res.status(201).json({ success: false, message: "Password not found" });
    }
  } catch (error) {
    res
      .status(201)
      .json({ success: false, message: "Failed to delete password" });
  }
});

app.post("/addRoutine", async (req, res) => {
  try {
    const {
      email,
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const n = new Routine({
        email,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      });
      const n1 = await n.save();
      res
        .status(200)
        .json({ success: true, message: "Routine added successfully" });
    } else {
      res.status(201).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(201).json({ success: false, message: "Failed to add note" });
  }
});

//OTP----------------------------------------------------------
const otpobj = {};
app.post("/sendOtp", async (req, res) => {
  try{
  const {email,username} = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: "nandibibaswan19@gmail.com",
      pass: process.env.APP_KEY,
    },
  });
  const otptosend=Date.now() % 1000000;
  otpobj[email]=otptosend;
  const info = await transporter.sendMail({
    from: '"MyVault 👻" ', // sender address
    to: email, // receiver
    subject: "Verification email for MyVault", // Subject line
    html: `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #000000;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .body {
            padding: 20px;
            text-align: center;
        }
        .body p {
            font-size: 16px;
            color: #333333;
        }
        .otp {
            font-size: 36px;
            font-weight: bold;
            color: #000000;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            background-color: #f4f4f4;
            color: #666666;
            border-radius: 0 0 8px 8px;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #000000;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container" style="background:#dee0e3">
        <div class="header">
            <h1>MyVault OTP Verification</h1>
        </div>
        <div class="body">
            <p>Hello, ${username}</p>
            <p>Thank you for signing up. Your OTP code is:</p>
            <div class="otp">${otptosend}</div>
            <p>Please enter this code to verify your email address.</p>
        </div>
        <div class="footer">
            <p>If you did not request this code, please ignore this email.</p>
            <p>&copy; 2024 MyVault. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`, // html body
  });
  res.status(200).json({success:true,data:info})
}
catch(e){
  res.status(201).json({success:false,message:"Failed to send OTP"})
}
});

app.post('/verifyOtp',async(req,res)=>{
  const {email,otp} = req.body;
  if(otp===otpobj[email]){
    res.status(200).json({success:true,message:"OTP verified"})
  }
  else{
    res.status(201).json({success:false,message:"OTP not verified"})
  }
})





app.listen(port, () => {
  console.log("listening");
});
