import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { HeaderComponent } from './header/header.component';
import { GroupsListComponent } from './groups/groups-list/groups-list.component';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';
import { AppRoutingModule } from './app-routing.module';
import { DataBaseService } from './shared/database.service';
import { ProfessorsListComponent } from './professors-list/professors-list.component';
import { AssignaturaInfoComponent } from './assignatures/assignatura-info/assignatura-info.component';
import { AssignaturaViewComponent } from './assignatures/assignatura-view/assignatura-view.component';
import { MymodalyesnoComponent } from './shared/mymodalyesno/mymodalyesno.component';
import { UsuarisListComponent } from './usuaris/usuaris-list/usuaris-list.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth/auth.service';
import { AdminviewComponent } from './adminview/adminview.component';


import {NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { MymodalwaitComponent } from './shared/mymodalwait/mymodalwait.component';
import { GroupEditModalComponent } from './groups/group-edit-modal/group-edit-modal.component';
import { ProfeviewComponent } from './profeview/profeview.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LogsviewComponent } from './logs/logsview/logsview.component';
import { ErrorInterceptor } from './shared/httperror.interceptor';
import { AluviewComponent } from './aluview/aluview.component';

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
    LoginComponent,
    AdminviewComponent,
    MymodalwaitComponent,
    GroupEditModalComponent,
    ProfeviewComponent,
    LogsviewComponent,
    AluviewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModalModule,
    NgbAccordionModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
      tapToDismiss: true,
      newestOnTop: true
    }),
    NgbModule,
    FontAwesomeModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              DataBaseService,
              AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {

  constructor() {
  }

 }
