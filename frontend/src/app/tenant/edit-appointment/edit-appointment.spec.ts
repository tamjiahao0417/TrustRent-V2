import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppointment } from './edit-appointment';

describe('EditAppointment', () => {
  let component: EditAppointment;
  let fixture: ComponentFixture<EditAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAppointment],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAppointment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
