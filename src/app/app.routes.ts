import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/main-layouts/layout/layout.component';
import { SecondlayoutComponent } from './layouts/alt-layouts/secondlayout/secondlayout.component';
import { IndexComponent } from './pages/index/index.component';
import { BlogComponent } from './pages/blog/blog.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
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
                title: 'Vendor'
            },
            {
                path: 'vendor-details',
                component: VendorDetailsComponent,
                title: 'Vendor Details'
            },
            {
                path: 'blog',
                component: BlogComponent,
                title: 'Blog',
            },
            {
                path: 'contact',
                component: ContactComponent,
                title: 'Contact'
            },
            {
                path: 'blog-details',
                component: BlogDetailsComponent,
                title: 'Blog Details'
            },
            {
                path: 'vendor-two',
                component: VendorTwoComponent,
                title: 'Vendor Details'
            },
            {
                path: 'vendor-two-details',
                component: VendorTwoDetailsComponent,
                title: 'Vendor Two details'
            },
            {
                path: 'cart',
                component: CartComponent,
                title: 'Cart'
            },
            {
                path: 'wishlist',
                component: WishlistComponent,
                title: 'Wishlist'
            },
            {
                path: 'checkout',
                component: CheckoutComponent,
                title: 'Checkout'
            },
            {
                path: 'become-seller',
                component: BecomeSellerComponent,
                title: 'Become Seller'
            },
            {
                path: 'account',
                component: AccountComponent,
                title: 'Account'
            },
            {
                path: 'shop',
                component: ShopComponent,
                title: 'Shop'
            },
            {
                path: 'product-details',
                component: ProductDetailsComponent,
                title: 'Product Details'
            },
            {
                path: 'product-details-two',
                component: ProductDetailsTwoComponent,
                title: 'Product Details Two'
            },
            {
                path: 'index-two',
                component: IndexTwoComponent,
                title: 'Index Two'
            },
            {
                path: 'index-three',
                component: IndexThreeComponent,
                title: 'Index Three'
            },
            { path: 'dashboard', component: DashboardComponent },
        ]

    },

    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Ecommerce'
    },

    {
        path: '',
        component: SecondlayoutComponent,
        children: [

        ]
    }
];
