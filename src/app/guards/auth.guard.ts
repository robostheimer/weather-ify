import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SpotifyAuthService } from '../services/spotify-auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(SpotifyAuthService);
  if (auth.isLoggedIn) {
    return true;
  }
  auth.login();
  return false;
};
