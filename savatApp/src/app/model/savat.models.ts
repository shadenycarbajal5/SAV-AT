export interface Producto {
    idProducto: number;
    nombre: string;
    descripcion: string | null;
    precioVenta: number | null;
    costo: number | null;
    stock: number | null;
    stockMinimo: number | null;
    codigoBarras: string | null;
    tipoProducto: 'VENTA' | 'REPUESTO' | null;
    estado: boolean | null;
    idCategoriaProducto: number | null;
    categoriaProductoNombre: string | null;
    idProveedor: number | null;
    proveedorNombre: string | null;
}

export interface Venta {
    idVenta: number;
    fecha: string;
    subtotal: number;
    descuento: number;
    total: number;
    metodoPago: string | null;
    idCliente: number | null;
    clienteNombre: string | null;
    idUsuario: number | null;
    usuarioNombre: string | null;
}

export type EstadoOrdenServicio = 'RECIBIDO' | 'DIAGNOSTICO' | 'REPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export interface OrdenServicio {
    idOs: number;
    fechaIngreso: string;
    fechaEntrega: string | null;
    descripcionProblema: string | null;
    estado: EstadoOrdenServicio | null;
    idCliente: number | null;
    clienteNombre: string | null;
    idUsuario: number | null;
    usuarioNombre: string | null;
    idEquipo: number | null;
    equipoDescripcion: string | null;
}

export interface Cliente {
    idCliente: number;
    nombres: string;
    dniRuc: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
    idCategoriaCliente: number | null;
    categoriaClienteNombre: string | null;
}

export type EstadoCotizacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CONVERTIDA';

export interface Cotizacion {
    idCotizacion: number;
    fecha: string;
    fechaVencimiento: string | null;
    estado: EstadoCotizacion | null;
    total: number;
    idCliente: number | null;
    clienteNombre: string | null;
}

export interface Equipo {
    idEquipo: number;
    marca: string | null;
    modelo: string | null;
    numeroSerie: string | null;
}

export interface ApiListResponse<T> {
    type: string;
    listMessage: string[];
    data: T[];
}
