import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';

import { ProfessorsListComponent } from './professors-list/professors-list.component';
import { AssignaturaInfoComponent } from './assignatures/assignatura-info/assignatura-info.component';
import { AssignaturaViewComponent } from './assignatures/assignatura-view/assignatura-view.component';

const routes: Routes = [
  { path: 'professor', component: AssignaturesListComponent, data: {perfil: 'profe'}},
    { path: 'professor/grups/:assignaturaid', component: GroupsListComponent},
    { path: 'professor/alumnes/:groupid', component: AlumnesListComponent},
  { path: 'adm', component: AssignaturesListComponent, outlet: 'leftbar', data: {perfil: 'adm'}},
  { path: 'assignatura/:assignaturaid', component: AssignaturaViewComponent, data: {perfil: 'adm'}, children: [
    { path: 'grups', component: GroupsListComponent, data: {perfil: 'adm'}, children: [
      { path: 'alumnes/:groupid', component: AlumnesListComponent}
    ]},
    { path: 'professors', component: ProfessorsListComponent, data: {perfil: 'adm'}},
    { path: 'info', component: AssignaturaInfoComponent}
  ]},
  { path: 'addassignatura', component: AssignaturaInfoComponent, data: {perfil: 'adm'}}
  // { path: 'path', component: FeatureComponent },
  // { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
