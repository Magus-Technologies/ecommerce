import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'verify-email',
    component: () => import('./pages/email-verification/email-verification.component').then(m => m.EmailVerificationComponent),
    renderMode: RenderMode.Server, // Render this route on the server
  }
];
