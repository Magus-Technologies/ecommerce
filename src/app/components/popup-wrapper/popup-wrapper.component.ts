import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PopupsService } from '../../services/popups.service';
import { Popup } from '../../models/popup.model';
import { PopupClienteComponent } from '../popup-cliente/popup-cliente.component';
import { environment } from '../../../environments/environment';

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
  private triedAllSegment = false;

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
    const obs = isCliente
      ? this.popupsService.obtenerPopupsActivos()
      : this.popupsService.obtenerPopupsPublicosActivos('no_registrados');

    obs.subscribe({
      next: (resp) => this.renderRespuesta(resp),
      error: (err) => {
        // Fallback: si falla el endpoint de cliente con 401, intentar público
        if (isCliente && err?.status === 401) {
          this.popupsService.obtenerPopupsPublicosActivos('no_registrados').subscribe({
            next: (resp2) => this.renderRespuesta(resp2),
            error: (err2) => {}
          });
          return;
        }
      }
    });
  }

  private renderRespuesta(resp: any): void {
    const data: any = resp?.data as any;
    const lista: Popup[] = (data?.popups_activos || data?.popups || []) as Popup[];
    if (Array.isArray(lista) && lista.length > 0) {
      this.popups.set(lista);
      this.visible.set(true);
    } else {
      // Fallback de desarrollo: si no hay popups para 'no_registrados', probar 'all' una sola vez
      if (!environment.production && !this.auth.isCliente() && !this.triedAllSegment) {
        this.triedAllSegment = true;
        this.popupsService.obtenerPopupsPublicosActivos('all').subscribe({
          next: (resp2) => this.renderRespuesta(resp2),
          error: () => this.visible.set(false)
        });
        return;
      }
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


