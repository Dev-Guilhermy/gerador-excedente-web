// ==========================================
// BASE URL AUTOMÁTICA
// ==========================================
const API_BASE =
    location.hostname === "localhost"
        ? "http://localhost:8080"
        : "https://gerador-excedente-web.onrender.com";


// const API_BASE = "http://localhost:8080";
// ==========================================
// 📡 REQUEST PADRÃO COM RETRY + AUTH
// ==========================================
async function apiRequest(endpoint, options = {}) {

    // ==========================================
    // 🔁 CHAMADA CENTRALIZADA
    // Aqui acontece:
    // - inclusão do token
    // - refresh automático
    // - retry em caso de erro
    // ==========================================
    const response = await fetchWithAuthRetry(
        API_BASE + endpoint,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    // ==========================================
    // ❌ ERRO REAL (NÃO AUTH)
    // ==========================================
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro na requisição");
    }

    // ==========================================
    // 📦 TRATAMENTO DE RESPOSTA
    // ==========================================
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

// ==========================================
// LOGIN (SEM TOKEN)
// ==========================================
async function apiLogin(endpoint, body) {

    const response = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensagem || "Email ou senha inválidos");
    }

    // ==========================================
    // SALVA TOKEN E USUÁRIO E PERFIL
    // ==========================================
    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }

    if (data.perfil) {
        localStorage.setItem("perfil", data.perfil);
    }

    // nome do usuário (depende do retorno do backend)
    if (data.nome) {
        localStorage.setItem("usuario", data.nome);
    }

    return data;
}

// ==========================================
// 📤 UPLOAD COM RETRY + REFRESH AUTOMÁTICO
// ==========================================
async function apiUpload(endpoint, formData, signal) {

    const response = await fetchWithAuthRetry(
        API_BASE + endpoint,
        {
            method: "POST",
            body: formData,
            signal
        }
    );

    // ==========================================
    // ❌ ERRO REAL DE REQUISIÇÃO
    // ==========================================
    if (!response.ok) {
        throw new Error("Erro no upload");
    }

    return response.json();
}
