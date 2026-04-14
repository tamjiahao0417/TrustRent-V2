import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceReport } from './maintenance-report';

describe('MaintenanceReport', () => {
  let component: MaintenanceReport;
  let fixture: ComponentFixture<MaintenanceReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceReport],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
