import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { type Observable, tap } from 'rxjs';

const CLIENT_ID = 'f8a069c94fe84536afbf0f2eac111260';
const REDIRECT_URI = 'http://127.0.0.1:4200/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-private',
  'playlist-modify-public',
].join(' ');

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token?: string
  scope: string
}

@Injectable({
  providedIn: 'root'
})

export class SpotifyAuthService {
  private http = inject(HttpClient)

  get accessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Scopes granted on the current access token (from the token response). */
  get tokenScopes(): string | null {
    return localStorage.getItem('token_scope');
  }

  get isLoggedIn(): boolean {
    return !!this.accessToken && !this.isAccessTokenExpired;
  }

  get isAccessTokenExpired(): boolean {
    const raw = localStorage.getItem('expires_at');
    if (!raw) {
      return true;
    }
    const expiresAt = Date.parse(raw);
    return Number.isNaN(expiresAt) || expiresAt <= Date.now();
  }

  private base64UrlEncode(arrayBuffer: ArrayBuffer): string {
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private generateCodeVerifier(): string {
    const bytes = new Uint8Array(32); // 32 random bytes
    window.crypto.getRandomValues(bytes);
    return this.base64UrlEncode(bytes.buffer); // often lands ~43 chars
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier)
    );
    return this.base64UrlEncode(digest);
  }

  exchangeCodeForToken(code:string): Observable<SpotifyToken> {
    const body = new HttpParams()
      .set('client_id', CLIENT_ID)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', REDIRECT_URI)
      .set('code_verifier', localStorage.getItem('code_verifier') ?? '');
    return this.http.post<SpotifyToken>(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }
    ).pipe(tap((token) => {
      localStorage.setItem('access_token', token.access_token);
      localStorage.setItem(
        'expires_at',
        new Date(Date.now() + Number(token.expires_in) * 1000).toISOString()
      );
      localStorage.setItem('token_scope', token.scope ?? '');
      console.log('[SpotifyAuth] token scopes:', token.scope);
      if (token.refresh_token) {
        localStorage.setItem('refresh_token', token.refresh_token);
      }
      localStorage.removeItem('code_verifier');
    }));
  }

  login(): void {
    const codeVerifier = this.generateCodeVerifier();
    localStorage.setItem('code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
      window.location.href = url;
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('token_scope');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('code_verifier');
  }
}
