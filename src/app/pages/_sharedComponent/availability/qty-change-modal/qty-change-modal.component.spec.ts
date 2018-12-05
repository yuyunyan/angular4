import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QtyChangeModalComponent } from './qty-change-modal.component';

describe('QtyChangeModalComponent', () => {
  let component: QtyChangeModalComponent;
  let fixture: ComponentFixture<QtyChangeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QtyChangeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QtyChangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
