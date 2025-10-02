import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { RecompensasPopupsGlobalComponent } from './recompensas-popups-global/recompensas-popups-global.component';
import { RecompensasPopupsListComponent } from './recompensas-popups-list/recompensas-popups-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: RecompensasDashboardComponent,
    data: { 
      title: 'Dashboard de Recompensas',
      breadcrumb: 'Dashboard'
    }
  },
  { 
    path: 'popups', 
    component: RecompensasPopupsGlobalComponent,
    data: { 
      title: 'Gestión de Popups',
      breadcrumb: 'Popups'
    }
  },
  { 
    path: 'popups/todos', 
    component: RecompensasPopupsListComponent,
    data: { 
      title: 'Todos los Popups',
      breadcrumb: 'Todos los Popups'
    }
  },
  { 
    path: 'lista', 
    component: RecompensasListSimpleComponent,
    data: { 
      title: 'Lista de Recompensas',
      breadcrumb: 'Lista'
    }
  },
  { 
    path: 'crear', 
    component: RecompensasWizardComponent,
    data: { 
      title: 'Crear Recompensa',
      breadcrumb: 'Crear'
    }
  },
  { 
    path: 'editar/:id', 
    component: RecompensasWizardComponent,
    data: { 
      title: 'Editar Recompensa',
      breadcrumb: 'Editar'
    }
  },
  { 
    path: 'detalle/:id', 
    component: RecompensasDetalleComponent,
    data: { 
      title: 'Detalle de Recompensa',
      breadcrumb: 'Detalle'
    }
  },
  { 
    path: 'analytics', 
    component: RecompensasAnalyticsComponent,
    data: { 
      title: 'Analytics de Recompensas',
      breadcrumb: 'Analytics'
    }
  },
  { 
    path: 'auditoria', 
    component: RecompensasAuditoriaComponent,
    data: { 
      title: 'Auditoría de Recompensas',
      breadcrumb: 'Auditoría'
    }
  },
  // ===== SUBMÓDULOS DE CONFIGURACIÓN =====
  { 
    path: ':id/segmentos', 
    component: RecompensasSegmentosClientesComponent,
    data: { 
      title: 'Segmentos y Clientes',
      breadcrumb: 'Segmentos'
    }
  },
  { 
    path: ':id/productos', 
    component: RecompensasProductosCategoriasComponent,
    data: { 
      title: 'Productos y Categorías',
      breadcrumb: 'Productos'
    }
  },
  { 
    path: ':id/puntos', 
    component: RecompensasConfiguracionPuntosComponent,
    data: { 
      title: 'Configuración de Puntos',
      breadcrumb: 'Puntos'
    }
  },
  { 
    path: ':id/descuentos', 
    component: RecompensasConfiguracionDescuentosComponent,
    data: { 
      title: 'Configuración de Descuentos',
      breadcrumb: 'Descuentos'
    }
  },
  { 
    path: ':id/envios', 
    component: RecompensasConfiguracionEnviosComponent,
    data: { 
      title: 'Configuración de Envíos',
      breadcrumb: 'Envíos'
    }
  },
  { 
    path: ':id/regalos', 
    component: RecompensasConfiguracionRegalosComponent,
    data: { 
      title: 'Configuración de Regalos',
      breadcrumb: 'Regalos'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecompensasRoutingModule { }
