import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { faEdit, faPlus, faPowerOff, faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-adminview',
  templateUrl: './adminview.component.html',
  styleUrls: ['./adminview.component.css']
})
export class AdminviewComponent implements OnInit {

  // Iconos
  faEdit = faEdit;
  faPlus = faPlus;
  faPowerOff = faPowerOff;
  faBars = faBars;

  viewSideBar = true;
  isNavbarCollapsed = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  onToggleSideBar() {
    this.viewSideBar = !this.viewSideBar;
  }

  onSortir() {
    this.authService.logout();
  }

}
