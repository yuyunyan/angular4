import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteEmailComponent } from './quote-email.component';

describe('QuoteEmailComponent', () => {
  let component: QuoteEmailComponent;
  let fixture: ComponentFixture<QuoteEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
