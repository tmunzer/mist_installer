import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrgComponent } from './org/org.component';
import { SiteComponent } from './site/site.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'select', component: OrgComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'site', component: SiteComponent },
  { path: '',   redirectTo: '/login', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**',   redirectTo: '/login' }, // redirect to `first-component`
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
