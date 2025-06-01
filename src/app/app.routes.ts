  // src\app\app.routes.ts
  import { Routes } from '@angular/router';
  import { LayoutComponent } from './layouts/main-layouts/layout/layout.component';
  import { SecondlayoutComponent } from './layouts/alt-layouts/secondlayout/secondlayout.component';
  import { IndexComponent } from './pages/index/index.component';
  import { BlogComponent } from './pages/blog/blog.component';
  import { ContactComponent } from './pages/contact/contact.component';
  import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
  import { VendorComponent } from './pages/vendor/vendor.component';
  import { VendorDetailsComponent } from './pages/vendor-details/vendor-details.component';
  import { VendorTwoDetailsComponent } from './pages/vendor-two-details/vendor-two-details.component';
  import { VendorTwoComponent } from './pages/vendor-two/vendor-two.component';
  import { CartComponent } from './pages/cart/cart.component';
  import { WishlistComponent } from './pages/wishlist/wishlist.component';
  import { CheckoutComponent } from './pages/checkout/checkout.component';
  import { BecomeSellerComponent } from './pages/become-seller/become-seller.component';
  import { AccountComponent } from './pages/account/account.component';
  import { ShopComponent } from './pages/shop/shop.component';
  import { ProductDetailsComponent } from './pages/product-details/product-details.component';
  import { ProductDetailsTwoComponent } from './pages/product-details-two/product-details-two.component';
  import { IndexTwoComponent } from './pages/index-two/index-two.component';
  import { IndexThreeComponent } from './pages/index-three/index-three.component';
  import { authGuard } from './guards/auth.guard';
  import { DashboardComponent } from './pages/dashboard/dashboard.component';
  import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
  import { UsuariosListComponent } from './component/usuarios/usuarios-list/usuarios-list.component';
  import { UserRegistrationComponent } from './component/user-registration/user-registration.component';
  import { ProductosListComponent } from './pages/dashboard/productos/productos-list/productos-list.component';
  import { CategoriasListComponent } from './pages/dashboard/categorias/categorias-list/categorias-list.component';


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
          path: 'vendor',
          component: VendorComponent,
          title: 'Vendor',
        },
        {
          path: 'vendor-details',
          component: VendorDetailsComponent,
          title: 'Vendor Details',
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
          path: 'vendor-two',
          component: VendorTwoComponent,
          title: 'Vendor Details',
        },
        {
          path: 'vendor-two-details',
          component: VendorTwoDetailsComponent,
          title: 'Vendor Two details',
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
          path: 'shop',
          component: ShopComponent,
          title: 'Shop',
        },
        {
          path: 'product-details',
          component: ProductDetailsComponent,
          title: 'Product Details',
        },
        {
          path: 'product-details-two',
          component: ProductDetailsTwoComponent,
          title: 'Product Details Two',
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
      ],
    },
    {
      path: 'dashboard',
      component: DashboardLayoutComponent,
      canActivate: [authGuard],
      children: [
        {
          path: '',
          component: DashboardComponent,
          title: 'Dashboard',
        },

        {
          path: 'usuarios',                     // <-- flecha 2: ruta "usuarios" dentro de dashboard
          component: UsuariosListComponent,    // <-- flecha 3: componente para esa ruta
          title: 'Gestión de Usuarios',        // <-- flecha 4: título para esta ruta
        },
        { path: 'users/create', component: UserRegistrationComponent },
        {
          path: 'productos',
          component: ProductosListComponent,
          title: 'Productos',
        },
        
        {
          path:'categorias',
          component: CategoriasListComponent,
          title: 'Categorías',
        },
      
      
        // ← AGREGAR ESTAS RUTAS NUEVAS:
        {
          path: 'users/edit/:id',
          component: UserRegistrationComponent, // Reutilizar el mismo componente
          title: 'Editar Usuario'
        },
        {
          path: 'users/:id',
          component: UserRegistrationComponent, // O crear un componente específico para ver
          title: 'Ver Usuario'
        }
        // Aquí puedes añadir más rutas para el dashboard
      //   {
      //     path: 'pedidos',
      //     component: PedidosComponent, // Deberás crear este componente
      //     title: 'Pedidos',
      //   },
      //   {
      //     path: 'perfil',
      //     component: PerfilComponent, // Deberás crear este componente
      //     title: 'Perfil',
      //   },
      //   {
      //     path: 'configuracion',
      //     component: ConfiguracionComponent, // Deberás crear este componente
      //     title: 'Configuración',
      //   }
      ],
    },
    {
      path: '',
      component: SecondlayoutComponent,
      children: [],
    },


  ];
