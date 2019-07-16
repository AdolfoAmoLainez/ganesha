import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isNavbarCollapsed = true;

  /** TODO: Falta controlar visibilidad y admin/profe */

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  onSortir() {
    this.authService.logout();
  }

}
