import { Routes } from '@angular/router';
import { RecompensasGestionComponent } from './recompensas-gestion/recompensas-gestion.component';

export const recompensasRoutes: Routes = [
  {
    path: '',
    component: RecompensasGestionComponent,
    data: {
      title: 'Gestión de Recompensas',
      breadcrumb: 'Recompensas'
    }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./recompensas-analytics/recompensas-analytics.component')
      .then(m => m.RecompensasAnalyticsComponent),
    data: {
      title: 'Analytics de Recompensas',
      breadcrumb: 'Analytics'
    }
  },
  {
    path: 'segmentos',
    loadComponent: () => import('./recompensas-segmentos/recompensas-segmentos.component')
      .then(m => m.RecompensasSegmentosComponent),
    data: {
      title: 'Segmentación de Clientes',
      breadcrumb: 'Segmentos'
    }
  },
  {
    path: 'productos',
    loadComponent: () => import('./recompensas-productos/recompensas-productos.component')
      .then(m => m.RecompensasProductosComponent),
    data: {
      title: 'Configuración de Productos',
      breadcrumb: 'Productos'
    }
  },
  {
    path: 'puntos',
    loadComponent: () => import('./recompensas-puntos/recompensas-puntos.component')
      .then(m => m.RecompensasPuntosComponent),
    data: {
      title: 'Configuración de Puntos',
      breadcrumb: 'Puntos'
    }
  },
  {
    path: 'descuentos',
    loadComponent: () => import('./recompensas-descuentos/recompensas-descuentos.component')
      .then(m => m.RecompensasDescuentosComponent),
    data: {
      title: 'Configuración de Descuentos',
      breadcrumb: 'Descuentos'
    }
  },
  {
    path: 'envios',
    loadComponent: () => import('./recompensas-envios/recompensas-envios.component')
      .then(m => m.RecompensasEnviosComponent),
    data: {
      title: 'Configuración de Envíos',
      breadcrumb: 'Envíos'
    }
  },
  {
    path: 'regalos',
    loadComponent: () => import('./recompensas-regalos/recompensas-regalos.component')
      .then(m => m.RecompensasRegalosComponent),
    data: {
      title: 'Configuración de Regalos',
      breadcrumb: 'Regalos'
    }
  }
];
