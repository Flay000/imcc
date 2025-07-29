const API_URL = "http://localhost:3000/api/auth";

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Erro ao logar");
  return data;
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Erro ao registrar");
  return data;
}


