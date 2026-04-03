package com.geradorexcedente.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.geradorexcedente.auth.response.AuthResponse;
import com.geradorexcedente.security.JwtUtil;

@Service
public class AuthService {

    /*
     * Serviço responsável por:
     * - Refresh de token
     */

    private final JwtUtil jwtUtil;

    // ==========================================
    // 🔧 INJEÇÃO VIA CONSTRUTOR (CORRETO)
    // ==========================================
    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // ==========================================
    // 🔁 REFRESH TOKEN
    // ==========================================
    public AuthResponse refreshToken(String refreshToken) {

        // valida refresh token
        if (!jwtUtil.validarToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido");
        }

        // extrai email
        String email = jwtUtil.extrairEmail(refreshToken);

        // gera novo access token
        String newAccessToken = jwtUtil.generateToken(email);

        return new AuthResponse(newAccessToken, refreshToken);
    }
}