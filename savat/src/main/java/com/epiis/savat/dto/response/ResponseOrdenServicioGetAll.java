package com.epiis.savat.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseOrdenServicioGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idOs;
        public LocalDateTime fechaIngreso;
        public LocalDate fechaEntrega;
        public String descripcionProblema;
        public String estado;
        public Integer idCliente;
        public String clienteNombre;
        public Integer idUsuario;
        public String usuarioNombre;
        public Integer idEquipo;
        public String equipoDescripcion;

        public Item(Integer idOs, LocalDateTime fechaIngreso, LocalDate fechaEntrega, String descripcionProblema,
                     String estado, Integer idCliente, String clienteNombre, Integer idUsuario,
                     String usuarioNombre, Integer idEquipo, String equipoDescripcion) {
            this.idOs = idOs;
            this.fechaIngreso = fechaIngreso;
            this.fechaEntrega = fechaEntrega;
            this.descripcionProblema = descripcionProblema;
            this.estado = estado;
            this.idCliente = idCliente;
            this.clienteNombre = clienteNombre;
            this.idUsuario = idUsuario;
            this.usuarioNombre = usuarioNombre;
            this.idEquipo = idEquipo;
            this.equipoDescripcion = equipoDescripcion;
        }
    }
}
