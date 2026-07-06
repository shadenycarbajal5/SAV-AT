import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { apiequipogetall } from '../../api/functions';
import { AuthService } from '../../service/auth.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface EquipoItem {
    idEquipo: number;
    marca: string | null;
    modelo: string | null;
    numeroSerie: string | null;
}

@Component({
    selector: 'app-equipos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './equipos.html',
    styleUrl: './equipos.css'
})
export class Equipos implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;

    // ── Estado ──────────────────────────────────────────────────────────────
    loading     = signal(true);
    equipos     = signal<EquipoItem[]>([]);
    searchQuery = signal('');

    // ── Filtro ───────────────────────────────────────────────────────────────
    equiposFiltrados = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.equipos();
        return this.equipos().filter(e =>
            (e.marca ?? '').toLowerCase().includes(q) ||
            (e.modelo ?? '').toLowerCase().includes(q) ||
            (e.numeroSerie ?? '').toLowerCase().includes(q)
        );
    });

    // ── KPIs ─────────────────────────────────────────────────────────────────
    get totalEquipos(): number { return this.equipos().length; }

    get marcasUnicas(): number {
        return new Set(this.equipos().map(e => e.marca).filter(Boolean)).size;
    }

    get equiposSinSerie(): number {
        return this.equipos().filter(e => !e.numeroSerie).length;
    }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await this.loadEquipos();
    }

    async loadEquipos(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiequipogetall);
            this.equipos.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los equipos.' });
        } finally {
            this.loading.set(false);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    marcaIcon(marca: string | null): string {
        const m = (marca ?? '').toLowerCase();
        if (m.includes('hp'))     return '🖥️';
        if (m.includes('dell'))   return '💻';
        if (m.includes('lenovo')) return '💻';
        if (m.includes('apple') || m.includes('mac')) return '🍎';
        if (m.includes('samsung')) return '📱';
        if (m.includes('asus'))   return '💻';
        if (m.includes('acer'))   return '💻';
        return '🖱️';
    }
}
