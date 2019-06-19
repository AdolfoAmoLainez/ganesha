import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { HeaderComponent } from './header/header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';
import { AppRoutingModule } from './app-routing.module';
import { DataBaseService } from './shared/database.service';
import { ProfessorsListComponent } from './professors-list/professors-list.component';
import { AssignaturaInfoComponent } from './assignatures/assignatura-info/assignatura-info.component';
import { AssignaturaViewComponent } from './assignatures/assignatura-view/assignatura-view.component';
import { MymodalyesnoComponent } from './shared/mymodalyesno/mymodalyesno.component';


import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import { UsuarisListComponent } from './usuaris/usuaris-list/usuaris-list.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    AssignaturesListComponent,
    HeaderComponent,
    GroupsListComponent,
    AlumnesListComponent,
    ProfessorsListComponent,
    AssignaturaInfoComponent,
    AssignaturaViewComponent,
    MymodalyesnoComponent,
    UsuarisListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModalModule,
    NgbAccordionModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [DataBaseService, AuthService],
  bootstrap: [AppComponent],
  entryComponents: [MymodalyesnoComponent]
})
export class AppModule { }
