import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginErrorSubscription: Subscription;
  errorMsg: string;

  constructor(private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      niu : new FormControl(null),
      passwd : new FormControl(null)
    });
    this.loginErrorSubscription = this.authService.loginError.subscribe(
      (error) => {
        this.errorMsg = error;
      }
    );

    this.activatedRoute.data.subscribe(
      (data) => {
        if (!data.ticket) {
          this.authService.login();
        } else {
          this.router.navigate(['/', this.authService.getPerfil()]);
        }
      }
    );

    // this.authService.loginUser();
  }

/*   onLogin() {
    this.authService.login(this.loginForm.get('niu').value, this.loginForm.get('passwd').value);
  }
 */
}
