package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseCategoriaClienteGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idCategoriaCliente;
        public String nombre;

        public Item(Integer idCategoriaCliente, String nombre) {
            this.idCategoriaCliente = idCategoriaCliente;
            this.nombre = nombre;
        }
    }
}
