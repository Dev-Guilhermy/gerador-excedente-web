package com.geradorexcedente.auth.dto;

public class LoginResponseDTO {

    /*
     * ==========================================
     * 📦 DTO DE RESPOSTA DO LOGIN
     * ==========================================
     * Responsável por retornar ao frontend:
     *
     * - 🔐 Access Token (JWT)
     * - 🔁 Refresh Token
     * - 👤 Nome do usuário
     * - 👑 Perfil (ROLE: MASTER / USER)
     *
     * ⚠️ IMPORTANTE:
     * Todos os campos DEVEM ter getters
     * para serem serializados em JSON (Jackson)
     */

    // ==========================================
    // 🔐 TOKENS
    // ==========================================
    private String token;
    private String refreshToken;

    // ==========================================
    // 👤 DADOS DO USUÁRIO
    // ==========================================
    private String nome;
    private String perfil;

    // ===========================
    // MENSSAGEM
    // ===========================
    private String mensagem;

    // ✅ CONSTRUTOR VAZIO (IMPORTANTE)
    public LoginResponseDTO() {
    }

    // ==========================================
    // 🏗 CONSTRUTOR
    // ==========================================
    public LoginResponseDTO(String token, String refreshToken, String nome, String perfil) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.nome = nome;
        this.perfil = perfil;
    }

    // ==========================================
    // 📤 GETTERS (OBRIGATÓRIOS PARA JSON)
    // ==========================================

    public String getToken() {
        return token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getNome() { // ✅ CORREÇÃO PRINCIPAL
        return nome;
    }

    public String getPerfil() {
        return perfil;
    }

    public String getMensagem() {
        return mensagem;
    }

    // ==========================================
    // ✏️ SETTERS (opcional, mas útil)
    // ==========================================
    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public void setNome(String nome) { // opcional, mas bom manter
        this.nome = nome;
    }
}