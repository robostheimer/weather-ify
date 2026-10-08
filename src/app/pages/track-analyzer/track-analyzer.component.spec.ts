import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackAnalyzerComponent } from './track-analyzer.component';

describe('TrackAnalyzerComponent', () => {
  let component: TrackAnalyzerComponent;
  let fixture: ComponentFixture<TrackAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
