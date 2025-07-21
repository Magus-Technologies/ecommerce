// src\app\services\reniec.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReniecResponse {
  success: boolean;
  dni?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  codVerifica?: number; // コード
  codVerificaLetra?: string; // コード
  message?: string;
  nombre?: string;  // Campo combinado que devuelve el backend
  razonSocial?: string; 
}


@Injectable({
  providedIn: 'root'
})
export class ReniecService {

  private baseUrl = `${environment.apiUrl}` 

  constructor(private http: HttpClient) { }

  buscarPorDni(dni: string): Observable<ReniecResponse> {
    return this.http.get<ReniecResponse>(`${this.baseUrl}/reniec/buscar/${dni}`);
  }
}
