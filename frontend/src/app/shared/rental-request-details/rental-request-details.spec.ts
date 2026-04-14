import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalRequestDetails } from './rental-request-details';

describe('RentalRequestDetails', () => {
  let component: RentalRequestDetails;
  let fixture: ComponentFixture<RentalRequestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalRequestDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalRequestDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
