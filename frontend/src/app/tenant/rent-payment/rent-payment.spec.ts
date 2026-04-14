import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentPayment } from './rent-payment';

describe('RentPayment', () => {
  let component: RentPayment;
  let fixture: ComponentFixture<RentPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentPayment],
    }).compileComponents();

    fixture = TestBed.createComponent(RentPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
