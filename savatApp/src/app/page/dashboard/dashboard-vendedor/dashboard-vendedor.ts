import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, VendedorDashboardData } from '../../../service/dashboard.service';

@Component({
    selector: 'app-dashboard-vendedor',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-vendedor.html',
    styleUrl: '../dashboard-shared.css'
})
export class DashboardVendedor implements OnInit {

    private dashboardService = inject(DashboardService);

    loading = signal(true);
    error   = signal('');
    data    = signal<VendedorDashboardData | null>(null);

    async ngOnInit(): Promise<void> {
        try {
            const result = await this.dashboardService.getVendedorDashboard();
            this.data.set(result);
        } catch {
            this.error.set('No se pudo cargar la información del dashboard.');
        } finally {
            this.loading.set(false);
        }
    }
}
