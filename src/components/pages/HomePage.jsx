// App.jsx
import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

function App() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imc, setIMC] = useState(null);
  const [imagem, setImagem] = useState(null);
  const [resultadoFoto, setResultadoFoto] = useState("");
  const [carregando, setCarregando] = useState(false);

  const calcularIMC = () => {
    if (peso && altura) {
      const alturaM = parseFloat(altura) / 100;
      const imcCalculado = parseFloat(peso) / (alturaM * alturaM);
      setIMC(imcCalculado.toFixed(2));
    }
  };
  async function salvarDadosNoBanco(peso, altura, imc, imagemUrl) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Você precisa estar logado para salvar os dados!");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/data/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ peso, altura, imc, imagemUrl }),
      });

      if (!response.ok) throw new Error("Erro ao salvar dados");

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar dados no banco.");
    }
  }

  const analisarImagem = async () => {
    if (!imagem) return alert("Envie uma imagem antes!");

    setCarregando(true);
    try {
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const imageBase64 = await toBase64(imagem);

      const imagePart = {
        inlineData: {
          data: imageBase64.split(",")[1], // remove o prefixo base64
          mimeType: imagem.type,
        },
      };

      const prompt = "Analise essa imagem corporal e estime a taxa de gordura corporal e massa muscular aproximada da pessoa. Seja claro e breve.";
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      setResultadoFoto(text);
    } catch (error) {
      console.error("Erro:", error);
      setResultadoFoto("Erro ao analisar imagem.");
    } finally {
      setCarregando(false);
    }
    await salvarDadosNoBanco(peso, altura, imc, imagem ? URL.createObjectURL(imagem) : null);
    setPeso("");
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1>Calculadora de IMC + Análise de Imagem</h1>

      <div>
        <label>Peso (kg):</label><br />
        <input
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        /><br /><br />

        <label>Altura (cm):</label><br />
        <input
          type="number"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
        /><br /><br />

        <button onClick={calcularIMC}>Calcular IMC</button><br /><br />
        {imc && <p>Seu IMC é: <strong>{imc}</strong></p>}
      </div>

      <hr />

      <div>
        <h2>Análise da Taxa de Gordura Corporal</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagem(e.target.files[0])}
        /><br /><br />

        <button onClick={analisarImagem} disabled={carregando}>
          {carregando ? "Analisando..." : "Analisar Imagem"}
        </button>

        {resultadoFoto && (
          <div style={{ marginTop: 20 }}>
            <h3>Resultado:</h3>
            <p>{resultadoFoto}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
