import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PopupsService } from '../../services/popups.service';
import { Popup } from '../../models/popup.model';
import { PopupClienteComponent } from '../popup-cliente/popup-cliente.component';

@Component({
  selector: 'app-popup-wrapper',
  standalone: true,
  imports: [CommonModule, PopupClienteComponent],
  templateUrl: './popup-wrapper.component.html',
  styleUrls: ['./popup-wrapper.component.scss']
})
export class PopupWrapperComponent implements OnInit, OnDestroy {
  popups = signal<Popup[]>([]);
  visible = signal<boolean>(false);

  private loadTimeout?: any;

  constructor(
    private auth: AuthService,
    private popupsService: PopupsService
  ) {}

  ngOnInit(): void {
    // Retrasar ligeramente para no bloquear la carga inicial
    this.loadTimeout = setTimeout(() => this.cargarPopups(), 300);
  }

  ngOnDestroy(): void {
    if (this.loadTimeout) clearTimeout(this.loadTimeout);
  }

  private cargarPopups(): void {
    const isCliente = this.auth.isCliente();
    const userType = this.auth.getUserType?.() as any;
    const hasToken = !!this.auth.getToken?.();
    console.log('[Popups] isCliente:', isCliente, '| user_type:', userType, '| hasToken:', hasToken);
    const obs = isCliente
      ? this.popupsService.obtenerPopupsActivos()
      : this.popupsService.obtenerPopupsPublicosActivos();

    obs.subscribe({
      next: (resp) => this.renderRespuesta(resp),
      error: (err) => {
        // Fallback: si falla el endpoint de cliente con 401, intentar público
        if (isCliente && err?.status === 401) {
          this.popupsService.obtenerPopupsPublicosActivos().subscribe({
            next: (resp2) => this.renderRespuesta(resp2),
            error: (err2) => console.warn('No se pudieron cargar popups públicos:', err2)
          });
          return;
        }
        console.warn('No se pudieron cargar popups:', err);
      }
    });
  }

  private renderRespuesta(resp: any): void {
    const data: any = resp?.data as any;
    const lista: Popup[] = (data?.popups_activos || data?.popups || []) as Popup[];
    console.log('[Popups] Respuesta cruda:', resp);
    console.log('[Popups] data:', data);
    console.log('[Popups] lista recibida (length):', Array.isArray(lista) ? lista.length : 'no-array');
    if (Array.isArray(lista) && lista.length > 0) {
      this.popups.set(lista);
      this.visible.set(true);
    } else {
      this.visible.set(false);
    }
  }

  onCerrar(popup: Popup): void {
    this.popupsService.cerrarPopup(popup.id).subscribe({
      next: () => this.removerPopup(popup.id),
      error: () => this.removerPopup(popup.id)
    });
  }

  onVisto(popup: Popup): void {
    this.popupsService.marcarPopupVisto(popup.id).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private removerPopup(id: number): void {
    const restantes = this.popups().filter(p => p.id !== id);
    this.popups.set(restantes);
    if (restantes.length === 0) this.visible.set(false);
  }
}


