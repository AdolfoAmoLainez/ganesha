import { Component, OnInit } from '@angular/core';
import { DataBaseService } from '../shared/database.service';

@Component({
  selector: 'app-aluview',
  templateUrl: './aluview.component.html',
  styleUrls: ['./aluview.component.css']
})
export class AluviewComponent implements OnInit {

  veureBtn = true;
  error = false;
  missatge = 'Fent click a "Activa", s\'activarà el teu niu per poder accedir a les carpetes de Ganesha. ' +
             'Es generarà una contrasenya que rebràs al teu correu electrònic de la uab mail@autonoma.uab.cat';
  msgBtnActivar = "Activa";

  constructor(private dbService: DataBaseService) { }

  ngOnInit(): void {
  }

  activarClick() {
    const username = localStorage.getItem('currentUser');

    this.dbService.resetPwAlumne(username).subscribe(
      (resultat) => {
        if (resultat.status === 'success') {
          this.veureBtn = false;
          this.missatge = resultat.message;
        } else {
          this.error = true;
          this.missatge = resultat.message;
          this.msgBtnActivar = "Reintenta";
        }
        
      },
      (err) => {
        console.log(err);
        
      }
    )
  }

}
