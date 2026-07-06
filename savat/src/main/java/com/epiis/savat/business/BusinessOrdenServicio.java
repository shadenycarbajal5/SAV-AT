package com.epiis.savat.business;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestOrdenServicio;
import com.epiis.savat.dto.response.ResponseOrdenServicioGetAll;
import com.epiis.savat.dto.response.ResponseOrdenServicioInsert;
import com.epiis.savat.entity.EntityOrdenServicio;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCliente;
import com.epiis.savat.repository.RepositoryEquipo;
import com.epiis.savat.repository.RepositoryOrdenServicio;
import com.epiis.savat.repository.RepositoryUsuario;
import com.epiis.savat.service.WhatsAppService;

@Service
public class BusinessOrdenServicio {

    private final RepositoryOrdenServicio repository;
    private final RepositoryCliente       repositoryCliente;
    private final RepositoryUsuario       repositoryUsuario;
    private final RepositoryEquipo        repositoryEquipo;
    private final WhatsAppService         whatsAppService;

    // Etiquetas legibles para cada estado
    private static final Map<String, String> ESTADO_LABEL = Map.of(
        "RECIBIDO",    "📥 Recibido",
        "DIAGNOSTICO", "🔍 En diagnóstico",
        "REPARACION",  "🔧 En reparación",
        "LISTO",       "✅ Listo para entrega",
        "ENTREGADO",   "📦 Entregado",
        "CANCELADO",   "❌ Cancelado"
    );

    public BusinessOrdenServicio(RepositoryOrdenServicio repository,
                                  RepositoryCliente repositoryCliente,
                                  RepositoryUsuario repositoryUsuario,
                                  RepositoryEquipo repositoryEquipo,
                                  WhatsAppService whatsAppService) {
        this.repository        = repository;
        this.repositoryCliente = repositoryCliente;
        this.repositoryUsuario = repositoryUsuario;
        this.repositoryEquipo  = repositoryEquipo;
        this.whatsAppService   = whatsAppService;
    }

    public ResponseOrdenServicioGetAll getAll() {
        ResponseOrdenServicioGetAll response = new ResponseOrdenServicioGetAll();
        response.data = repository.findAllWithDetails().stream()
                .map(o -> new ResponseOrdenServicioGetAll.Item(
                        o.getIdOs(), o.getFechaIngreso(), o.getFechaEntrega(), o.getDescripcionProblema(),
                        o.getEstado() != null ? o.getEstado().name() : null,
                        o.getCliente() != null ? o.getCliente().getIdCliente() : null,
                        o.getCliente() != null ? o.getCliente().getNombres() : null,
                        o.getUsuario() != null ? o.getUsuario().getIdUsuario() : null,
                        o.getUsuario() != null ? o.getUsuario().getNombres() : null,
                        o.getEquipo() != null ? o.getEquipo().getIdEquipo() : null,
                        o.getEquipo() != null ? (o.getEquipo().getMarca() + " " + o.getEquipo().getModelo()) : null))
                .toList();
        response.success();
        return response;
    }

    public ResponseOrdenServicioInsert insert(RequestOrdenServicio request) {
        ResponseOrdenServicioInsert response = new ResponseOrdenServicioInsert();

        EntityOrdenServicio entity = new EntityOrdenServicio();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        response.idOs = entity.getIdOs();
        response.success();
        response.listMessage.add("Orden de servicio registrada correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestOrdenServicio request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("La orden de servicio no existe.");
            return response;
        }

        EntityOrdenServicio entity = optEntity.get();

        // ── Guardar estado anterior antes de modificar ────────────────────────
        EntityOrdenServicio.Estado estadoAnterior = entity.getEstado();

        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        // ── Notificación WhatsApp si el estado cambió ─────────────────────────
        EntityOrdenServicio.Estado estadoNuevo = entity.getEstado();
        boolean estadoCambio = estadoNuevo != null &&
                               (estadoAnterior == null || !estadoAnterior.equals(estadoNuevo));

        if (estadoCambio && entity.getCliente() != null) {
            String telefono     = entity.getCliente().getTelefono();
            String nombreCliente = entity.getCliente().getNombres();
            String equipoDesc   = entity.getEquipo() != null
                    ? (entity.getEquipo().getMarca() + " " + entity.getEquipo().getModelo()).trim()
                    : "su equipo";
            String etiqueta = ESTADO_LABEL.getOrDefault(estadoNuevo.name(), estadoNuevo.name());

            String mensaje = construirMensaje(id, nombreCliente, equipoDesc, etiqueta);
            whatsAppService.enviarMensaje(telefono, mensaje);
        }

        response.success();
        response.listMessage.add("Orden de servicio actualizada correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("La orden de servicio no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Orden de servicio eliminada correctamente.");
        return response;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean applyRequest(EntityOrdenServicio entity, RequestOrdenServicio request, List<String> messages) {
        entity.setFechaEntrega(request.getFechaEntrega());
        entity.setDescripcionProblema(request.getDescripcionProblema());

        if (request.getEstado() != null) {
            try {
                entity.setEstado(EntityOrdenServicio.Estado.valueOf(request.getEstado()));
            } catch (IllegalArgumentException ex) {
                messages.add("Estado inválido. Use RECIBIDO, DIAGNOSTICO, REPARACION, LISTO, ENTREGADO o CANCELADO.");
                return false;
            }
        }

        var optCliente = repositoryCliente.findById(request.getIdCliente());
        if (optCliente.isEmpty()) {
            messages.add("El cliente indicado no existe.");
            return false;
        }
        entity.setCliente(optCliente.get());

        var optUsuario = repositoryUsuario.findById(request.getIdUsuario());
        if (optUsuario.isEmpty()) {
            messages.add("El usuario indicado no existe.");
            return false;
        }
        entity.setUsuario(optUsuario.get());

        var optEquipo = repositoryEquipo.findById(request.getIdEquipo());
        if (optEquipo.isEmpty()) {
            messages.add("El equipo indicado no existe.");
            return false;
        }
        entity.setEquipo(optEquipo.get());

        return true;
    }

    private String construirMensaje(Integer idOs, String cliente, String equipo, String estado) {
        return String.format("""
                🔧 *Aibil Technology — SAV-AT*

                Hola *%s*, te informamos que el estado de tu orden de servicio ha cambiado:

                🗂 Orden N°: *#%d*
                💻 Equipo:   *%s*
                📌 Estado:   *%s*

                Si tienes alguna consulta, comunícate con nosotros.
                ¡Gracias por elegirnos! 😊
                """, cliente, idOs, equipo, estado);
    }
}
