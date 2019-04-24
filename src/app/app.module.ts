import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { HeaderComponent } from './header/header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';
import { AppRoutingModule } from './app-routing.module';
import { DataBaseService } from './shared/database.service';
import { AssignaturesListAdmComponent } from './assignatures/assignatures-list-adm/assignatures-list-adm.component';


import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import { ProfessorsListComponent } from './professors-list/professors-list.component';
import { AssignaturaInfoComponent } from './assignatures/assignatura-info/assignatura-info.component';
import { AssignaturaViewComponent } from './assignatures/assignatura-view/assignatura-view.component';
import { MymodalyesnoComponent } from './shared/mymodalyesno/mymodalyesno.component';

@NgModule({
  declarations: [
    AppComponent,
    AssignaturesListComponent,
    HeaderComponent,
    GroupsListComponent,
    AlumnesListComponent,
    ProfessorsListComponent,
    AssignaturesListAdmComponent,
    AssignaturaInfoComponent,
    AssignaturaViewComponent,
    MymodalyesnoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModalModule,
    NgbAccordionModule,
    AppRoutingModule
  ],
  providers: [DataBaseService],
  bootstrap: [AppComponent],
  entryComponents: [MymodalyesnoComponent]
})
export class AppModule { }
