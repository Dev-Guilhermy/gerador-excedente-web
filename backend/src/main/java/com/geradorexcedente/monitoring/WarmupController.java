package com.geradorexcedente.monitoring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.geradorexcedente.usuario.dao.UsuarioDAO;

@RestController
public class WarmupController {

    /* evitar cold start */

    @Autowired
    private UsuarioDAO usuarioDAO;

    @GetMapping("/warmup")
    public String warmup() {

        try {
            usuarioDAO.countUsuarios();
        } catch (Exception e) {
            System.out.println("Warmup falhou: " + e.getMessage());
        }

        return "WARMED";
    }
}
