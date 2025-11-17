'use client'
import { useState } from "react";
import axios from "axios";

export default function ResumeForm() {
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    setLoading(true);
    setResume("");
    try {
      const res = await axios.post("/api/generate-resume", { jobDescription: jobDesc });
      setResume(res.data.resume);
    } catch (err) {
      setResume("Error generating resume.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([resume], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.txt";
    link.click();
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
      <h1>OpenAI Resume Generator</h1>
      <textarea
        placeholder="Paste job description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        style={{ width: "100%", height: 200, marginBottom: 20 }}
      />
      <button onClick={generateResume} disabled={loading}>
        {loading ? "Generating..." : "Generate Resume"}
      </button>

      {resume && (
        <>
          <button onClick={downloadResume} style={{ marginLeft: 10 }}>
            Download Resume
          </button>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: 20, marginTop: 20 }}>
            {resume}
          </pre>
        </>
      )}
    </div>
  );
}
