package com.geradorexcedente.excedente.model;

import java.util.List;

/**
 * ==========================================================
 * DTO DE RESULTADO
 * ==========================================================
 *
 * Transporta o resultado final do processamento do CSV
 * para o frontend.
 *
 * Estrutura JSON retornada pela API:
 *
 * {
 * "placa": "ABC1234",
 * "total": 1500,
 * "eventos": [],
 * "dataInicio": "01/01/2025 08:00",
 * "dataFim": "01/01/2025 18:00",
 * "nomeArquivo": "telemetria.csv"
 * }
 */
public class ResultadoDTO {

    // ===============================
    // DADOS PRINCIPAIS
    // ===============================

    private String placa;
    private int total;
    private List<EventoDTO> eventos;

    // ===============================
    // METADADOS
    // ===============================

    private String dataInicio;
    private String dataFim;
    private String nomeArquivo;

    private String intervaloTransmissao;

    // =====================================
    private List<EventoTimelineDTO> eventosTimeline;

    /**
     * ==========================================================
     * CONSTRUTOR VAZIO
     * ==========================================================
     *
     * Necessário para serialização JSON
     */
    public ResultadoDTO() {
    }

    /**
     * ==========================================================
     * CONSTRUTOR COMPLETO
     * ==========================================================
     */

    public ResultadoDTO(
            String placa,
            int total,
            String intervaloTransmissao,
            List<EventoDTO> eventos,
            List<EventoTimelineDTO> eventosTimeline, // 👈 NOVO
            String dataInicio,
            String dataFim,
            String nomeArquivo) {

        this.placa = placa;
        this.total = total;
        this.intervaloTransmissao = intervaloTransmissao;
        this.eventos = eventos;
        this.eventosTimeline = eventosTimeline; // 👈 IMPORTANTE
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.nomeArquivo = nomeArquivo;
    }

    // ===============================
    // GETTERS
    // ===============================

    public String getPlaca() {
        return placa;
    }

    public int getTotal() {
        return total;
    }

    public String getIntervaloTransmissao() {
        return intervaloTransmissao;
    }

    public List<EventoDTO> getEventos() {
        return eventos;
    }

    public List<EventoTimelineDTO> getEventosTimeline() {
        return eventosTimeline;
    }

    public String getDataInicio() {
        return dataInicio;
    }

    public String getDataFim() {
        return dataFim;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    /**
     * ==========================================================
     * toString()
     * ==========================================================
     */

    @Override
    public String toString() {
        return "ResultadoDTO{" +
                "placa='" + placa + '\'' +
                ", total=" + total +
                ", eventos=" + eventos +
                ", dataInicio='" + dataInicio + '\'' +
                ", dataFim='" + dataFim + '\'' +
                ", nomeArquivo='" + nomeArquivo + '\'' +
                '}';
    }
}