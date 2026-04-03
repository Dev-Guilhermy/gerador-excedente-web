package com.geradorexcedente.auth.dto;

public class LoginRequestDTO {
    private String email;
    private String senha;

    /**
     * Objetivo: Represetnar o que o cliente envia no login.
     * Ele serve para: Receber JSON / Evitar usar a entidade Usuario / Evitar expor
     * campos desnecessários / Separar camada de API da camada de domínio
     * 
     * Conceito Arquitetural
     * DTO = Data Transfer Object
     * É um objeto feito apenas para transporte de dados
     * 
     * Ele não:
     * - Acessa banco
     * - Contém regra de negócio
     * - Criptografa senha
     * ele só carrega dados da requisição
     */

    // getters e setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
