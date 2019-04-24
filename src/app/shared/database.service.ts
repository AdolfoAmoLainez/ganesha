import { Injectable } from '@angular/core';

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

  getAssignatures() {
    return this.assignatures;
  }

}
