package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseRolGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idRol;
        public String nombre;

        public Item(Integer idRol, String nombre) {
            this.idRol = idRol;
            this.nombre = nombre;
        }
    }
}
