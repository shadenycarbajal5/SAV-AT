package com.epiis.savat.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "promocion_producto")
@Getter
@Setter
public class EntityPromocionProducto {

    @EmbeddedId
    private PromocionProductoId id = new PromocionProductoId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPromocion")
    @JoinColumn(name = "id_promocion")
    private EntityPromocion promocion;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idProducto")
    @JoinColumn(name = "id_producto")
    private EntityProducto producto;

    @Embeddable
    @Getter
    @Setter
    public static class PromocionProductoId implements Serializable {

        @Column(name = "id_promocion")
        private Integer idPromocion;

        @Column(name = "id_producto")
        private Integer idProducto;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PromocionProductoId)) return false;
            PromocionProductoId that = (PromocionProductoId) o;
            return Objects.equals(idPromocion, that.idPromocion) &&
                   Objects.equals(idProducto, that.idProducto);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idPromocion, idProducto);
        }
    }
}
