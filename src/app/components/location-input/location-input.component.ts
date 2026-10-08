import { Component, ChangeDetectionStrategy, Input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Genre } from '../../pages/weather-playlist/weather-playlist.component';
import { Mood, moods } from '../../services/mood.service';

@Component({
  selector: 'app-location-input',
  imports: [ReactiveFormsModule],
  templateUrl: './location-input.component.html',
  styleUrl: './location-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationInputComponent {
  onRefreshPlaylist = output<void>();
  onGenreChange = output<Genre>();
  onLocationChange = output<string>();
  onMoodChange = output<Mood>();
  @Input() genres!: Array<Genre>;
  @Input() selectedMood!: Mood | undefined;
  @Input() loading!: boolean;
  @Input() selectedGenre!: Genre | undefined;

  locationControl = new FormControl('', { nonNullable: true });

  location = this.locationControl.valueChanges;
  moods = moods;

  constructor() {
    this.locationControl.valueChanges.subscribe((value) => {
      this.onLocationChange.emit(value);
    });
  }

  selectGenre(sGenre: string) {
    const selectedGenre = this.genres.find((genre) => genre?.id === sGenre);
    if (selectedGenre) {
      this.onGenreChange.emit(selectedGenre);
    }
  }


  selectMood(sMood: string) {
    const selectedMood = this.moods().find((mood) => mood.mood === sMood);
    
    if (selectedMood) {
      this.onMoodChange.emit(selectedMood);
    }
  }
  refreshPlaylist() {
    this.onRefreshPlaylist.emit();
  }
}
