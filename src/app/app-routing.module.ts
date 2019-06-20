import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';

import { ProfessorsListComponent } from './professors-list/professors-list.component';
import { AssignaturaInfoComponent } from './assignatures/assignatura-info/assignatura-info.component';
import { AssignaturaViewComponent } from './assignatures/assignatura-view/assignatura-view.component';
import { UsuarisListComponent } from './usuaris/usuaris-list/usuaris-list.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminviewComponent } from './adminview/adminview.component';

const routes: Routes = [
  {path: '', redirectTo:'/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  { path: 'professor', component: AssignaturesListComponent, data: {perfil: 'professor'}},
    { path: 'professor/grups/:assignaturaid', component: GroupsListComponent},
    { path: 'professor/alumnes/:grupid', component: AlumnesListComponent},
  { path: 'adm', component: AdminviewComponent, children: [
    { path: 'assignatura/:assignaturaid', component: AssignaturaViewComponent, data: {perfil: 'adm'}, children: [
      { path: 'grups', component: GroupsListComponent, data: {perfil: 'adm'}, children: [
        { path: 'alumnes/:grupid', component: AlumnesListComponent}
      ]},
      { path: 'professors', component: ProfessorsListComponent, data: {perfil: 'adm'}},
      { path: 'info', component: AssignaturaInfoComponent}
    ]},
    { path: 'addassignatura', component: AssignaturaInfoComponent, data: {perfil: 'adm'}},
    {
      path: 'usuaris', component: UsuarisListComponent
    }
  ]}
  // { path: 'path', component: FeatureComponent },
  // { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
