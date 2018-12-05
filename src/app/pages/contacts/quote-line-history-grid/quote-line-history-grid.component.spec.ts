import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteLineHistoryGridComponent } from './quote-line-history-grid.component';

describe('QuoteLineHistoryGridComponent', () => {
  let component: QuoteLineHistoryGridComponent;
  let fixture: ComponentFixture<QuoteLineHistoryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteLineHistoryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteLineHistoryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
