package com.geradorexcedente.usuario.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import com.geradorexcedente.usuario.model.Role;
import com.geradorexcedente.usuario.model.Usuario;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class UsuarioDAO {

    /*
     * 📌 PADRÃO ADOTADO:
     * - JdbcTemplate
     * - Sem DataSource manual
     * - Código limpo e performático
     */

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ===================================
    // 🔒 MÉTODO INTERNO (PROTEÇÃO PERFIL)
    // ===================================
    private Role mapPerfil(String perfil) {

        try {
            if (perfil == null || perfil.isBlank()) {
                return Role.USER;
            }

            // 🔥 NORMALIZAÇÃO (CORREÇÃO CRÍTICA)
            return Role.valueOf(perfil.toUpperCase());

        } catch (Exception e) {

            System.out.println("⚠️ Perfil inválido no banco: " + perfil);

            return Role.USER;
        }
    }

    // ===================================
    // 🔍 BUSCAR USUÁRIO POR EMAIL
    // ===================================
    public Usuario buscarPorEmail(String email) {

        String sql = "SELECT * FROM usuarios WHERE email = ?";

        List<Usuario> lista = jdbcTemplate.query(sql, (rs, rowNum) -> {

            Usuario usuario = new Usuario();

            usuario.setId(rs.getLong("id"));
            usuario.setNome(rs.getString("nome"));
            usuario.setEmail(rs.getString("email"));
            usuario.setSenhaHash(rs.getString("senha_hash"));
            usuario.setAtivo(rs.getBoolean("ativo"));

            // 🔐 Conversão segura
            usuario.setPerfil(mapPerfil(rs.getString("perfil")));

            // 🔐 tratamento correto de NULL no banco
            int tentativas = rs.getInt("tentativas_login");
            usuario.setTentativasLogin(rs.wasNull() ? null : tentativas);

            Timestamp bloqueado = rs.getTimestamp("bloqueado_ate");
            if (bloqueado != null) {
                usuario.setBloqueadoAte(bloqueado.toLocalDateTime());
            }

            return usuario;

        }, email);

        return lista.isEmpty() ? null : lista.get(0);
    }

    // ===================================
    // 💾 SALVAR USUÁRIO
    // ===================================
    public void salvar(Usuario usuario) {

        try {
            String sql = """
                    INSERT INTO usuarios
                    (nome, email, senha_hash, ativo, perfil)
                    VALUES (?, ?, ?, ?, ?)
                    """;

            jdbcTemplate.update(sql,
                    usuario.getNome(),
                    usuario.getEmail(),
                    usuario.getSenhaHash(),
                    usuario.getAtivo(),
                    usuario.getPerfil().name());

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao salvar usuário: " + e.getMessage());
        }
    }

    // ===================================
    // ✏️ ATUALIZAR USUÁRIO
    // ===================================
    public void atualizar(Usuario usuario) {

        String sql = """
                UPDATE usuarios SET
                    nome = ?,
                    email = ?,
                    senha_hash = ?,
                    ativo = ?,
                    tentativas_login = ?,
                    bloqueado_ate = ?,
                    online = ?,
                    ultimo_acesso = ?
                WHERE id = ?
                """;

        jdbcTemplate.update(sql,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getSenhaHash(),
                usuario.getAtivo(),
                usuario.getTentativasLogin(),
                usuario.getBloqueadoAte(),
                usuario.getOnline(),
                usuario.getUltimoAcesso(),
                usuario.getId());
    }

    // ===================================
    // ❌ DESATIVAR USUÁRIO
    // ===================================
    public void desativar(Long id) {
        String sql = "UPDATE usuarios SET ativo = false WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // ===================================
    // 🟢 SET ONLINE
    // ===================================
    public void setOnline(String email) {
        String sql = "UPDATE usuarios SET online = true, ultimo_acesso = NOW() WHERE email = ?";
        jdbcTemplate.update(sql, email);
    }

    // ===================================
    // 🔴 SET OFFLINE
    // ===================================
    public void setOffline(String email) {
        String sql = "UPDATE usuarios SET online = false WHERE email = ?";
        jdbcTemplate.update(sql, email);
    }

    // ===================================
    // ⏱ AUTO-OFFLINE (INATIVIDADE)
    // ===================================
    public void atualizarUsuariosOffline() {

        String sql = """
                UPDATE usuarios
                SET online = false
                WHERE ultimo_acesso < NOW() - INTERVAL '5 minutes'
                """;

        jdbcTemplate.update(sql);
    }

    // ===================================
    // 🔄 HEARTBEAT (MANTER ONLINE)
    // ===================================
    public void atualizarUltimoAcesso(String email) {

        String sql = "UPDATE usuarios SET ultimo_acesso = NOW() WHERE email = ?";
        jdbcTemplate.update(sql, email);
    }

    // ===================================
    // 📊 LISTAR STATUS (ONLINE/OFFLINE)
    // ===================================
    public List<Usuario> listarStatusUsuarios() {

        String sql = "SELECT id, nome, email, online, ultimo_acesso, perfil FROM usuarios";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Usuario u = new Usuario();

            u.setId(rs.getLong("id"));
            u.setNome(rs.getString("nome"));
            u.setEmail(rs.getString("email"));
            u.setOnline(rs.getBoolean("online"));

            // 🔐 Seguro
            u.setPerfil(mapPerfil(rs.getString("perfil")));

            Timestamp ts = rs.getTimestamp("ultimo_acesso");
            if (ts != null) {
                u.setUltimoAcesso(ts.toLocalDateTime());
            }

            return u;
        });
    }

    // ===================================
    // 📋 LISTAR TODOS OS USUÁRIOS
    // ===================================
    public List<Usuario> listarTodos() {

        /*
         * ⚠️ IMPORTANTE:
         * - NÃO retornamos senha_hash
         * - Segurança da aplicação
         */

        String sql = "SELECT id, nome, email, ativo, online, perfil, ultimo_acesso FROM usuarios";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Usuario u = new Usuario();

            u.setId(rs.getLong("id"));
            u.setNome(rs.getString("nome"));
            u.setEmail(rs.getString("email"));
            u.setAtivo(rs.getBoolean("ativo"));
            u.setOnline(rs.getBoolean("online"));

            // 🔐 Seguro
            u.setPerfil(mapPerfil(rs.getString("perfil")));

            Timestamp ts = rs.getTimestamp("ultimo_acesso");
            if (ts != null) {
                u.setUltimoAcesso(ts.toLocalDateTime());
            }

            return u;
        });
    }

    // ===================================
    // 🟢 LISTAR SOMENTE ONLINE
    // ===================================
    public List<Usuario> listarSomenteOnline() {

        String sql = """
                SELECT id, nome, email, online, ultimo_acesso, perfil
                FROM usuarios
                WHERE online = true
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Usuario u = new Usuario();

            u.setId(rs.getLong("id"));
            u.setNome(rs.getString("nome"));
            u.setEmail(rs.getString("email"));
            u.setOnline(rs.getBoolean("online"));

            // 🔐 Seguro
            u.setPerfil(mapPerfil(rs.getString("perfil")));

            Timestamp ts = rs.getTimestamp("ultimo_acesso");
            if (ts != null) {
                u.setUltimoAcesso(ts.toLocalDateTime());
            }

            return u;
        });
    }

    // ===================================
    // 🔍 COUNT USUÁRIOS (HEALTHCHECK)
    // ===================================
    public int countUsuarios() {
        String sql = "SELECT COUNT(*) FROM usuarios";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }
}