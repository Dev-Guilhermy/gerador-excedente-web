package com.geradorexcedente.auth.dto;

public class UsuarioLogadoDTO {

    private String email;
    private String nome;
    private String perfil;

    public UsuarioLogadoDTO(String email, String nome, String perfil) {
        this.email = email;
        this.nome = nome;
        this.perfil = perfil;
    }

    public String getEmail() {
        return email;
    }

    public String getNome() {
        return nome;
    }

    public String getPerfil() {
        return perfil;
    }
}