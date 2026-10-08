import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherPlaylistComponent } from './weather-playlist.component';

describe('WeatherPlaylistComponent', () => {
  let component: WeatherPlaylistComponent;
  let fixture: ComponentFixture<WeatherPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherPlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
