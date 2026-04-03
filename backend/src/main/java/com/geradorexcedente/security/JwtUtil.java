package com.geradorexcedente.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    /*
     * =============================================
     * RESPONSABILIDADES:
     * - Gerar tokens (access + refresh)
     * - Validar token
     * - Extrair email
     * =============================================
     */

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // 🔐 chave segura
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // =============================================
    // 🔐 ACCESS TOKEN
    // =============================================
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // 🔥 padrão único (email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================
    // 🔁 REFRESH TOKEN
    // =============================================
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================
    // 📌 EXTRAIR EMAIL
    // =============================================
    public String extrairEmail(String token) {
        return getClaims(token).getSubject();
    }

    // =============================================
    // 📌 EXTRAIR CLAIMS
    // =============================================
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =============================================
    // ✅ VALIDAR TOKEN
    // =============================================
    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}