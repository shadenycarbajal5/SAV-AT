import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, TecnicoDashboardData } from '../../../service/dashboard.service';

@Component({
    selector: 'app-dashboard-tecnico',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-tecnico.html',
    styleUrl: '../dashboard-shared.css'
})
export class DashboardTecnico implements OnInit {

    private dashboardService = inject(DashboardService);

    loading = signal(true);
    error   = signal('');
    data    = signal<TecnicoDashboardData | null>(null);

    async ngOnInit(): Promise<void> {
        try {
            const result = await this.dashboardService.getTecnicoDashboard();
            this.data.set(result);
        } catch {
            this.error.set('No se pudo cargar la información del dashboard.');
        } finally {
            this.loading.set(false);
        }
    }

    estadoLabel(estado: string | null): string {
        const map: Record<string, string> = {
            RECIBIDO: 'Recibido',
            DIAGNOSTICO: 'Diagnóstico',
            REPARACION: 'En reparación',
            LISTO: 'Listo',
            ENTREGADO: 'Entregado',
            CANCELADO: 'Cancelado'
        };
        return estado ? (map[estado] ?? estado) : '—';
    }

    estadoBadgeClass(estado: string | null): string {
        switch (estado) {
            case 'RECIBIDO':
            case 'DIAGNOSTICO': return 'badge-orange';
            case 'REPARACION':  return 'badge-blue';
            case 'LISTO':       return 'badge-green';
            case 'ENTREGADO':   return 'badge-gray';
            case 'CANCELADO':   return 'badge-red';
            default:            return 'badge-gray';
        }
    }
}
