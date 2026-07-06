package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseClienteGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idCliente;
        public String nombres;
        public String dniRuc;
        public String telefono;
        public String correo;
        public String direccion;
        public Integer idCategoriaCliente;
        public String categoriaClienteNombre;

        public Item(Integer idCliente, String nombres, String dniRuc, String telefono, String correo,
                     String direccion, Integer idCategoriaCliente, String categoriaClienteNombre) {
            this.idCliente = idCliente;
            this.nombres = nombres;
            this.dniRuc = dniRuc;
            this.telefono = telefono;
            this.correo = correo;
            this.direccion = direccion;
            this.idCategoriaCliente = idCategoriaCliente;
            this.categoriaClienteNombre = categoriaClienteNombre;
        }
    }
}
