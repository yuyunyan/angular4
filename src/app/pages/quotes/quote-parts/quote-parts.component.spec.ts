import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotePartsComponent } from './quote-parts.component';

describe('QuotePartsComponent', () => {
  let component: QuotePartsComponent;
  let fixture: ComponentFixture<QuotePartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotePartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
