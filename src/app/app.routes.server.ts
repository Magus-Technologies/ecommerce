import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'vendor',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'cart',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'wishlist',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'become-seller',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'account',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'shop',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'index-two',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'index-three',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'vendor-two',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'vendor-details',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'blog-details',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'vendor-two-details',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'product-details',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'product-details-two',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Server
  }
];