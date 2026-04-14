import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDetails } from './contract-details';

describe('ContractDetails', () => {
  let component: ContractDetails;
  let fixture: ComponentFixture<ContractDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
