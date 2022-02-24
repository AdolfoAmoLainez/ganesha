import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AluviewComponent } from './aluview.component';

describe('AluviewComponent', () => {
  let component: AluviewComponent;
  let fixture: ComponentFixture<AluviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AluviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AluviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
