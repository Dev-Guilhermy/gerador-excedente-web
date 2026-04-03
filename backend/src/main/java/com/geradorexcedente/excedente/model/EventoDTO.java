package com.geradorexcedente.excedente.model;

/**
 * ==========================================================
 * DTO DE EVENTO
 * ==========================================================
 *
 * Representa um evento encontrado no CSV.
 *
 * Exemplo:
 *
 * {
 * "nome": "Ignicao Ligada",
 * "qtd": 120,
 * "percentual": 35.5
 * }
 */
public class EventoDTO {

    private String nome;
    private int qtd;
    private double percentual;
    private String comunicacao;

    /**
     * Construtor vazio
     * Necessário para algumas serializações JSON
     */
    public EventoDTO() {
    }

    /**
     * Construtor principal
     */
    public EventoDTO(String nome, int qtd, double percentual, String comunicacao) {
        this.nome = nome;
        this.qtd = qtd;
        this.percentual = percentual;
        this.comunicacao = comunicacao;
    }

    // =========================
    // GETTERS
    // =========================

    public String getNome() {
        return nome;
    }

    public int getQtd() {
        return qtd;
    }

    public double getPercentual() {
        return percentual;
    }

    public String getComunicacao() {
        return comunicacao;
    } // 🔥 NOVO

    /**
     * ==========================================================
     * toString()
     * ==========================================================
     *
     * Usado para debug e logs
     */
    @Override
    public String toString() {
        return "EventoDTO{" +
                "nome='" + nome + '\'' +
                ", qtd=" + qtd +
                ", percentual=" + percentual +
                '}';
    }
}