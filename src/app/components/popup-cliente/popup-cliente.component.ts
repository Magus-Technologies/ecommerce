import { Component, EventEmitter, Input, Output, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Popup } from '../../models/popup.model';
import { PopupsService } from '../../services/popups.service';

@Component({
  selector: 'app-popup-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-cliente.component.html',
  styleUrls: ['./popup-cliente.component.scss']
})
export class PopupClienteComponent implements OnInit, OnDestroy {
  @Input() popup!: Popup;
  @Output() cerrar = new EventEmitter<void>();
  @Output() visto = new EventEmitter<void>();

  imagenUrl = computed(() => this.popupsService.obtenerUrlImagen((this.popup as any)?.imagen_popup_url || (this.popup as any)?.imagen_popup));

  constructor(private popupsService: PopupsService) {}

  onClose(): void {
    this.cerrar.emit();
  }

  onView(): void {
    this.visto.emit();
  }

  private autoCloseTimer: any;

  ngOnInit(): void {
    const secs = (this.popup as any)?.auto_cerrar_segundos;
    if (secs && secs > 0) {
      this.autoCloseTimer = setTimeout(() => this.onClose(), secs * 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
  }
}


