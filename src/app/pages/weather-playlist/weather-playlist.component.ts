import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LocationInputComponent } from '../../components/location-input/location-input.component';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { SpotifyApiService, SpotifyTrack, SpotifyProfile } from '../../services/spotify-api.service';
import {  Mood, MoodService } from '../../services/mood.service';
import { WeatherService, WeatherResponse } from '../../services/weather.service';
import { debounceTime, of, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SavePlaylistComponent } from '../../components/save-playlist/save-playlist.component';



export type Genre = {id: string, displayName: string} | undefined;

@Component({
  selector: 'app-weather-playlist',
  imports: [LocationInputComponent, SavePlaylistComponent],
  templateUrl: './weather-playlist.component.html',
  styleUrl: './weather-playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherPlaylistComponent {
  private spotifyAuthService = inject(SpotifyAuthService);
  private spotifyApiService = inject(SpotifyApiService);
  private weatherService = inject(WeatherService);
  private moodService = inject(MoodService);
  

  weatherCodes: Record<number, string> = {
    0: 'clear',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    4: 'foggy',
    5: 'drizzling',
    6: 'rainy',
    7: 'snowy',
    8: 'stormy',
    9: 'windy',
    10: 'hailing',
    11: 'thunderstorming',
    12: 'tornadoing',
    13: 'hurricaneing',
    51: 'rainy',
  }
  genres: Array<Genre> = [
    {id: 'pop', displayName: 'pop'}, 
    {id: 'rock', displayName: 'rock'}, 
    {id: 'classic_rock', displayName: 'classic rock'}, 
    {id:'folk', displayName: 'folk'},
    {id:'indie', displayName: 'indie'},
    {id:'americana', displayName: 'americana'},
    {id:'alternative', displayName: 'alternative'},
    {id:'jazz', displayName: 'jazz'},
    {id:'blues', displayName: 'blues'},
    {id:'country', displayName: 'country'},
    {id:'electronic', displayName: 'electronic'},
    {id:'hip_hop', displayName: 'hip hop'},
    {id:'latin', displayName: 'latin'},
    {id:'metal', displayName: 'metal'},
    {id:'punk', displayName: 'punk'},
    {id:'reggae', displayName: 'reggae'},
    {id:'r_and_b', displayName: 'r&b'},
  ]
  genre = signal<Genre | undefined>(undefined);
  weatherResponse = signal<WeatherResponse | null>(null);
  location = signal<string>('');
  tracks = signal<SpotifyTrack[]>([]);
  conditions = signal<string>('');
  unit = signal<'C' | 'F'>('C');
  mood = signal<Mood | undefined>(undefined);
  user = toSignal(this.spotifyApiService.fetchSpotifyProfile(), { initialValue: null });
  loading = signal(false);
  // bundle deps so genre changes also refetch
  private recommendationInput = computed(() => ({
    mood: this.mood(),
    genreId: this.genre()?.id,
  }));


  constructor() {
    toObservable(this.location)
      .pipe(
        debounceTime(500),
        tap(() => this.loading.set(true)),
        switchMap((loc) =>
          loc.trim() ? this.weatherService.getCurrentConditions(loc) : of(null)
        ),
        tap(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe((w) => {
        this.conditions.set(this.weatherCodes[w?.current?.weather_code ?? 0] ?? '');
        this.weatherResponse.set(w)
        this.mood.set(this.moodService.getMoodFromWeatherCode(w?.current?.weather_code ?? 0));
      });

    toObservable(this.recommendationInput)
      .pipe(
        switchMap(({ mood, genreId }) =>
          mood
            ? this.spotifyApiService.getMoodRecommendations(mood.mood, genreId)
            : of([] as SpotifyTrack[])
        ),
        takeUntilDestroyed()
      )
      .subscribe((tracks) => { console.log(tracks); this.tracks.set(tracks)});
  }


  temperature = computed(() => {
    return this.weatherResponse()?.current?.temperature_2m || undefined;
  });

  get isLoggedIn() {
    return this.spotifyAuthService.isLoggedIn
  }


  changeLocation(location: string) {
    this.location.set(location);
  }

  setGenre(genre: Genre) {
    this.loading.set(true);
    if(genre?.id === 'all') {
      this.genre.set(undefined);
    } else {
    this.genre.set(genre);
    this.spotifyApiService.getMoodRecommendations(this.mood()?.mood, this.genre()?.id).subscribe((tracks) => {
      this.tracks.set(tracks);
      this.loading.set(false);
    });
   }
  }

  login() {
    this.spotifyAuthService.login();
  }

  setMood(mood: Mood) {
    this.mood.set(mood);
    this.loading.set(true);
    this.spotifyApiService.getMoodRecommendations(mood.mood, this.genre()?.id).subscribe((tracks) => {
      this.tracks.set(tracks);
      this.loading.set(false);
    });
  }

  refreshPlaylist() {
    this.loading.set(true);
    if (!this.mood()?.mood) {
      return;
    }
    this.spotifyApiService.getMoodRecommendations(this.mood()?.mood, this.genre()?.id).subscribe((tracks) => {
      this.tracks.set(tracks);
      this.loading.set(false);
    });
    
  }
  logout() {
    this.spotifyAuthService.logout();
  }
}
