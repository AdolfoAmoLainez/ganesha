import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Grup } from 'src/app/shared/grup.model';
import { Assignatura } from 'src/app/shared/assignatura.model';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit-modal.component.html',
  styleUrls: ['./group-edit-modal.component.css']
})
export class GroupEditModalComponent implements OnInit {

  public grupId: string;
  public assignatura: Assignatura;
  public nomGrup: string;
  public minutsDisponibles: number;
  public quota: number;

  editForm: FormGroup;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.editForm = new FormGroup({
      nom: new FormControl(this.nomGrup),
      quota: new FormControl(this.quota, [Validators.required, Validators.pattern(/^-?([1-9]\d*)?$/)]),
      disponibles: new FormControl(this.minutsDisponibles)
    });
  }

  onEditGroupFormChangeQuotaValues(valorInput: number) {

    console.log(valorInput);

    const minutsDisponibles = this.minutsDisponibles - this.editForm.get('quota').value;
    console.log(minutsDisponibles);


    if ( minutsDisponibles < 0) {
      this.editForm.patchValue({
        quota: this.minutsDisponibles
      });
    } else {
      this.editForm.patchValue({
        disponibles: minutsDisponibles
      });
    }

  }

}
