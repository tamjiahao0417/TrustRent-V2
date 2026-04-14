import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalRequests } from './rental-requests';

describe('RentalRequests', () => {
  let component: RentalRequests;
  let fixture: ComponentFixture<RentalRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
