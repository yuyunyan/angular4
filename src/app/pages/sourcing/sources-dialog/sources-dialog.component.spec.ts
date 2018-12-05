import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesDialogComponent } from './sources-dialog.component';

describe('SourcesDialogComponent', () => {
  let component: SourcesDialogComponent;
  let fixture: ComponentFixture<SourcesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourcesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
