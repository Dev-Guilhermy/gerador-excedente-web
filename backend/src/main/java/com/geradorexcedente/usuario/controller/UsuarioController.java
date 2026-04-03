package com.geradorexcedente.usuario.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.geradorexcedente.usuario.model.Usuario;
import com.geradorexcedente.usuario.service.UsuarioService;
import com.geradorexcedente.usuario.model.Role;

import java.util.List;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // ===================================
    // 🔍 BUSCAR POR EMAIL
    // ===================================
    @GetMapping("/email")
    public ResponseEntity<Usuario> buscarPorEmail(@RequestParam String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(usuario);
    }

    // ===================================
    // 💾 CADASTRAR
    // ===================================
    @PostMapping
    public ResponseEntity<Usuario> cadastrar(@RequestBody Usuario usuario) {
        System.out.println("CHEGOU NO CADASTRO");
        Usuario salvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(201).body(salvo);
    }

    // ===================================
    // ✏️ ATUALIZAR
    // ===================================
    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(@PathVariable Long id,
            @RequestBody Usuario usuario) {

        usuario.setId(id);
        usuarioService.atualizarUsuario(usuario);

        return ResponseEntity.ok("Usuário atualizado com sucesso");
    }

    // ===================================
    // ❌ DESATIVAR
    // ===================================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletar(@PathVariable Long id) {

        usuarioService.desativarUsuario(id);

        return ResponseEntity.ok("Usuário desativado com sucesso");
    }

    // ===================================
    // 📊 LISTAR TODOS
    // ===================================
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // ===================================
    // 📊 STATUS USUÁRIOS
    // ===================================
    @GetMapping("/status")
    public ResponseEntity<List<Usuario>> statusUsuarios() {
        return ResponseEntity.ok(usuarioService.listarStatusUsuarios());
    }

    // ===================================
    // 👑 USUÁRIOS ONLINE (SOMENTE MASTER)
    // ===================================
    @GetMapping("/online")
    public ResponseEntity<List<Usuario>> usuariosOnline(
            @AuthenticationPrincipal Usuario usuarioLogado) {

        // 🔐 segurança
        if (usuarioLogado == null || usuarioLogado.getPerfil() != Role.MASTER) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(usuarioService.listarSomenteOnline());
    }

    // ===================================
    // ⏱ HEARTBEAT
    // ===================================
    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(Authentication auth) {

        // 🔥 AGORA FUNCIONA PERFEITO
        String email = auth.getName();

        usuarioService.atualizarUltimoAcesso(email);

        return ResponseEntity.ok().build();
    }
}