package com.geradorexcedente.excedente.controller;

import com.geradorexcedente.excedente.model.ResultadoDTO;
import com.geradorexcedente.excedente.service.ExcedenteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.unit.DataSize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ============================================================
 * CONTROLLER DE EXCEDENTE
 * ============================================================
 *
 * - Recebe CSV via multipart
 * - Aplica filtros opcionais (teleevento / comunicação)
 * - Retorna SEMPRE JSON estruturado
 * - Garante serialização completa do ResultadoDTO
 * 
 * - receber upload de CSV
 * - validar arquivo recebido
 * - encaminhar processamento ao service
 * - retornar JSON estruturado
 * 
 * Proteções adicionadas:
 *
 * ✔ arquivo vazio
 * ✔ tipo de arquivo inválido
 * ✔ limite de tamanho
 * ✔ proteção contra CSV corrompido
 */
@RestController
@RequestMapping("/api/excedente")
@CrossOrigin(origins = "*")
public class ExcedenteController {

    private static final Logger logger = LoggerFactory.getLogger(ExcedenteController.class);

    // ============================================================
    // LIMITE DE TAMANHO DO ARQUIVO
    // ============================================================
    // Deve seguir o mesmo limite definido no application.properties
    //
    // spring.servlet.multipart.max-file-size=50MB
    //
    // Utilizamos DataSize para evitar cálculos manuais e
    // melhorar a legibilidade do código.
    //
    // DataSize.ofMegabytes(50) → 50MB
    // toBytes() → converte para bytes (tipo long)
    //
    // Mantemos essa validação no controller para:
    // - gerar erro amigável
    // - evitar processamento desnecessário
    // - registrar logs de auditoria
    //
    private static final long MAX_FILE_SIZE = DataSize.ofMegabytes(50).toBytes();

    // ============================================================
    // INJEÇÃO DE DEPENDÊNCIA
    // ============================================================
    private final ExcedenteService service;

    public ExcedenteController(ExcedenteService service) {
        this.service = service;
    }

    /**
     * ============================================================
     * ENDPOINT PRINCIPAL – PROCESSAMENTO DO CSV
     * ============================================================
     *
     * @param file        Arquivo CSV
     * @param teleevento  Filtro opcional de teleevento
     * @param comunicacao Filtro opcional de comunicação
     * @return ResultadoDTO serializado completo
     */
    @PostMapping("/processar")
    public ResponseEntity<ResultadoDTO> processar(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "teleevento", required = false) String teleevento,
            @RequestParam(value = "comunicacao", required = false) String comunicacao) {

        try {

            // =====================================================
            // 1️⃣ VALIDAÇÃO: ARQUIVO EXISTE
            // =====================================================
            if (file == null || file.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo CSV não enviado");
            }

            // =====================================================
            // 2️⃣ VALIDAÇÃO: TAMANHO DO ARQUIVO
            // =====================================================
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo muito grande. Limite: 50MB");
            }

            // =====================================================
            // 3️⃣ VALIDAÇÃO: EXTENSÃO DO ARQUIVO
            // =====================================================
            // Obtém o nome original do arquivo enviado pelo cliente
            String nomeArquivo = file.getOriginalFilename();

            // Verifica se o arquivo possui extensão CSV
            if (nomeArquivo == null || !nomeArquivo.toLowerCase().endsWith(".csv")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo inválido. Apenas CSV é permitido.");
            }

            // =====================================================
            // 4️⃣ VALIDAÇÃO: TIPO MIME (PROTEÇÃO EXTRA)
            // =====================================================
            String contentType = file.getContentType();

            if (contentType != null && !contentType.contains("csv")
                    && !contentType.equals("text/plain")
                    && !contentType.equals("application/vnd.ms-excel")) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Tipo de arquivo inválido. Apenas CSV é permitido.");
            }

            // =====================================================
            // 4️⃣ PROCESSAMENTO DO CSV
            // =====================================================
            ResultadoDTO resultado = service.processar(file, teleevento, comunicacao);

            // =====================================================
            // 🔥 LOGS DE AUDITORIA (PROFISSIONAL)
            // =====================================================
            if (resultado == null) {
                logger.warn("Resultado veio nulo na requisição");

                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Erro no processamento: resultado nulo");
            }

            // =====================================================
            // 🔥 LOGS DE AUDITORIA (PROFISSIONAL)
            // =====================================================
            logger.info("Principal evento: {}", resultado.getEventos());
            logger.info("Total teleeventos: {}", resultado);
            logger.info("Placa: {}", resultado.getPlaca());
            logger.info("Data início: {}", resultado.getDataInicio());
            logger.info("Data fim: {}", resultado.getDataFim());
            logger.info("Arquivo: {}", resultado.getNomeArquivo());

            return ResponseEntity.ok(resultado);

        } catch (RuntimeException e) {
            // =====================================================
            // ERROS DE REGRA / FILTRO → 400
            // =====================================================
            throw e;

        } catch (Exception e) {
            // =====================================================
            // ERROS INESPERADOS → 500
            // =====================================================
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro interno ao processar CSV.");
        }
    }

    /**
     * ============================================================
     * ENDPOINT DE TESTE
     * ============================================================
     */
    @GetMapping("/teste")
    public String teste() {
        return "API funcionando";
    }
}
