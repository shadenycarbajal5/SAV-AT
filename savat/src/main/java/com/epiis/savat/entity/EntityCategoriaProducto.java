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
@Table(name = "categoria_producto")
@Getter
@Setter
public class EntityCategoriaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_producto")
    private Integer idCategoriaProducto;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;
}
