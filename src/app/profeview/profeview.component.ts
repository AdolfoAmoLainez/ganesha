import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';

import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profeview',
  templateUrl: './profeview.component.html',
  styleUrls: ['./profeview.component.css']
})
export class ProfeviewComponent implements OnInit {

  // Icones
  faPowerOff = faPowerOff;

  isNavbarCollapsed = true;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService) { }

  ngOnInit() {
    this.router.navigate(['assignatures'], {relativeTo: this.activatedRoute});

  }

  onSortir() {
    this.authService.logout();
  }

}
