import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';

const routes: Routes = [
  { path: '', component: AssignaturesListComponent},
  { path: 'grups/:assignaturaid', component: GroupsListComponent},
  { path: 'alumnes/:groupid', component: AlumnesListComponent}
  // { path: 'path', component: FeatureComponent },
  // { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
