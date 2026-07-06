import { Injectable, inject } from '@angular/core';
import { Api } from '../api/api';
import {
    apiproductogetall,
    apiventagetall,
    apiordenserviciogetall,
    apiclientegetall,
    apicotizaciongetall,
    apiequipogetall
} from '../api/functions';
import { Producto, Venta, OrdenServicio, Cliente, Cotizacion, Equipo, ApiListResponse } from '../model/savat.models';

export interface AdminDashboardData {
    totalProductos: number;
    productosBajoStock: number;
    ordenesPendientes: number;
    ventasHoy: number;
    montoVentasHoy: number;
    facturasDelMes: number;
    ultimasVentas: Venta[];
    ultimasOrdenes: OrdenServicio[];
}

export interface VendedorDashboardData {
    ventasHoy: number;
    montoVentasHoy: number;
    misVentasDelMes: number;
    clientesRegistrados: number;
    cotizacionesPendientes: number;
    ultimasVentas: Venta[];
}

export interface TecnicoDashboardData {
    ordenesPendientes: number;
    ordenesEnProceso: number;
    ordenesListas: number;
    equiposRegistrados: number;
    ultimasOrdenes: OrdenServicio[];
}

function isSameDay(isoDate: string, ref: Date): boolean {
    const d = new Date(isoDate);
    return d.getFullYear() === ref.getFullYear()
        && d.getMonth() === ref.getMonth()
        && d.getDate() === ref.getDate();
}

function isSameMonth(isoDate: string, ref: Date): boolean {
    const d = new Date(isoDate);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

    private api = inject(Api);

    async getAdminDashboard(): Promise<AdminDashboardData> {
        const [productosResp, ventasResp, ordenesResp] = await Promise.all([
            this.api.invoke<any, ApiListResponse<Producto>>(apiproductogetall),
            this.api.invoke<any, ApiListResponse<Venta>>(apiventagetall),
            this.api.invoke<any, ApiListResponse<OrdenServicio>>(apiordenserviciogetall)
        ]);

        const productos = productosResp?.data ?? [];
        const ventas     = ventasResp?.data ?? [];
        const ordenes    = ordenesResp?.data ?? [];

        const hoy = new Date();
        const ventasHoyList = ventas.filter(v => isSameDay(v.fecha, hoy));
        const ordenesPendientes = ordenes.filter(o =>
            o.estado === 'RECIBIDO' || o.estado === 'DIAGNOSTICO' || o.estado === 'REPARACION'
        );

        return {
            totalProductos: productos.length,
            productosBajoStock: productos.filter(p => (p.stock ?? 0) <= (p.stockMinimo ?? 0)).length,
            ordenesPendientes: ordenesPendientes.length,
            ventasHoy: ventasHoyList.length,
            montoVentasHoy: ventasHoyList.reduce((sum, v) => sum + (v.total ?? 0), 0),
            facturasDelMes: ventas.filter(v => isSameMonth(v.fecha, hoy)).length,
            ultimasVentas: [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5),
            ultimasOrdenes: [...ordenes].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso)).slice(0, 5)
        };
    }

    async getVendedorDashboard(): Promise<VendedorDashboardData> {
        const [ventasResp, clientesResp, cotizacionesResp] = await Promise.all([
            this.api.invoke<any, ApiListResponse<Venta>>(apiventagetall),
            this.api.invoke<any, ApiListResponse<Cliente>>(apiclientegetall),
            this.api.invoke<any, ApiListResponse<Cotizacion>>(apicotizaciongetall)
        ]);

        const ventas       = ventasResp?.data ?? [];
        const clientes      = clientesResp?.data ?? [];
        const cotizaciones  = cotizacionesResp?.data ?? [];

        const hoy = new Date();
        const ventasHoyList = ventas.filter(v => isSameDay(v.fecha, hoy));

        return {
            ventasHoy: ventasHoyList.length,
            montoVentasHoy: ventasHoyList.reduce((sum, v) => sum + (v.total ?? 0), 0),
            misVentasDelMes: ventas.filter(v => isSameMonth(v.fecha, hoy)).length,
            clientesRegistrados: clientes.length,
            cotizacionesPendientes: cotizaciones.filter(c => c.estado === 'PENDIENTE').length,
            ultimasVentas: [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
        };
    }

    async getTecnicoDashboard(): Promise<TecnicoDashboardData> {
        const [ordenesResp, equiposResp] = await Promise.all([
            this.api.invoke<any, ApiListResponse<OrdenServicio>>(apiordenserviciogetall),
            this.api.invoke<any, ApiListResponse<Equipo>>(apiequipogetall)
        ]);

        const ordenes = ordenesResp?.data ?? [];
        const equipos  = equiposResp?.data ?? [];

        return {
            ordenesPendientes: ordenes.filter(o => o.estado === 'RECIBIDO' || o.estado === 'DIAGNOSTICO').length,
            ordenesEnProceso: ordenes.filter(o => o.estado === 'REPARACION').length,
            ordenesListas: ordenes.filter(o => o.estado === 'LISTO').length,
            equiposRegistrados: equipos.length,
            ultimasOrdenes: [...ordenes].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso)).slice(0, 5)
        };
    }
}
