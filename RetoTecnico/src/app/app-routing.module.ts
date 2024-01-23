import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiComponent } from './components/api/api.component';
import { InicioComponent } from './components/inicio/inicio.component';

const routes: Routes = [
{path:'', component: InicioComponent},
{path:'inicio', component: InicioComponent},
{path:'api', component: ApiComponent},
{path:'**', pathMatch: 'full', redirectTo:''}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
