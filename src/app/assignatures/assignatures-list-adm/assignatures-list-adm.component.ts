import { Component, OnInit } from '@angular/core';
import { DataBaseService } from 'src/app/shared/database.service';

@Component({
  selector: 'app-assignatures-list-adm',
  templateUrl: './assignatures-list-adm.component.html',
  styleUrls: ['./assignatures-list-adm.component.css']
})
export class AssignaturesListAdmComponent implements OnInit {

  assignatures = [];

  constructor(private dbService: DataBaseService) { }

  ngOnInit() {
    this.assignatures = this.dbService.getAssignatures();
  }

}
