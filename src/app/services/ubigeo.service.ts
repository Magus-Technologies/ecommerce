// src/app/services/ubigeo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Departamento {
  id: string;
  nombre: string;
  id_ubigeo: string;
}

export interface Provincia {
  id: string;
  nombre: string;
  id_ubigeo: string;
}

export interface Distrito {
  id: string;
  nombre: string;
  id_ubigeo: string;
}

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.baseUrl}/departamentos`);
  }

  getProvincias(departamentoId: string): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.baseUrl}/provincias/${departamentoId}`);
  }

  getDistritos(departamentoId: string, provinciaId: string): Observable<Distrito[]> {
    return this.http.get<Distrito[]>(`${this.baseUrl}/distritos/${departamentoId}/${provinciaId}`);
  }
}
