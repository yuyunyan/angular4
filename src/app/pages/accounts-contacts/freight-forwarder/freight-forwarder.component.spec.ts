import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightForwarderComponent } from './freight-forwarder.component';

describe('FreightForwarderComponent', () => {
  let component: FreightForwarderComponent;
  let fixture: ComponentFixture<FreightForwarderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightForwarderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightForwarderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
