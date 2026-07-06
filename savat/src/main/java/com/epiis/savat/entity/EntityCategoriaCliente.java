package com.epiis.savat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categoria_cliente")
@Getter
@Setter
public class EntityCategoriaCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_cliente")
    private Integer idCategoriaCliente;

    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;
}
