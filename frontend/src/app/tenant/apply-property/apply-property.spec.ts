import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyProperty } from './apply-property';

describe('ApplyProperty', () => {
  let component: ApplyProperty;
  let fixture: ComponentFixture<ApplyProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyProperty],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplyProperty);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
