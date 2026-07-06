package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestMovimientoCaja;
import com.epiis.savat.dto.response.ResponseMovimientoCajaGetAll;
import com.epiis.savat.dto.response.ResponseMovimientoCajaInsert;
import com.epiis.savat.entity.EntityCaja;
import com.epiis.savat.entity.EntityMovimientoCaja;
import com.epiis.savat.repository.RepositoryCaja;
import com.epiis.savat.repository.RepositoryMovimientoCaja;

@Service
public class BusinessMovimientoCaja {

    private final RepositoryMovimientoCaja repository;
    private final RepositoryCaja repositoryCaja;

    public BusinessMovimientoCaja(RepositoryMovimientoCaja repository, RepositoryCaja repositoryCaja) {
        this.repository = repository;
        this.repositoryCaja = repositoryCaja;
    }

    public ResponseMovimientoCajaGetAll getByCaja(Integer idCaja) {
        ResponseMovimientoCajaGetAll response = new ResponseMovimientoCajaGetAll();
        response.data = repository.findByCaja(idCaja).stream()
                .map(m -> new ResponseMovimientoCajaGetAll.Item(
                        m.getIdMovimiento(), m.getFecha(),
                        m.getTipo() != null ? m.getTipo().name() : null,
                        m.getDescripcion(), m.getMonto(), m.getCaja().getIdCaja()))
                .toList();
        response.success();
        return response;
    }

    public ResponseMovimientoCajaInsert insert(RequestMovimientoCaja request) {
        ResponseMovimientoCajaInsert response = new ResponseMovimientoCajaInsert();

        var optCaja = repositoryCaja.findById(request.getIdCaja());
        if (optCaja.isEmpty()) {
            response.listMessage.add("La caja indicada no existe.");
            return response;
        }
        EntityCaja caja = optCaja.get();

        if (caja.getFechaCierre() != null) {
            response.listMessage.add("No se pueden registrar movimientos en una caja cerrada.");
            return response;
        }

        EntityMovimientoCaja.Tipo tipo;
        try {
            tipo = EntityMovimientoCaja.Tipo.valueOf(request.getTipo());
        } catch (IllegalArgumentException ex) {
            response.listMessage.add("El tipo de movimiento debe ser INGRESO o EGRESO.");
            return response;
        }

        EntityMovimientoCaja entity = new EntityMovimientoCaja();
        entity.setCaja(caja);
        entity.setTipo(tipo);
        entity.setDescripcion(request.getDescripcion());
        entity.setMonto(request.getMonto());
        repository.save(entity);

        response.idMovimiento = entity.getIdMovimiento();
        response.success();
        response.listMessage.add("Movimiento de caja registrado correctamente.");
        return response;
    }
}
