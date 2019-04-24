import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mymodalyesno',
  templateUrl: './mymodalyesno.component.html',
  styleUrls: ['./mymodalyesno.component.css']
})
export class MymodalyesnoComponent implements OnInit {

  public titol = '';
  missatge = '';

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
