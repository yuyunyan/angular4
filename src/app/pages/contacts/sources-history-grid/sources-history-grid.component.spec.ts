import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesHistoryGridComponent } from './sources-history-grid.component';

describe('SourcesHistoryGridComponent', () => {
  let component: SourcesHistoryGridComponent;
  let fixture: ComponentFixture<SourcesHistoryGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourcesHistoryGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcesHistoryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
