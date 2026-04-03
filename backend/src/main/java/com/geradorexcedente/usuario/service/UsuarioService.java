package com.geradorexcedente.usuario.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.geradorexcedente.usuario.model.Role;
import com.geradorexcedente.auth.dto.LoginResponseDTO;
import com.geradorexcedente.security.JwtUtil;
import com.geradorexcedente.usuario.dao.UsuarioDAO;
import com.geradorexcedente.usuario.model.Usuario;

@Service
public class UsuarioService {

    /*
     * =============================================
     * SERVICE RESPONSÁVEL POR:
     * - Validar dados
     * - Aplicar regras de negócio
     * - Controlar fluxo da aplicação
     * - Orquestrar chamadas ao DAO
     * =============================================
     */

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioDAO usuarioDAO;

    @Autowired
    private JwtUtil jwtUtil;

    // ===================================
    // 💾 SALVAR USUÁRIO
    // ===================================
    public Usuario salvar(Usuario usuario) {

        // 🔹 VALIDAÇÕES
        if (usuario.getNome() == null || usuario.getNome().isBlank()) {
            throw new RuntimeException("Nome é obrigatório");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new RuntimeException("Email é obrigatório");
        }

        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new RuntimeException("Senha é obrigatória");
        }

        // 🔐 CRIPTOGRAFIA
        usuario.setSenhaHash(passwordEncoder.encode(usuario.getSenha()));

        // 🟢 ATIVO PADRÃO
        if (usuario.getAtivo() == null) {
            usuario.setAtivo(true);
        }

        // 👑 PERFIL PADRÃO
        if (usuario.getPerfil() == null) {
            usuario.setPerfil(Role.USER);
        }

        usuarioDAO.salvar(usuario);
        return usuario;
    }

    // ===================================
    // 🔍 BUSCAR POR EMAIL
    // ===================================
    public Usuario buscarPorEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email inválido");
        }

        Usuario usuario = usuarioDAO.buscarPorEmail(email);

        if (usuario == null) {
            throw new RuntimeException("Usuário não encontrado");
        }

        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário inativo");
        }

        return usuario;
    }

    // ===================================
    // ✏️ ATUALIZAR USUÁRIO
    // ===================================
    public void atualizarUsuario(Usuario usuario) {

        Usuario existente = usuarioDAO.buscarPorEmail(usuario.getEmail());

        if (existente == null) {
            throw new RuntimeException("Usuário não encontrado");
        }

        // 🔐 mantém dados antigos se não vier no request
        if (usuario.getNome() != null) {
            existente.setNome(usuario.getNome());
        }

        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) {
            existente.setSenhaHash(passwordEncoder.encode(usuario.getSenha()));
        }

        usuarioDAO.atualizar(existente);
    }

    // ===================================
    // ❌ DESATIVAR (SOFT DELETE)
    // ===================================
    public void desativarUsuario(Long id) {
        usuarioDAO.desativar(id);
    }

    // ===================================
    // 🔐 AUTENTICAÇÃO + JWT
    // ===================================
    public LoginResponseDTO autenticar(String email, String senha) {

        Usuario usuario = usuarioDAO.buscarPorEmail(email);

        // ❌ usuário inválido
        if (usuario == null || !usuario.getAtivo()) {
            throw new RuntimeException("Credenciais inválidas");
        }

        // 🔒 conta bloqueada
        if (usuario.getBloqueadoAte() != null &&
                usuario.getBloqueadoAte().isAfter(LocalDateTime.now())) {

            throw new RuntimeException("Conta bloqueada temporariamente");
        }

        // 🔑 senha correta
        if (passwordEncoder.matches(senha, usuario.getSenhaHash())) {

            usuario.setTentativasLogin(0);
            usuario.setOnline(true);
            usuario.setUltimoAcesso(LocalDateTime.now());

            usuarioDAO.atualizar(usuario);

            // 🔐 TOKENS
            String accessToken = jwtUtil.generateToken(usuario.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(usuario.getEmail());

            return new LoginResponseDTO(
                    accessToken,
                    refreshToken,
                    usuario.getNome(),
                    usuario.getPerfil().name());
        }

        // ❌ senha incorreta
        int tentativas = usuario.getTentativasLogin() == null ? 0 : usuario.getTentativasLogin();
        usuario.setTentativasLogin(tentativas + 1);

        if (usuario.getTentativasLogin() >= 5) {
            usuario.setBloqueadoAte(LocalDateTime.now().plusMinutes(15));
        }

        usuarioDAO.atualizar(usuario);

        throw new RuntimeException("Credenciais inválidas");
    }

    // ===================================
    // 📋 LISTAR TODOS OS USUÁRIOS
    // ===================================
    public List<Usuario> listarTodos() {
        /*
         * Retorna todos os usuários (online e offline)
         * Utilizado no endpoint:
         * GET /usuario
         */
        return usuarioDAO.listarTodos();
    }

    // ===================================
    // 🟢 LISTAR STATUS (ONLINE/OFFLINE)
    // ===================================
    public List<Usuario> listarStatusUsuarios() {
        /*
         * Retorna usuários com status:
         * - online
         * - ultimo_acesso
         *
         * Utilizado no endpoint:
         * GET /usuario/status
         */
        return usuarioDAO.listarStatusUsuarios();
    }

    // ===================================
    // 🟢 LISTAR SOMENTE USUÁRIOS ONLINE
    // ===================================
    public List<Usuario> listarSomenteOnline() {
        /*
         * Retorna apenas usuários com status ONLINE = true
         *
         * Utilizado no endpoint:
         * GET /usuario/online
         */
        return usuarioDAO.listarSomenteOnline();
    }

    // ===================================
    // ⏱ ATUALIZAR ÚLTIMO ACESSO (HEARTBEAT)
    // ===================================
    public void atualizarUltimoAcesso(String email) {
        /*
         * Atualiza o campo ultimo_acesso no banco
         * Usado para manter usuário online
         *
         * Endpoint:
         * POST /usuario/heartbeat
         */
        usuarioDAO.atualizarUltimoAcesso(email);
    }

    public void logout(String email) {
        usuarioDAO.setOffline(email);
    }
}