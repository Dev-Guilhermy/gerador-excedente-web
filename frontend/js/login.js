// ============================================
// LOGIN.JS - RESPONSÁVEL PELA AUTENTICAÇÃO
// ============================================


// ============================
// 1. ELEMENTOS (DOM)
// ============================
// 👉 Sempre no topo: evita erros de "não definido"

const form = document.getElementById("loginForm");
const erroGlobal = document.getElementById("erroGlobal");
const btn = document.querySelector(".submit-btn");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const toggleSenha = document.getElementById("toggleSenha");
const inputBox = senhaInput.closest(".input-box");


// ============================
// 2. EVENTOS (INTERAÇÕES)
// ============================

// ============================================
// 📌 SUBMIT DO FORMULÁRIO (LOGIN)
// ============================================
form.addEventListener("submit", async (e) => {

    // 🛑 Evita reload da página
    e.preventDefault();

    // 🧹 Limpa estados anteriores
    limparErros();

    // 📥 Captura valores
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    // ⚠️ Validação antes de chamar API
    if (!validarCampos(email, senha)) return;

    try {

        // ⏳ Estado de loading
        ativarLoading();

        // 🌐 Chamada API
        const data = await apiLogin("/auth/login", { email, senha });

        // ✅ Feedback de sucesso
        sucessoLogin();

    } catch (err) {

        // ❌ Tratamento de erro
        tratarErro(err);

    } finally {

        // 🔄 Restaura botão
        desativarLoading();
    }
});


// ============================================
// 🔄 REMOVE ERRO AO DIGITAR (UX)
// ============================================
emailInput.addEventListener("input", () => {
    emailInput.classList.remove("input-error");
});

senhaInput.addEventListener("input", () => {
    senhaInput.classList.remove("input-error");
});


// ============================================
// ✨ ANIMAÇÃO INPUT SENHA
// ============================================
senhaInput.addEventListener("input", () => {

    if (senhaInput.value.length > 0) {
        inputBox.classList.add("active");
    } else {
        inputBox.classList.remove("active");

        // 🔒 Reset visual da senha
        senhaInput.type = "password";
        toggleSenha.classList.add("bx-show");
        toggleSenha.classList.remove("bx-hide");
    }
});


// ============================================
// 👁️ TOGGLE VISUAL DA SENHA
// ============================================
toggleSenha.addEventListener("click", () => {

    const tipo = senhaInput.type === "password" ? "text" : "password";
    senhaInput.type = tipo;

    toggleSenha.classList.toggle("bx-show");
    toggleSenha.classList.toggle("bx-hide");
});


// ============================================
// 🔘 DESABILITA BOTÃO SE CAMPOS VAZIOS
// ============================================
form.addEventListener("input", () => {
    btn.disabled = !emailInput.value || !senhaInput.value;
});


// ============================
// 3. FUNÇÕES (REGRAS E LÓGICA)
// ============================

// ============================================
// 🧹 LIMPA ERROS VISUAIS
// ============================================
function limparErros() {
    erroGlobal.innerText = "";
    emailInput.classList.remove("input-error");
    senhaInput.classList.remove("input-error");
}


// ============================================
// ⚠️ VALIDAÇÃO DOS CAMPOS
// ============================================
function validarCampos(email, senha) {

    if (!email) {
        erroGlobal.innerText = "Informe o email.";
        emailInput.classList.add("input-error");
        return false;
    }

    if (!senha) {
        erroGlobal.innerText = "Informe a senha.";
        senhaInput.classList.add("input-error");
        return false;
    }

    return true;
}


// ============================================
// ⏳ ATIVA ESTADO DE LOADING
// ============================================
function ativarLoading() {
    btn.innerText = "Entrando...";
    btn.disabled = true;
}


// ============================================
// 🔄 DESATIVA ESTADO DE LOADING
// ============================================
function desativarLoading() {
    btn.innerText = "Sucesso";
    btn.disabled = false;
}


// ============================================
// ✅ SUCESSO NO LOGIN
// ============================================
function sucessoLogin() {
    btn.innerText = "Entrar";
    btn.style.background = "#00ff88";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}


// ============================================
// ❌ TRATAMENTO DE ERROS
// ============================================
function tratarErro(err) {

    let mensagem = "Erro ao realizar login. Tente novamente.";

    if (err.message.includes("401")) {
        mensagem = "Email ou senha incorretos.";
    }
    else if (err.message.includes("Failed to fetch")) {
        mensagem = "Servidor indisponível. Verifique sua conexão.";
    }
    else if (err.message) {
        mensagem = err.message;
    }

    erroGlobal.innerText = mensagem;
}