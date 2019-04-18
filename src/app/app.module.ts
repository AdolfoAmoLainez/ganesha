import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { AssignaturesListComponent } from './assignatures/assignatures-list/assignatures-list.component';
import { HeaderComponent } from './header/header.component';
import { GroupsListComponent } from './groups-list/groups-list.component';

import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import { AlumnesListComponent } from './alumnes-list/alumnes-list.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    AssignaturesListComponent,
    HeaderComponent,
    GroupsListComponent,
    AlumnesListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModalModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
