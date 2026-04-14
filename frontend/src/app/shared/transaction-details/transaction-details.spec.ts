import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetails } from './transaction-details';

describe('TransactionDetails', () => {
  let component: TransactionDetails;
  let fixture: ComponentFixture<TransactionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
