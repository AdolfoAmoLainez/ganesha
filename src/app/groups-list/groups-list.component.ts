import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements OnInit {

  groups = [];

  selectedGroups = [];

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      (params) => {
        console.log(params);
        this.groups = [
          {
            id: 1 + params.assignaturaid * 10,
            nom: '11223311-g01',
            ordre: 1
          },
          {
            id: 2 + params.assignaturaid * 10,
            nom: '11223311-g02',
            ordre: 2
          },
          {
            id: 3 + params.assignaturaid * 10,
            nom: '11223311-g03',
            ordre: 3
          }
        ];

      }
    )
  }

  onDeleteGroups() {

    this.selectedGroups.forEach(
      (selectedGroup) => {
        this.groups = this.groups.filter(
          (value) => {
            return value.id !== selectedGroup;
          }
        );
      }
    );

  }

  onCheckGroupClick(groupId: number, value: boolean) {

    if (value) {
      this.selectedGroups.push(groupId);
    } else {
      this.selectedGroups.splice(this.selectedGroups.indexOf(groupId), 1);
    }
  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (quantitat) => {
        console.log('Vol crear ' + quantitat + ' grups.');
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onDeleteIconClick(id: number) {
    this.groups.splice(id, 1);
  }

}
