import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "./LoginPage.css"; // <-- importe o CSS

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>

        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button className="login-button" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
