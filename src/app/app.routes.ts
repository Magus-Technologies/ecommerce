import { Routes } from "@angular/router"
import { LayoutComponent } from "./layouts/main-layouts/layout/layout.component"
import { SecondlayoutComponent } from "./layouts/alt-layouts/secondlayout/secondlayout.component"
import { DashboardLayoutComponent } from "./layouts/dashboard-layout/dashboard-layout.component"

// Solo importa componentes que se cargan inmediatamente
import { IndexComponent } from "./pages/index/index.component"
import { BlogComponent } from "./pages/blog/blog.component"
import { ContactComponent } from "./pages/contact/contact.component"
import { BlogDetailsComponent } from "./pages/blog-details/blog-details.component"
import { CartComponent } from "./pages/cart/cart.component"
import { WishlistComponent } from "./pages/wishlist/wishlist.component"
import { CheckoutComponent } from "./pages/checkout/checkout.component"
import { BecomeSellerComponent } from "./pages/become-seller/become-seller.component"
import { AccountComponent } from "./pages/account/account.component"
import { RegisterComponent } from "./pages/register/register.component"
import { IndexTwoComponent } from "./pages/index-two/index-two.component"
import { IndexThreeComponent } from "./pages/index-three/index-three.component"
import { authGuard } from "./guards/auth.guard"
import { permissionGuard } from "./guards/permission.guard"
import { VentasComponent } from "./pages/dashboard/ventas/ventas.component"
import { VentasListComponent } from "./pages/dashboard/ventas/ventas-list.component"
import { NuevaVentaComponent } from "./pages/dashboard/ventas/nueva-venta.component"
import { EstadisticasVentasComponent } from "./pages/dashboard/ventas/estadisticas-ventas.component"

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        component: IndexComponent,
        title: "Home",
      },
      {
        path: "blog",
        component: BlogComponent,
        title: "Blog",
      },
      {
        path: "contact",
        component: ContactComponent,
        title: "Contact",
      },
      {
        path: "blog-details",
        component: BlogDetailsComponent,
        title: "Blog Details",
      },
      {
        path: "cart",
        component: CartComponent,
        title: "Cart",
      },
      {
        path: "wishlist",
        component: WishlistComponent,
        title: "Wishlist",
      },
      {
        path: "checkout",
        component: CheckoutComponent,
        title: "Checkout",
      },
      {
        path: "become-seller",
        component: BecomeSellerComponent,
        title: "Become Seller",
      },
      {
        path: "account",
        component: AccountComponent,
        title: "Account",
      },
      {
        path: "register",
        component: RegisterComponent,
        title: "Register",
      },
      {
        path: "index-two",
        component: IndexTwoComponent,
        title: "Index Two",
      },
      {
        path: "index-three",
        component: IndexThreeComponent,
        title: "Index Three",
      },
      // ✅ Lazy Loading para Shop
      {
        path: "shop",
        loadComponent: () => import("./pages/shop/shop.component").then((m) => m.ShopComponent),
        title: "Shop",
      },
      // ✅ Lazy Loading para Vendor
      {
        path: "vendor",
        loadComponent: () => import("./pages/vendor/vendor.component").then((m) => m.VendorComponent),
        title: "Vendor",
      },
      {
        path: "vendor-details",
        loadComponent: () =>
          import("./pages/vendor-details/vendor-details.component").then((m) => m.VendorDetailsComponent),
        title: "Vendor Details",
      },
      {
        path: "vendor-two",
        loadComponent: () => import("./pages/vendor-two/vendor-two.component").then((m) => m.VendorTwoComponent),
        title: "Vendor Two",
      },
      {
        path: "vendor-two-details",
        loadComponent: () =>
          import("./pages/vendor-two-details/vendor-two-details.component").then((m) => m.VendorTwoDetailsComponent),
        title: "Vendor Two Details",
      },
      {
        path: "product-details",
        loadComponent: () =>
          import("./pages/product-details/product-details.component").then((m) => m.ProductDetailsComponent),
        title: "Product Details",
      },
      {
        path: "product-details-two",
        loadComponent: () =>
          import("./pages/product-details-two/product-details-two.component").then((m) => m.ProductDetailsTwoComponent),
        title: "Product Details Two",
      },
      {
        path: "forgot-password",
        loadComponent: () => import("./pages/forgot-password/forgot-password.component").then(m => m.ForgotPasswordComponent),
        title: "Recuperar Contraseña",
      },
      {
        path: "reset-password",
        loadComponent: () => import("./pages/reset-password/reset-password.component").then(m => m.ResetPasswordComponent),
        title: "Restablecer Contraseña",
      },
      {
        path: "privacy-policy",
        loadComponent: () => import("./pages/privacy-policy/privacy-policy.component").then(m => m.PrivacyPolicyComponent),
        title: "Política de Privacidad",
      },
    ],
  },
  // ✅ Lazy Loading para Dashboard
  {
    path: "dashboard",
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        loadComponent: () => import("./pages/dashboard/dashboard.component").then((m) => m.DashboardComponent),
        title: "Dashboard",
      },
      {
        path: "access-denied",
        loadComponent: () =>
          import("./component/access-denied/access-denied.component").then((m) => m.AccessDeniedComponent),
        title: "Acceso Denegado",
      },
      {
        path: "usuarios",
        loadComponent: () =>
          import("./component/usuarios/usuarios-list/usuarios-list.component").then((m) => m.UsuariosListComponent),
        title: "Gestión de Usuarios",
        canActivate: [permissionGuard],
        data: { permission: "usuarios.ver" },
      },
      {
          path: 'horarios',
          loadComponent: () => import('./pages/dashboard/horarios/horarios.component').then(m => m.HorariosComponent),
          canActivate: [permissionGuard],
          data: { permission: 'horarios.ver' }
      },
      {
        path: "users/create",
        loadComponent: () =>
          import("./component/user-registration/user-registration.component").then((m) => m.UserRegistrationComponent),
        title: "Crear Usuario",
        canActivate: [permissionGuard],
        data: { permission: "usuarios.ver" },
      },
      // ✅ RUTAS DE ALMACÉN CORREGIDAS
      {
        path: "almacen",
        loadComponent: () => import("./pages/dashboard/almacen/almacen.component").then((m) => m.AlmacenComponent),
        title: "Gestión de Almacén",
        children: [
          {
            path: "",
            redirectTo: "productos",
            pathMatch: "full",
          },
          {
            path: "productos",
            loadComponent: () =>
              import("./pages/dashboard/almacen/productos/productos-list.component").then(
                (m) => m.ProductosListComponent,
              ),
            title: "Productos",
          },
          {
            path: "categorias",
            loadComponent: () =>
              import("./pages/dashboard/almacen/categorias/categorias-list.component").then(
                (m) => m.CategoriasListComponent,
              ),
            title: "Categorías",
          },
          {
            path: "marcas",
            loadComponent: () =>
              import("./pages/dashboard/almacen/marcas/marcas-list.component").then((m) => m.MarcasListComponent),
            title: "Marcas",
          }
        ],
      },
      {
        path: 'ventas',
        component: VentasComponent,
        children: [
          { path: '', component: VentasListComponent },
          { path: 'nueva', component: NuevaVentaComponent },
          { path: 'estadisticas', component: EstadisticasVentasComponent }
        ]
      },
      // ✅ NUEVAS RUTAS PARA OFERTAS Y CUPONES
      {
        path: "ofertas",
        loadComponent: () =>
          import("./pages/dashboard/ofertas/ofertas-list/ofertas-list.component").then((m) => m.OfertasListComponent),
        title: "Gestión de Ofertas",
        canActivate: [permissionGuard],
        data: { permission: "ofertas.ver" },
      },
      {
        path: "cupones",
        loadComponent: () =>
          import("./pages/dashboard/cupones/cupones-list/cupones-list.component").then((m) => m.CuponesListComponent),
        title: "Gestión de Cupones",
        canActivate: [permissionGuard],
        data: { permission: "cupones.ver" },
      },
      // Agregar después de la ruta de almacén
      {
        path: "roles",
        loadComponent: () =>
          import("./pages/dashboard/roles/roles-management/roles-management.component").then(
            (m) => m.RolesManagementComponent,
          ),
        title: "Gestión de Roles",
      },
      {
        path: "users/edit/:id",
        loadComponent: () =>
          import("./component/user-registration/user-registration.component").then((m) => m.UserRegistrationComponent),
        title: "Editar Usuario",
        canActivate: [permissionGuard],
        data: { permission: "usuarios.ver" },
      },
      {
        path: "users/:id",
        loadComponent: () =>
          import("./component/user-registration/user-registration.component").then((m) => m.UserRegistrationComponent),
        title: "Ver Usuario",
        canActivate: [permissionGuard],
        data: { permission: "usuarios.ver" },
      },
      {
        path: "banners",
        loadComponent: () =>
          import("./pages/dashboard/banners/banners-list/banners-list.component").then((m) => m.BannersListComponent),
        title: "Gestión de Banners",
      },
      {
        path: "banners-promocionales",
        loadComponent: () =>
          import(
            "./pages/dashboard/banners-promocionales/banners-promocionales-list/banners-promocionales-list.component"
          ).then((m) => m.BannersPromocionalesListComponent),
        title: "Banners Promocionales",
      },
      // Dentro de las rutas de dashboard, agrega:
      {
        path: 'clientes',
        loadComponent: () => import('./pages/dashboard/clientes/clientes.component').then(m => m.ClientesComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'clientes.ver' }
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./pages/dashboard/clientes/cliente-detalle/cliente-detalle.component').then(m => m.ClienteDetalleComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'clientes.show' }
      },
      {
        path: 'pedidos', // ✅ CORRECTO
        loadComponent: () => import('./component/pedidos/pedidos-list/pedidos-list.component').then(m => m.PedidosListComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'pedidos.ver' }
      },
    ],
  },
  {
    path: "",
    component: SecondlayoutComponent,
    children: [],
  },
]