import { Injectable, signal } from '@angular/core';

export interface Mood {
  mood: string;
  valence: number;
  energy: number;
  acousticness: number;
  danceability: number;
  meteo_codes: number[];
}

const WEATHER_MOOD_MAP: { [key: string]: Mood } = {
  sunny: { meteo_codes: [0, 1], mood: 'happy', valence: 0.8, energy: 0.7, acousticness: 0.2, danceability: 0.8 },
  cloudy: { meteo_codes: [2, 3], mood: 'melancholy', valence: 0.5, energy: 0.5, acousticness: 0.5, danceability: 0.5 },
  foggy: { meteo_codes: [45, 48], mood: 'mysterious', valence: 0.4, energy: 0.3, acousticness: 0.6, danceability: 0.6 },
  rainy: { meteo_codes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], mood: 'sad', valence: 0.3, energy: 0.4, acousticness: 0.7, danceability: 0.7 },
  snowy: { meteo_codes: [71, 73, 75, 77, 85, 86], mood: 'playful', valence: 0.7, energy: 0.6, acousticness: 0.3, danceability: 0.6 },
  thunderstorm: { meteo_codes: [95, 96,97, 99], mood: 'angry', valence: 0.2, energy: 0.8, acousticness: 0.1, danceability: 0.8 }
};

export const moods = signal<Mood[]>(Object.values(WEATHER_MOOD_MAP));


@Injectable({
  providedIn: 'root'
})
export class MoodService {

  getMoodFromWeatherCode(weatherCode: number): Mood | undefined {
    for (const key in WEATHER_MOOD_MAP) {
     if (WEATHER_MOOD_MAP[key].meteo_codes.includes(weatherCode)) {
        console.log(`Found mood for weather code ${weatherCode}: ${WEATHER_MOOD_MAP[key].mood}`);
        return WEATHER_MOOD_MAP[key];
      }
    }
    return;
  };
}
