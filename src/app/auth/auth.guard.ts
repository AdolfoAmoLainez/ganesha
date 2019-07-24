import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalwaitComponent } from '../shared/mymodalwait/mymodalwait.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private modalService: NgbModal) {}


  showModalWait() {
    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'No autoritzat!';
    modalRef.componentInstance.missatge = 'No està autoritzat a accedir a aquesta plana!';

    setTimeout(() => {
      modalRef.dismiss();
    }, 5000);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLogged) {
      return this.authService.getPerfil().pipe(map(
        (data) => {
          const perfil = data.perfils[0].perfil;
          if (perfil === next.data.perfil) {
            return true;
          } else {
            this.showModalWait();
            this.authService.logout();
            return false;
          }
        }
      ));
    } else {
      this.showModalWait();
      this.authService.logout();
      return false;
    }

  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }

}
