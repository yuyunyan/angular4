import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcingRfqDialogComponent } from './sourcing-rfq-dialog.component';

describe('SourcingRfqDialogComponent', () => {
  let component: SourcingRfqDialogComponent;
  let fixture: ComponentFixture<SourcingRfqDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourcingRfqDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcingRfqDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
