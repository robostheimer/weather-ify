import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SpotifyAuthService } from './spotify-auth.service';
import { catchError, map, Observable, of, throwError } from 'rxjs';

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface SpotifyProfile {
  id: string;
  display_name?: string;
  email?: string;
  images?: Image[];
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: Artist[];
  album: Album;
  preview_url: string;
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: SpotifyTrack[];
}

interface Artist {
  id: string;
  name: string;
}

interface Album {
  id: string;
  name: string;
  images: Image[];
}

interface Image {
  url: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyApiService {
  private http = inject(HttpClient);
  private spotifyAuth = inject(SpotifyAuthService);

  private authHeaders() {
    return { Authorization: `Bearer ${this.spotifyAuth.accessToken}` };
  }

  private handleSpotifyError(err: HttpErrorResponse, context: string) {
    console.error(`[SpotifyAPI] ${context}`, {
      status: err.status,
      statusText: err.statusText,
      body: err.error,
      message: err.error?.error?.message,
      scopesOnToken: this.spotifyAuth.tokenScopes,
    });
    if (err.status === 401) {
      this.spotifyAuth.logout();
    }
    return throwError(() => err);
  }

  getMoodRecommendations(mood?: string, genre?: string): Observable<SpotifyTrack[]> {
    if (!mood) {
      return of([]);
    }
    const offset = Math.floor(Math.random() * 100);
    const url = genre
      ? `https://api.spotify.com/v1/search?q=genre: %22${genre}%22 %22${mood} vibe%22&type=track&type=track&limit=10&offset=${offset}`
      : `https://api.spotify.com/v1/search?q="${mood} vibe"&type=track&limit=10&offset=${offset}`;

    return this.http
      .get<SpotifySearchResponse>(url, { headers: this.authHeaders() })
      .pipe(
        map((response) => response.tracks.items),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.spotifyAuth.logout();
          }
          return of([]);
        })
      );
  }

  fetchSpotifyProfile(): Observable<SpotifyProfile | null> {
    return this.http
      .get<SpotifyProfile>('https://api.spotify.com/v1/me', {
        headers: this.authHeaders(),
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleSpotifyError(err, 'GET /v1/me');
          return of(null);
        })
      );
  }

  /** Prefer /me/playlists so we never POST to the wrong user id (a common 403). */
  createPlaylist(name: string, description: string): Observable<SpotifyPlaylist> {
    return this.http
      .post<SpotifyPlaylist>(
        'https://api.spotify.com/v1/me/playlists',
        {
          name,
          description,
          public: false,
        },
        { headers: this.authHeaders() }
      )
      .pipe(catchError((err: HttpErrorResponse) => this.handleSpotifyError(err, 'POST /v1/me/playlists')));
  }

  addTracksToPlaylist(playlistId: string, trackUris: string[]): Observable<unknown> {
    // Normalize to Spotify URIs (search results usually include uri; fall back from id).
    const uris = trackUris
      .map((uri) => uri?.trim())
      .filter((uri): uri is string => !!uri)
      .map((uri) => (uri.startsWith('spotify:') ? uri : `spotify:track:${uri}`));

    // Feb 2026 Web API change: /tracks was removed; use /items instead.
    // Old URL returns 403 Forbidden for many development apps.
    return this.http
      .post(
        `https://api.spotify.com/v1/playlists/${playlistId}/items`,
        { uris },
        { headers: this.authHeaders() }
      )
      .pipe(
        catchError((err: HttpErrorResponse) =>
          this.handleSpotifyError(err, `POST /v1/playlists/${playlistId}/items`)
        )
      );
  }
}
