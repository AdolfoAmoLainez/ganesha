import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Assignatura } from '../shared/assignatura.model';
import { Subject } from 'rxjs';

@Injectable()
export class DataBaseService {
  assignatures = [
    {
      id: 1,
      codi: '11223311',
      nom: 'Assignatura 01'
    },
    {
      id: 2,
      codi: '11223322',
      nom: 'Assignatura 02'
    },
    {
      id: 3,
      codi: '11223333',
      nom: 'Assignatura 03'
    }
  ];

  assignaturesUpdated = new Subject <Assignatura []>();

  constructor(private http: HttpClient) {}

  getAssignatures() {
    return this.http.get<{assignatures: Assignatura[]}>('http://localhost:3000/api/crud/assignatures').subscribe(
      (data: any) => {
        console.log(data);

        this.assignaturesUpdated.next(data.json);
      }
    );
    //return this.assignatures;
  }

  getAssignatura(id: string) {
    return this.http.get<{assignatura: Assignatura}>('http://localhost:3000/api/crud/assignatures/' + id);
  }

}
