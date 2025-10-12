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
    const isMotorizado = this.auth.isMotorizado();
    const isAdmin = this.auth.isAdmin();
    const hasToken = !!this.auth.getToken?.();

    // Según la nueva lógica corregida:
    // - Motorizados y admins: NO ven popups (error 403)
    // - Clientes autenticados: usan endpoint de cliente
    // - Visitantes no autenticados: usan endpoint público

    // En producción: bloquear para motorizados y admins.
    // En desarrollo: permitir a admins para facilitar pruebas de popups.
    if (isMotorizado || (isAdmin && environment.production)) {
      console.log('Motorizado o admin (en producción) detectado - no se cargan popups');
      this.visible.set(false);
      return;
    }

    const obs = isCliente
      ? this.popupsService.obtenerPopupsActivos()
      : this.popupsService.obtenerPopupsPublicosActivos('no_registrados');

    obs.subscribe({
      next: (resp) => this.renderRespuesta(resp),
      error: (err) => {
        console.error('Error cargando popups:', err);
        
        // Manejo de errores según la nueva lógica:
        if (err?.status === 403) {
          if (isCliente) {
            console.log('Cliente sin acceso a popups - posible error de permisos');
          } else {
            console.log('Usuario autenticado no autorizado para popups públicos');
          }
          this.visible.set(false);
          return;
        }
        
        // Fallback: si falla el endpoint de cliente con 401, intentar público
        if (isCliente && err?.status === 401) {
          console.log('Cliente no autenticado - intentando endpoint público');
          this.popupsService.obtenerPopupsPublicosActivos('no_registrados').subscribe({
            next: (resp2) => this.renderRespuesta(resp2),
            error: (err2) => {
              console.error('Error en fallback público:', err2);
              this.visible.set(false);
            }
          });
          return;
        }
        
        this.visible.set(false);
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
      // Según la nueva lógica corregida, no hay fallbacks de segmentos
      // Los segmentos están bien definidos: 'no_registrados' para visitantes, otros para clientes
      this.visible.set(false);
    }
  }

  onCerrar(popup: Popup): void {
    this.popupsService.cerrarPopup(popup.id).subscribe({
      next: () => this.removerPopup(popup.id),
      error: (err) => {
        console.error('Error cerrando popup:', err);
        // Si es error 403, significa que el usuario no tiene permisos para cerrar popups
        // pero aún así removemos el popup del frontend para mejor UX
        if (err?.status === 403) {
          console.log('Usuario sin permisos para cerrar popup - removiendo del frontend');
        }
        this.removerPopup(popup.id);
      }
    });
  }

  onVisto(popup: Popup): void {
    this.popupsService.marcarPopupVisto(popup.id).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error marcando popup como visto:', err);
        // No es crítico si falla marcar como visto, solo logueamos el error
        if (err?.status === 403) {
          console.log('Usuario sin permisos para marcar popup como visto');
        }
      }
    });
  }

  private removerPopup(id: number): void {
    const restantes = this.popups().filter(p => p.id !== id);
    this.popups.set(restantes);
    if (restantes.length === 0) this.visible.set(false);
  }
}


