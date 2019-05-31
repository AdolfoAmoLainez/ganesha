import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { DataBaseService } from 'src/app/shared/database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Unitat } from 'src/app/shared/unitat.model';

@Component({
  selector: 'app-assignatura-info',
  templateUrl: './assignatura-info.component.html',
  styleUrls: ['./assignatura-info.component.css']
})
export class AssignaturaInfoComponent implements OnInit {

  perfil = 'adm';
  assignatura: Assignatura;
  unitatsDisponibles: Unitat[];
  assignaturaForm: FormGroup;
  assignaturaId;
  editMode = false;

  constructor(private activatedRoute: ActivatedRoute,
              private dbService: DataBaseService) {}

  ngOnInit() {
    // this.assignatura.codi = "1212"

    this.assignaturaForm = new FormGroup({
      id: new FormControl(''),
      codi: new FormControl('', [Validators.required]),
      nom: new FormControl('', [Validators.required]),
      unitat_id: new FormControl('', [Validators.required]),
      tamany: new FormControl('', [Validators.required]),
      unitatstamany: new FormControl('', [Validators.required]),
      // quota: new FormControl('', [Validators.required]),
      // unitatsquota: new FormControl('', [Validators.required])
    });

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.activatedRoute.parent.paramMap) {
      this.activatedRoute.parent.paramMap.subscribe(
        (paramMap: ParamMap) => {

          this.dbService.getUnitatsDisponibles().subscribe(
            (data: any) => {
              this.unitatsDisponibles = data.json;
            }
          );

          // console.log(paramMap);
          if (paramMap.has('assignaturaid')) {
            this.editMode = true;
            this.assignaturaId = paramMap.get('assignaturaid');
            this.dbService.getAssignatura(this.assignaturaId).subscribe(
              (assignatura: Assignatura) => {
                //const assignatura = result.json[0];
                // console.log(assignatura);

                this.assignaturaForm.patchValue({
                  id: assignatura.id,
                  codi: assignatura.codi,
                  nom: assignatura.nom,
                  tamany: assignatura.tamany,
                  unitat_id: assignatura.unitat_id,
                  unitatstamany: assignatura.unitatstamany,
                  // quota: assignatura.quota,
                  // unitatsquota: assignatura.unitatsquota
                });
              }
            );
          }
        }
      );
    }
  }

  onAddAssignatura() {
    this.dbService.addAssignatura(this.assignaturaForm.value);
    this.assignaturaForm.reset();
  }

  // TODO: Controlar si ha cambiado el tamaño porque hay que
  // hacer cambios en el SO. Con el pristine y el touched
  onUpdateAssignatura() {
    this.dbService.updateAssignatura(this.assignaturaForm.value);
  }

}
