// src/app/services/cupones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cupon {
  id: number;
  codigo: string;
  titulo: string;
  tipo_descuento: string;
  valor_descuento: number;
  compra_minima?: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CuponesService {
  private cuponesSubject = new BehaviorSubject<Cupon[]>([]);
  cupones$ = this.cuponesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarCupones();
  }

  cargarCupones(): void {
    this.http.get<Cupon[]>(`${environment.apiUrl}/cupones`).subscribe(cupones => {
      this.cuponesSubject.next(cupones);
    });
  }

  agregarCupon(cupon: Cupon): Observable<Cupon> {
    return this.http.post<Cupon>(`${environment.apiUrl}/cupones`, cupon);
  }

  eliminarCupon(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cupones/${id}`);
  }

  // Método para actualizar los cupones desde el backend
  actualizarCupones(): void {
    this.cargarCupones();
  }
}
