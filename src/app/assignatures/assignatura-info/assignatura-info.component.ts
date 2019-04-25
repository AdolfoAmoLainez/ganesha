import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { DataBaseService } from 'src/app/shared/database.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-assignatura-info',
  templateUrl: './assignatura-info.component.html',
  styleUrls: ['./assignatura-info.component.css']
})
export class AssignaturaInfoComponent implements OnInit {

  perfil = 'adm';
  assignatura:Assignatura;
  assignaturaForm: FormGroup;

  constructor(private activatedRoute: ActivatedRoute,
              private dbService: DataBaseService) {}

  ngOnInit() {
    //this.assignatura.codi = "1212"

    this.assignaturaForm = new FormGroup({
      codi: new FormControl(''),
      nom: new FormControl(''),
      tamany: new FormControl(''),
      unitatstamany: new FormControl(''),
      quota: new FormControl(''),
      unitatsquota: new FormControl('')
    });

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.activatedRoute.parent.paramMap) {
      this.activatedRoute.parent.paramMap.subscribe(
        (paramMap: ParamMap) => {
          console.log(paramMap);
          if (paramMap.has('assignaturaid')) {
            this.dbService.getAssignatura(paramMap.get('assignaturaid')).subscribe(
              (result: any) => {
                const assignatura = result.json[0];
                console.log(assignatura);

                this.assignaturaForm.patchValue({
                  codi: assignatura.codi,
                  nom: assignatura.nom,
                  tamany: assignatura.tamany,
                  unitatstamany: assignatura.unitatstamany,
                  quota: assignatura.quota,
                  unitatsquota: assignatura.unitatsquota
                });
              }
            );
          }
        }
      );
    }
  }

}
