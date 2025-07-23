import React, { useState } from "react";
import { generateGeminiContent } from "../services/api";

const GeminiStory: React.FC = () => {
  const [prompt, setPrompt] = useState("Escribe un cuento en español de un perro volador");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setStory("");
    try {
      const result = await generateGeminiContent(prompt);
      setStory(result);
    } catch (err) {
      setError("Error al generar el cuento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fafbfc" }}>
      <h2>Generador de cuentos con Gemini</h2>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: 12 }}
      />
      <br />
      <button onClick={handleGenerate} disabled={loading} style={{ padding: "8px 16px", fontWeight: "bold" }}>
        {loading ? "Generando..." : "Generar cuento"}
      </button>
      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      {story && (
        <div style={{ marginTop: 24, whiteSpace: "pre-line", background: "#fff", padding: 16, borderRadius: 6, boxShadow: "0 1px 4px #0001" }}>
          <h3>Resultado:</h3>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
};

export default GeminiStory; 