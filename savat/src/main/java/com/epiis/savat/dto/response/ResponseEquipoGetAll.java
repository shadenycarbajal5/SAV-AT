package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseEquipoGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idEquipo;
        public String marca;
        public String modelo;
        public String numeroSerie;

        public Item(Integer idEquipo, String marca, String modelo, String numeroSerie) {
            this.idEquipo = idEquipo;
            this.marca = marca;
            this.modelo = modelo;
            this.numeroSerie = numeroSerie;
        }
    }
}
