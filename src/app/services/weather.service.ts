import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, of } from 'rxjs';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface WeatherResponse {
   current: {
    temperature_2m?: number;
    weather_code: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private http = inject(HttpClient);

  getCurrentConditions(location:string) {
    return this.http.get<GeocodingResponse>(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`)
    .pipe(switchMap(geoResponse => { 
      const lat=geoResponse.results?.[0]?.latitude;
      const lon=geoResponse.results?.[0]?.longitude;
      if (lat === undefined || lon === undefined) {
        throw new Error('Invalid geocoding response: missing latitude or longitude');
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${geoResponse.results?.[0]?.latitude}&longitude=${geoResponse.results?.[0]?.longitude}&current=temperature_2m,weather_code`
      return this.http.get<WeatherResponse>(url)
    }),
    catchError((err) => {
      console.error(err);
      return of(null);
    }))
  }
}
