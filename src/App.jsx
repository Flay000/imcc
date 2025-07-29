import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Use sua chave
const genAI = new GoogleGenerativeAI("AIzaSyAFFIBmVG5WRAe7fKSqD1jkhn1-H788J7k");

function App() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  const calculaIMC = (p, a) => {
    const alturaM = parseFloat(a);
    const pesoKg = parseFloat(p);
    if (!alturaM || !pesoKg) return null;
    return pesoKg / (alturaM * alturaM);
  };

  const gerarPrompt = (peso, altura, imc) => {
    let objetivo = "";
    if (imc >= 30) objetivo = "obesidade, sugerir uma dieta para emagrecimento, mantendo massa muscular";
    else if (imc >= 25) objetivo = "sobrepeso, sugerir uma dieta para emagrecimento";
    else if (imc >= 18.5) objetivo = "peso normal, sugerir dieta para manter peso";
    else objetivo = "abaixo do peso, sugerir dieta para ganho de peso saudável";

    return `Eu tenho:
- Peso: ${peso} kg
- Altura: ${altura} m
- IMC: ${imc.toFixed(2)}

Com base nesses dados, sugira uma dieta simples, acessível e saudável para ${objetivo}.
Inclua sugestões de refeições e dicas para o dia a dia.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imc = calculaIMC(peso, altura);
    if (!imc) {
      setResultado("Por favor, insira valores válidos.");
      return;
    }

    setCarregando(true);
    setResultado("");

    const prompt = gerarPrompt(peso, altura, imc);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setResultado(response.text());
    } catch (error) {
      setResultado("Erro ao gerar sugestão: " + error.message);
    }

    setCarregando(false);
  };

  return (
    <>
      {/* Meta tag para responsividade mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <div style={styles.container}>
        <h2 style={styles.title}>💪 Calculadora de IMC + Dieta</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Peso (kg):
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Altura (m):
            <input
              type="number"
              step="0.01"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <button type="submit" style={styles.button} disabled={carregando}>
            {carregando ? "Consultando o Gemini..." : "Sugerir Dieta"}
          </button>
        </form>

        {resultado && (
          <div style={styles.resultado}>
            <strong>Resultado:</strong>
            <pre style={styles.pre}>{resultado}</pre>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    marginTop: 5,
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: 12,
    fontSize: 16,
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  resultado: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 6,
    border: "1px solid #ddd",
  },
  pre: {
    whiteSpace: "pre-wrap",
    fontSize: 14,
    lineHeight: "1.6",
  },
};

export default App;
