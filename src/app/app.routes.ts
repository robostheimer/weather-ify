import { Routes } from '@angular/router';
import { WeatherPlaylistComponent } from './pages/weather-playlist/weather-playlist.component';
import { SpotifyCallbackComponent } from './pages/spotify-callback/spotify-callback.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/weather-playlist',
    pathMatch: 'full'
  },
  {
    path: 'weather-playlist',
    component: WeatherPlaylistComponent,
    canActivate: [authGuard]
  },
   {
    path:'analyzer',
    loadComponent: () => import('./pages/track-analyzer/track-analyzer.component').then(m => m.TrackAnalyzerComponent)
  },
  {
    path: 'callback',
    component: SpotifyCallbackComponent
  }
];
