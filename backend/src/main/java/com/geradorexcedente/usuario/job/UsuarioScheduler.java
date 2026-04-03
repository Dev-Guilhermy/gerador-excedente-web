package com.geradorexcedente.usuario.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.geradorexcedente.usuario.dao.UsuarioDAO;

// ===================================
// ⏱ JOB AUTOMÁTICO - USUÁRIOS
// ===================================
@Component // 🔥 torna essa classe gerenciada pelo Spring
public class UsuarioScheduler {

    private final UsuarioDAO usuarioDAO;

    // 🔗 injeção via construtor (melhor prática)
    public UsuarioScheduler(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    // ===================================
    // 🔄 EXECUTA A CADA 1 MINUTO
    // ===================================
    @Scheduled(fixedRate = 60000)
    public void verificarUsuariosOffline() {

        try {
            usuarioDAO.atualizarUsuariosOffline();
            System.out.println("🔄 Verificando usuários inativos...");
        } catch (Exception e) {
            System.out.println("Erro no scheduler: " + e.getMessage());
        }
    }
}