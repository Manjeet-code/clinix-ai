import axios from "axios";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ FIXED (CommonJS compatible)

const app = express();


/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
  origin: "http://localhost:3000",
}));

app.use(express.json({ limit: "10mb" }));

/* ---------------- GROQ INIT ---------------- */

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ---------------- CREATE UPLOAD FOLDER ---------------- */

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "AI Patient Assistant Running 🚀" });
});

/* ---------------- CHAT API ---------------- */

app.post("/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
       {
  role: "system",
  content: `
You are a professional medical guidance assistant.

IMPORTANT RULES:
- Do NOT diagnose diseases.
- Do NOT prescribe medicines.
- Provide only general health guidance.
- Always use simple language.
- Always recommend medical consultation for serious symptoms.

STRICT RESPONSE FORMAT:

🧾 SUMMARY:
• Point 1
• Point 2

⚠️ POSSIBLE CAUSES:
• Cause 1
• Cause 2
• Cause 3

🩺 CARE ADVICE:
• Advice 1
• Advice 2
• Advice 3

🚨 WHEN TO SEE A DOCTOR:
• Warning 1
• Warning 2
• Warning 3

RULES:
- Every line must start with "•"
- Never use paragraphs
- Never use "-"
- Never write long sentences
- Keep each bullet short
- Always follow the above format exactly
${
language === "Hindi"
  ? "Respond only in Hindi."
  : "Respond only in English."
}
`
},
        {
          role: "user",
          content:message,
        },
      ],
     temperature: 0.1,
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: "Chat failed" });
  }
});

/* ---------------- PDF ANALYSIS API ---------------- */
app.post("/analyze-pdf", upload.single("file"), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No PDF uploaded",
      });
    }

    filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(fileBuffer);

    const text = pdfData.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        error: "PDF is empty or unreadable",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a medical report assistant.

RULES:
- Do NOT diagnose diseases
- Explain report in simple language
- Highlight abnormal values
- Use bullet points only

FORMAT:

🧾 REPORT SUMMARY:
• Point
• Point

⚠️ KEY OBSERVATIONS:
• Point
• Point

📊 VALUE EXPLANATION:
• Point
• Point

🩺 HEALTH SUGGESTIONS:
• Point
• Point

🚨 CONSULT A DOCTOR IF:
• Point
• Point
`,
        },
        {
          role: "user",
          content: text,
        },
      ],

      temperature: 0.2,
    });

    res.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("PDF ERROR:", error);

    res.status(500).json({
      error: "PDF processing failed",
    });

  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});



app.post("/nearby-hospitals", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: "hospital",
          format: "json",
          limit: 10,
          bounded: 1,
          viewbox: `${lng - 0.05},${lat + 0.05},${lng + 0.05},${lat - 0.05}`,
        },
        headers: {
          "User-Agent": "AI-Patient-Assistant",
        },
      }
    );

    const hospitals = response.data.map((h) => ({
      name: h.display_name,
      lat: h.lat,
      lon: h.lon,
    }));

    res.json({
      result:
        hospitals.length > 0
          ? hospitals.map((h) => `🏥 ${h.name}`).join("\n\n")
          : "No nearby hospitals found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch hospitals",
    });
  }
});

app.post("/api/symptoms", async (req, res) => {
  try {
    const { symptoms, language } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a medical symptom checker.

RULES:
- Do NOT diagnose diseases.
- Do NOT prescribe medicines.
- Give only general guidance.

FORMAT:

🧾 POSSIBLE CONDITIONS:
• Condition 1
• Condition 2

⚠️ SEVERITY:
• Mild / Moderate / Severe

🩺 RECOMMENDED SPECIALIST:
• Specialist name

💡 ADVICE:
• Advice 1
• Advice 2

🚨 SEEK MEDICAL HELP IF:
• Warning 1
• Warning 2
${language === "Hindi"
 ? "Answer in Hindi."
 : "Answer in English."}
`
        },
        {
          role: "user",
          content: symptoms
        }
      ],

      temperature: 0.2,
    });

    res.json({
      success: true,
      response: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("SYMPTOMS ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Analysis failed",
    });
  }
});

app.post("/api/medicine", async (req, res) => {
  try {
    const { medicine, language } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a medicine information assistant.

RULES:
- Do NOT prescribe medicines.
- Provide educational information only.

FORMAT:

💊 MEDICINE:
• Name

📌 USES:
• Use 1
• Use 2

⚠️ COMMON SIDE EFFECTS:
• Effect 1
• Effect 2

🚫 PRECAUTIONS:
• Precaution 1
• Precaution 2

🩺 IMPORTANT:
• Follow doctor's advice
${language === "Hindi"
 ? "Answer in Hindi."
 : "Answer in English."}
`
        },
        {
          role: "user",
          content: medicine
        }
      ],

      temperature: 0.2
    });

    res.json({
      success: true,
      response: response.choices[0].message.content
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Medicine analysis failed"
    });
  }
});

app.post("/bmi", async (req, res) => {
  try {
    const { weight, height } = req.body;

    const bmi = weight / ((height / 100) * (height / 100));

    let category = "";
    let risk = "";

    if (bmi < 18.5) {
      category = "Underweight";
      risk = "Medium";
    } 
    else if (bmi < 25) {
      category = "Normal Weight";
      risk = "Low";
    } 
    else if (bmi < 30) {
      category = "Overweight";
      risk = "Medium";
    } 
    else {
      category = "Obese";
      risk = "High";
    }

    res.json({
      bmi: bmi.toFixed(1),
      category,
      risk
    });

  } catch (error) {
    res.status(500).json({
      error: "BMI calculation failed"
    });
  }
});
/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});