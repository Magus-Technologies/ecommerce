import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RecompensasRoutingModule } from './recompensas-routing.module';
import { RecompensasDashboardComponent } from './recompensas-dashboard/recompensas-dashboard.component';
import { RecompensasListSimpleComponent } from './recompensas-list/recompensas-list-simple.component';
import { RecompensasWizardComponent } from './recompensas-wizard/recompensas-wizard.component';
import { RecompensasAnalyticsComponent } from './recompensas-analytics/recompensas-analytics.component';
import { RecompensasDetalleComponent } from './recompensas-detalle/recompensas-detalle.component';
import { RecompensasAuditoriaComponent } from './recompensas-auditoria/recompensas-auditoria.component';
import { RecompensasConfiguracionPuntosComponent } from './recompensas-wizard/recompensas-configuracion-puntos.component';
import { RecompensasConfiguracionDescuentosComponent } from './recompensas-configuracion-descuentos/recompensas-configuracion-descuentos.component';
import { RecompensasConfiguracionEnviosComponent } from './recompensas-configuracion-envios/recompensas-configuracion-envios.component';
import { RecompensasConfiguracionRegalosComponent } from './recompensas-configuracion-regalos/recompensas-configuracion-regalos.component';
import { RecompensasProductosCategoriasComponent } from './recompensas-wizard/recompensas-productos-categorias.component';
import { RecompensasSegmentosClientesComponent } from './recompensas-wizard/recompensas-segmentos-clientes.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RecompensasRoutingModule,
    RecompensasDashboardComponent,
    RecompensasListSimpleComponent,
    RecompensasWizardComponent,
    RecompensasAnalyticsComponent,
    RecompensasDetalleComponent,
    RecompensasAuditoriaComponent,
    RecompensasConfiguracionPuntosComponent,
    RecompensasConfiguracionDescuentosComponent,
    RecompensasConfiguracionEnviosComponent,
    RecompensasConfiguracionRegalosComponent,
    RecompensasProductosCategoriasComponent,
    RecompensasSegmentosClientesComponent
  ],
  providers: []
})
export class RecompensasModule { }
