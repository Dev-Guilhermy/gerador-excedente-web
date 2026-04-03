package com.geradorexcedente.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.filter.OncePerRequestFilter;

import com.geradorexcedente.usuario.model.Usuario;
import com.geradorexcedente.usuario.service.UsuarioService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    // =============================================
    // 🔓 ROTAS PÚBLICAS
    // =============================================
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/auth/login")
                || path.startsWith("/auth/refresh")
                || (path.equals("/usuario") && request.getMethod().equals("POST"))
                || path.startsWith("/health")
                || path.startsWith("/warmup");
    }

    // =============================================
    // 🔐 FILTRO JWT
    // =============================================
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7).trim();

            // 🔍 DEBUG
            log.info("Usuário autenticado: {}", token);

            if (!jwtUtil.validarToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtUtil.extrairEmail(token);

                log.info("Usuário autenticado: {}", email);

                Usuario usuario = usuarioService.buscarPorEmail(email);

                if (usuario != null && usuario.isEnabled()) {

                    System.out.println("USUÁRIO: " + usuario.getEmail());
                    System.out.println("PERFIL: " + usuario.getPerfil());

                    // 🔥 AGORA USERDETAILS
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            usuario,
                            null,
                            usuario.getAuthorities());

                    System.out.println("AUTHORITIES: " + auth.getAuthorities());

                    auth.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}