# 🩺 Clinix AI

**AI-Powered Healthcare Assistant Web App**

Clinix AI is a full-stack intelligent healthcare assistant that helps users with symptom analysis, medical report understanding, nearby hospital search, and AI-powered health guidance.

---

## 🚀 Features

### 🤖 AI Chat Assistant

* Smart medical guidance chatbot
* Symptom-based suggestions
* Simple and human-like responses

### 📄 Medical Report Analyzer

* Upload PDF medical reports
* AI extracts and explains results
* Highlights abnormal values

### 🧠 Symptoms Checker

* Enter symptoms manually
* Get possible conditions & advice
* Severity estimation

### 🏥 Nearby Hospital Finder

* Uses live location
* Shows nearby hospitals
* Real-time geolocation support

### 🎤 Voice Input Support

* Speech-to-text integration
* Hands-free interaction

---

## 🛠️ Tech Stack

**Frontend:**

* React.js
* CSS3 (Glassmorphism UI)
* Axios
* Web Speech API

**Backend:**

* Node.js
* Express.js
* Groq AI (LLaMA 3)
* Multer (File Uploads)
* PDF-Parse

**APIs:**

* OpenStreetMap (Hospitals)
* Geolocation API

---

## 📁 Project Structure

```
clinix-ai/
│
├── backend/
│   ├── server.js
│   ├── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Manjeet-code/clinix-ai.git
```

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in backend:

```
GROQ_API_KEY=your_api_key_here
PORT=5000
```

---

## 📸 UI Highlights

* Modern glassmorphism UI
* Responsive design
* Professional healthcare dashboard look
* Clean chat interface

---

## ⚠️ Disclaimer

Clinix AI is not a replacement for professional medical advice.
Always consult a certified doctor for medical conditions.

---

## 👨‍💻 Developer

**Manjeet Kumar**

---

## ⭐ Future Improvements

* Medicine information checker
* Health risk score (BMI + symptoms)
* Appointment booking system
* AI prescription explanation

---

## 📌 License

This project is for educational purposes.
