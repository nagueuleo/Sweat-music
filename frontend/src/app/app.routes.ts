import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "landing",
    loadComponent: () =>
      import("./features/landing/landing.component").then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "home",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "search",
    loadComponent: () =>
      import("./features/search/search.component").then(
        (m) => m.SearchComponent
      ),
  },
  {
    path: "library",
    loadComponent: () =>
      import("./features/library/library.component").then(
        (m) => m.LibraryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "playlist/:id",
    loadComponent: () =>
      import(
        "./features/playlist/playlist-detail/playlist-detail.component"
      ).then((m) => m.PlaylistDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./features/profile/profile.component").then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadComponent: () =>
      import("./features/admin/admin-dashboard/admin-dashboard.component").then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];
