import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiPricing } from './ai-pricing';

describe('AiPricing', () => {
  let component: AiPricing;
  let fixture: ComponentFixture<AiPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPricing],
    }).compileComponents();

    fixture = TestBed.createComponent(AiPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
