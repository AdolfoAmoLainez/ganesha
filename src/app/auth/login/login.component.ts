import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginErrorSubscription: Subscription;
  errorMsg: string;

  constructor(private authService: AuthService) { }

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
  }

  onLogin() {
    this.authService.login(this.loginForm.get('niu').value, this.loginForm.get('passwd').value);
  }

}
