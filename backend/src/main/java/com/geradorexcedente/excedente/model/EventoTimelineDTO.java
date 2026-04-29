package com.geradorexcedente.excedente.model;

public class EventoTimelineDTO {

    private String nome;
    private String data;

    // Construtor vazio
    public EventoTimelineDTO() {
    }

    // Construtor
    public EventoTimelineDTO(String nome, String data) {
        this.nome = nome;
        this.data = data;
    }

    public String getNome() {
        return nome;
    }

    public String getData() {
        return data;
    }
}