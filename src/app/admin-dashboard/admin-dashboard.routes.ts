import { Routes } from "@angular/router";
import { HomePage } from "@store-front/pages/home-page/home-page";
import { AdminDashboardLayout } from "./layouts/admin-dashboard-layout/admin-dashboard-layout";
import { ProductAdminPage } from "./pages/product-admin-page/product-admin-page";
import { ProductsAdminPage } from "./pages/products-admin-page/products-admin-page";

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayout,
    children: [
      {
        path: 'products/:id',
        component: ProductAdminPage
      },
      {
        path: 'products',
        component: ProductsAdminPage
      },
      {
        path: 'store',
        component: HomePage
      },
      {
        path: '**',
        redirectTo: 'products'
      }
    ]
  }
];

export default adminDashboardRoutes;