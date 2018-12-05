import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartAvailabilityComponent } from './part-availability.component';

describe('PartAvailabilityComponent', () => {
  let component: PartAvailabilityComponent;
  let fixture: ComponentFixture<PartAvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartAvailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
