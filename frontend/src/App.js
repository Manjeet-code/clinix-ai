import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

function App() {

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [pdfResult, setPdfResult] = useState("");
  const [hospitalResult, setHospitalResult] = useState("");
  const [symptomResult, setSymptomResult] = useState("");
  const [medicine, setMedicine] = useState("");
  const [medicineResult, setMedicineResult] = useState("");
  const [language, setLanguage] = useState("English");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);
  const chatEndRef = useRef(null);

  const {
    transcript,
    listening,
  } = useSpeechRecognition();

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  /* ---------------- LOCATION ---------------- */

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        alert("Location captured successfully");
      },
      () => {
        alert("Location access denied");
      }
    );
  };

  /* ---------------- HOSPITAL SEARCH ---------------- */

  const findNearbyHospitals = async () => {
    if (!location) {
      alert("Please get location first");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/nearby-hospitals",
        location
      );

setHospitalResult(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- CHAT ---------------- */

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message;

    setChat((prev) => [
      ...prev,
      {
        role: "user",
        text: userText,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
  const res = await axios.post(
  "http://localhost:5000/chat",
  {
    message: userText,
    language: language
  }
);

      setChat((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);

      setChat((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Server Error",
        },
      ]);
    }

    setLoading(false);
  };

  /* ---------------- PDF ---------------- */

  const uploadPDF = async () => {
    if (!file) {
      alert("Select PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/analyze-pdf",
        formData
      );

setPdfResult(res.data.result);
    } catch (err) {
      console.error(err);

      setChat((prev) => [
        ...prev,
        {
          role: "bot",
          text: "PDF Analysis Failed",
        },
      ]);
    }
  };

const checkSymptoms = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/symptoms",
      { symptoms,
        language }
    );

    setSymptomResult(res.data.response);

  } catch (error) {
    console.error(error);
    setSymptomResult("Failed to analyze symptoms");
  }
};

const checkMedicine = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/medicine",
      {
         medicine,
         language
      }
    );

    setMedicineResult(res.data.response);

  } catch (err) {
    console.error(err);
    setMedicineResult("Failed to fetch medicine information");
  }
};

const calculateBMI = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/bmi",
      {
        weight,
        height
      }
    );

    setBmiResult(res.data);

  } catch (err) {
    console.log(err);
  }
};
  /* ---------------- UI ---------------- */

  return (
    <div className="container">

<div className="header">
  <div className="logoTitle">
    🩺 Clinix AI
  </div>

  <div className="tagline">
   An AI Powered Smart Healthcare Assistant 
  </div>
</div>

      <div className="language-selector">
  <button
    className={language === "English" ? "active-lang" : ""}
    onClick={() => setLanguage("English")}
  >
    🇺🇸 English
  </button>

  <button
    className={language === "Hindi" ? "active-lang" : ""}
    onClick={() => setLanguage("Hindi")}
  >
    🇮🇳 हिन्दी
  </button>
</div>

      {/* PDF SECTION */}
<div className="feature-card report-card">

  <div className="card-header">
    <h2>📄 Medical Report Analyzer</h2>
    <p>
      Upload blood tests, lab reports, prescriptions or medical documents for AI-powered analysis
    </p>
  </div>

  <div className="upload-section">

    <label className="upload-box">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="upload-content">
        📄
        <span>
          {file
            ? file.name
            : "Choose Medical Report"}
        </span>
      </div>
    </label>

    <button
      className="analyze-btn"
      onClick={uploadPDF}
      disabled={!file}
    >
      🔍 Analyze Report
    </button>

  </div>

  {pdfResult && (
    <div className="report-result">
      {pdfResult}
    </div>
  )}

</div>

      <div className="feature-card">
  <h2>Symptoms Checker</h2>

  <textarea
    value={symptoms}
    onChange={(e) => setSymptoms(e.target.value)}
    placeholder="Enter your symptoms..."
  />

  <button onClick={checkSymptoms}>
    Analyze Symptoms
  </button>

   {symptomResult && (
    <div className="symptom-result">
      {symptomResult}
    </div>
  )}

</div>

<div className="feature-card">
  <h2>⚖️ BMI & Health Risk Calculator</h2>

  <input
    type="number"
    placeholder="Age"
    value={age}
    onChange={(e) => setAge(e.target.value)}
  />

  <input
    type="number"
    placeholder="Height (cm)"
    value={height}
    onChange={(e) => setHeight(e.target.value)}
  />

  <input
    type="number"
    placeholder="Weight (kg)"
    value={weight}
    onChange={(e) => setWeight(e.target.value)}
  />

  <button onClick={calculateBMI}>
    Calculate BMI
  </button>

{bmiResult && (
  <div className="bmiResult">
    <h3>Your BMI Report</h3>

    <p>
      <strong>BMI:</strong> {bmiResult.bmi}
    </p>

    <p>
      <strong>Category:</strong> {bmiResult.category}
    </p>

    <p>
      <strong>Health Risk:</strong> {bmiResult.risk}
    </p>
  </div>
)}
</div>

<div className="feature-card medicine-card">

  <div className="card-header">
    <h2>💊 Medicine Information Checker</h2>
    <p>Check medicine uses, side effects and precautions</p>
  </div>

  <div className="medicine-input-group">
    <input
      type="text"
      value={medicine}
      onChange={(e) => setMedicine(e.target.value)}
      placeholder="Enter medicine name (e.g. Paracetamol 500mg)"
    />

    <button onClick={checkMedicine}>
      Search Medicine
    </button>
  </div>

  {medicineResult && (
    <div className="medicine-result">
      {medicineResult}
    </div>
  )}

</div>

      {/* HOSPITAL SECTION */}

<div className="feature-card">

  <h2>📍 Nearby Hospitals</h2>

  <div className="hospitalButtons">
    <button onClick={getLocation}>
      Get Location
    </button>

    <button onClick={findNearbyHospitals}>
      Find Hospitals
    </button>
  </div>

  {hospitalResult && (
    <div className="hospital-result">
      {hospitalResult}
    </div>
  )}

</div>
      


      {/* CHAT */}
  <div className="feature-card">

  <h2>💬 AI Health Consultation</h2>
      <div className="chatBox">

        {chat.map((c, i) => (
          <div
            key={i}
            className={`messageWrapper ${
              c.role === "user"
                ? "userWrapper"
                : "botWrapper"
            }`}
          >
<div className="messageLabel">
  {c.role === "user"
    ? "👤 You"
    : "🤖 Clinix AI"}
</div>

            <div
              className={`message ${
                c.role === "user"
                  ? "user"
                  : "bot"
              }`}
            >
              {c.text}
            </div>

          </div>
        ))}

        <div ref={chatEndRef}></div>

      </div>
 </div>

      {/* VOICE STATUS */}

      <div className="voiceStatus">
        {listening
          ? "🎙 Listening..."
          : "🔇 Voice Off"}
      </div>

      {/* INPUT */}

      <div className="inputBox">

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Describe your symptoms..."
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
        />

        <button
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>

        <button
          onClick={() =>
            SpeechRecognition.startListening({
              continuous: true,
            })
          }
        >
          🎤
        </button>

        <button
          onClick={() =>
            SpeechRecognition.stopListening()
          }
        >
          ⏹ 
        </button>

      </div>

    </div>
  );
}

export default App;