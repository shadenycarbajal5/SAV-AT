import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminDashboardData } from '../../../service/dashboard.service';

@Component({
    selector: 'app-dashboard-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-admin.html',
    styleUrl: '../dashboard-shared.css'
})
export class DashboardAdmin implements OnInit {

    private dashboardService = inject(DashboardService);

    loading = signal(true);
    error   = signal('');
    data    = signal<AdminDashboardData | null>(null);

    async ngOnInit(): Promise<void> {
        try {
            const result = await this.dashboardService.getAdminDashboard();
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
}
