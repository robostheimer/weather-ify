import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { authGuard } from './auth.guard';
import { SpotifyAuthService } from '../services/spotify-auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let isLoggedIn = false;
  let login: jasmine.Spy;

  beforeEach(() => {
    isLoggedIn = false;
    login = jasmine.createSpy('login');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SpotifyAuthService,
          useValue: {
            get isLoggedIn() {
              return isLoggedIn;
            },
            login,
          },
        },
      ],
    });
  });

  it('allows the homepage when the user is logged in', () => {
    isLoggedIn = true;

    expect(executeGuard({} as never, {} as never)).toBeTrue();
    expect(login).not.toHaveBeenCalled();
  });

  it('starts login and blocks the homepage when the user is logged out', () => {
    expect(executeGuard({} as never, {} as never)).toBeFalse();
    expect(login).toHaveBeenCalled();
  });
});
