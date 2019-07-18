import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-adminview',
  templateUrl: './adminview.component.html',
  styleUrls: ['./adminview.component.css']
})
export class AdminviewComponent implements OnInit {

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
