// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/main-layouts/layout/layout.component';
import { SecondlayoutComponent } from './layouts/alt-layouts/secondlayout/secondlayout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';

// Solo importa componentes que se cargan inmediatamente
import { IndexComponent } from './pages/index/index.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ContactComponent } from './pages/contact/contact.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { BecomeSellerComponent } from './pages/become-seller/become-seller.component';
import { AccountComponent } from './pages/account/account.component';
import { IndexTwoComponent } from './pages/index-two/index-two.component';
import { IndexThreeComponent } from './pages/index-three/index-three.component';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: IndexComponent,
        title: 'Home',
      },
      {
        path: 'blog',
        component: BlogComponent,
        title: 'Blog',
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'Contact',
      },
      {
        path: 'blog-details',
        component: BlogDetailsComponent,
        title: 'Blog Details',
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'Cart',
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        title: 'Wishlist',
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Checkout',
      },
      {
        path: 'become-seller',
        component: BecomeSellerComponent,
        title: 'Become Seller',
      },
      {
        path: 'account',
        component: AccountComponent,
        title: 'Account',
      },
      {
        path: 'index-two',
        component: IndexTwoComponent,
        title: 'Index Two',
      },
      {
        path: 'index-three',
        component: IndexThreeComponent,
        title: 'Index Three',
      },
      // ✅ Lazy Loading para Shop
      {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
        title: 'Shop'
      },
      // ✅ Lazy Loading para Vendor
      {
        path: 'vendor',
        loadComponent: () => import('./pages/vendor/vendor.component').then(m => m.VendorComponent),
        title: 'Vendor'
      },
      {
        path: 'vendor-details',
        loadComponent: () => import('./pages/vendor-details/vendor-details.component').then(m => m.VendorDetailsComponent),
        title: 'Vendor Details'
      },
      {
        path: 'vendor-two',
        loadComponent: () => import('./pages/vendor-two/vendor-two.component').then(m => m.VendorTwoComponent),
        title: 'Vendor Two'
      },
      {
        path: 'vendor-two-details',
        loadComponent: () => import('./pages/vendor-two-details/vendor-two-details.component').then(m => m.VendorTwoDetailsComponent),
        title: 'Vendor Two Details'
      },
      {
        path: 'product-details',
        loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
        title: 'Product Details'
      },
      {
        path: 'product-details-two',
        loadComponent: () => import('./pages/product-details-two/product-details-two.component').then(m => m.ProductDetailsTwoComponent),
        title: 'Product Details Two'
      }
    ],
  },
  // ✅ Lazy Loading para Dashboard
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./component/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
        title: 'Acceso Denegado',
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./component/usuarios/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent),
        title: 'Gestión de Usuarios',
        canActivate: [permissionGuard],
        data: { permission: 'usuarios.ver' }
      },
      {
        path: 'users/create',
        loadComponent: () => import('./component/user-registration/user-registration.component').then(m => m.UserRegistrationComponent),
        title: 'Crear Usuario',
        canActivate: [permissionGuard],
        data: { permission: 'usuarios.ver' }
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/dashboard/productos/productos-list/productos-list.component').then(m => m.ProductosListComponent),
        title: 'Productos',
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/dashboard/categorias/categorias-list/categorias-list.component').then(m => m.CategoriasListComponent),
        title: 'Categorías',
      },
      // Agregar después de la ruta de categorías
      {
        path: 'roles',
        loadComponent: () => import('./pages/dashboard/roles/roles-management/roles-management.component').then(m => m.RolesManagementComponent),
        title: 'Gestión de Roles',
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./component/user-registration/user-registration.component').then(m => m.UserRegistrationComponent),
        title: 'Editar Usuario',
        canActivate: [permissionGuard],
        data: { permission: 'usuarios.ver' }
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./component/user-registration/user-registration.component').then(m => m.UserRegistrationComponent),
        title: 'Ver Usuario',
        canActivate: [permissionGuard],
        data: { permission: 'usuarios.ver' }
      }
    ]
  },
  {
    path: '',
    component: SecondlayoutComponent,
    children: [],
  },
];