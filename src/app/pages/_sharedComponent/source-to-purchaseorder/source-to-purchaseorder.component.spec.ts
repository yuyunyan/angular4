import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceToPurchaseorderComponent } from './source-to-purchaseorder.component';

describe('SourceToPurchaseorderComponent', () => {
  let component: SourceToPurchaseorderComponent;
  let fixture: ComponentFixture<SourceToPurchaseorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceToPurchaseorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceToPurchaseorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
