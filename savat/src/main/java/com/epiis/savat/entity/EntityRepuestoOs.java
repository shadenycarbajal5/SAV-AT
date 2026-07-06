package com.epiis.savat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "repuesto_os")
@Getter
@Setter
public class EntityRepuestoOs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_repuesto_os")
    private Integer idRepuestoOs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_os")
    private EntityOrdenServicio ordenServicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private EntityProducto producto;

    @Column(name = "cantidad")
    private Integer cantidad;
}
