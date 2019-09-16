import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {


    constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                setTimeout(() => {this.authService.logout();} , 6000);
                this.toastr.error('No teniu permís per accedir o bé la sessió ha expirat.', 'Error!', {
                  timeOut: 6000
                });

            } else {
              return throwError(err);
            }
        }));
    }
}
