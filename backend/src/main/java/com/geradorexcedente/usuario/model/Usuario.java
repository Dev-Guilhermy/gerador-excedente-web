package com.geradorexcedente.usuario.model;

import jakarta.persistence.Column;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Transient;

// =====================================================
// 👤 ENTIDADE USUÁRIO + SEGURANÇA (UserDetails)
// =====================================================
public class Usuario implements UserDetails {

    private long id;
    private String nome;
    private String email;

    @Transient
    private String senha;

    @Column(name = "senha")
    private String senhaHash; // vai pro banco

    private Boolean ativo;

    // 🔒 segurança contra brute force
    private Integer tentativasLogin;
    private LocalDateTime bloqueadoAte;

    private Boolean online;
    private LocalDateTime ultimoAcesso;

    private Role perfil; // MASTER ou USER

    // ===============================
    // 🔐 USERDETAILS (SPRING SECURITY)
    // ===============================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 🔥 padrão ROLE_
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.name()));
    }

    @Override
    public String getPassword() {
        return senhaHash;
    }

    @Override
    public String getUsername() {
        // 🔥 define o "getName()" do Spring
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return bloqueadoAte == null || bloqueadoAte.isBefore(LocalDateTime.now());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(ativo);
    }

    // ===============================
    // GETTERS E SETTERS
    // ===============================

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

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

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getTentativasLogin() {
        return tentativasLogin;
    }

    public void setTentativasLogin(Integer tentativasLogin) {
        this.tentativasLogin = tentativasLogin;
    }

    public LocalDateTime getBloqueadoAte() {
        return bloqueadoAte;
    }

    public void setBloqueadoAte(LocalDateTime bloqueadoAte) {
        this.bloqueadoAte = bloqueadoAte;
    }

    public Boolean getOnline() {
        return online;
    }

    public void setOnline(Boolean online) {
        this.online = online;
    }

    public LocalDateTime getUltimoAcesso() {
        return ultimoAcesso;
    }

    public void setUltimoAcesso(LocalDateTime ultimoAcesso) {
        this.ultimoAcesso = ultimoAcesso;
    }

    public Role getPerfil() {
        return perfil;
    }

    public void setPerfil(Role perfil) {
        this.perfil = perfil;
    }
}