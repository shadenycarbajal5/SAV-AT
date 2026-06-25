package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseProveedorGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idProveedor;
        public String nombre;
        public String ruc;
        public String telefono;
        public String correo;
        public String direccion;

        public Item(Integer idProveedor, String nombre, String ruc, String telefono, String correo, String direccion) {
            this.idProveedor = idProveedor;
            this.nombre = nombre;
            this.ruc = ruc;
            this.telefono = telefono;
            this.correo = correo;
            this.direccion = direccion;
        }
    }
}
