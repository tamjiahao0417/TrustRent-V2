import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRentalRequest } from './edit-rental-request';

describe('EditRentalRequest', () => {
  let component: EditRentalRequest;
  let fixture: ComponentFixture<EditRentalRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRentalRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRentalRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
