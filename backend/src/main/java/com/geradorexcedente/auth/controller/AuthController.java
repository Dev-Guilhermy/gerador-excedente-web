package com.geradorexcedente.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import com.geradorexcedente.auth.dto.LoginRequestDTO;
import com.geradorexcedente.auth.dto.LoginResponseDTO;
import com.geradorexcedente.auth.dto.UsuarioLogadoDTO;
import com.geradorexcedente.auth.response.AuthResponse;
import com.geradorexcedente.auth.service.AuthService;
import com.geradorexcedente.usuario.dao.UsuarioDAO;
import com.geradorexcedente.usuario.model.Usuario;
import com.geradorexcedente.usuario.service.UsuarioService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    /*
     * 🔐 AuthController → AUTENTICAÇÃO / SESSÃO
     * 
     * Responsável por:
     * 
     * Login
     * 
     * Logout
     * 
     * Refresh token
     * 
     * Usuário logado (contexto atual)
     * 
     * 👉 Tudo que depende de token/sessão
     */

    private final UsuarioService usuarioService;
    private final AuthService authService;
    private final UsuarioDAO usuarioDAO;

    public AuthController(
            UsuarioService usuarioService,
            AuthService authService,
            UsuarioDAO usuarioDAO) {

        this.usuarioService = usuarioService;
        this.authService = authService;
        this.usuarioDAO = usuarioDAO;
    }

    // ==========================================
    // 🔐 LOGIN
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {

        LoginResponseDTO response = usuarioService.autenticar(
                request.getEmail(),
                request.getSenha());

        if (response == null) {

            LoginResponseDTO erro = new LoginResponseDTO();
            erro.setMensagem("Credenciais inválidas");

            return ResponseEntity.status(401).body(erro);
        }

        // ==========================================
        // 🟢 MARCA USUÁRIO COMO ONLINE
        // ==========================================
        usuarioDAO.setOnline(request.getEmail());

        return ResponseEntity.ok(response);
    }

    // ==========================
    // LOGOUT
    // ==========================

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication auth) {

        String email = auth.getName();

        usuarioService.logout(email); // ✅ correto

        return ResponseEntity.ok().build();
    }

    // ==========================================
    // 🔁 REFRESH TOKEN
    // ==========================================
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestHeader("Authorization") String header) {

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String refreshToken = header.substring(7);

        AuthResponse response = authService.refreshToken(refreshToken);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 👤 USUÁRIO LOGADO
    // ==========================================
    @GetMapping("/me")
    public ResponseEntity<UsuarioLogadoDTO> usuarioLogado(Authentication auth) {

        Object principal = auth.getPrincipal();

        if (principal instanceof Usuario u) {
            return ResponseEntity.ok(
                    new UsuarioLogadoDTO(
                            u.getEmail(),
                            u.getNome(),
                            u.getPerfil().name()));
        }

        throw new RuntimeException("Tipo de usuário inválido");
    }
}