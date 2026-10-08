import { Component, ChangeDetectionStrategy, computed, inject, Input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SpotifyApiService, SpotifyTrack } from '../../services/spotify-api.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-save-playlist',
  imports: [],
  templateUrl: './save-playlist.component.html',
  styleUrl: './save-playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavePlaylistComponent {
  @Input() mood!: string | undefined;
  @Input() tracks!: SpotifyTrack[];
  @Input() location!: string | undefined;
  @Input() conditions!: string | undefined;

  private spotifyApiService = inject(SpotifyApiService);
  private sanitizer = inject(DomSanitizer);

  showPlayer = signal(false);
  playlistId = signal<string | undefined>(undefined);

  /** Angular blocks dynamic iframe [src] unless marked trusted. */
  embedUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.playlistId();
    if (!id) {
      return null;
    }
    const url = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  savePlaylist() {
    const uris = (this.tracks ?? [])
      .map((t) => t.uri || (t.id ? `spotify:track:${t.id}` : ''))
      .filter(Boolean);
    if (uris.length === 0) {
      console.warn('[SavePlaylist] No track URIs to save');
      return;
    }
    const name = `Weather-ify: mood: ${this.mood ?? 'mix'} for a ${this.conditions ?? 'unknown'} day in ${this.location ?? 'unknown'} on ${new Date().toLocaleString()}`;
    const description = 'Playlist curated by Weather-ify';

    this.spotifyApiService
      .createPlaylist(name, description)
      .pipe(
        switchMap((playlist) =>
          this.spotifyApiService.addTracksToPlaylist(playlist.id, uris).pipe(
            tap(() => {
              this.playlistId.set(playlist.id);
              this.showPlayer.set(true);
            })
          )
        )
      )
      .subscribe({
        next: () => console.log('[SavePlaylist] tracks added'),
        error: (err) => {
          console.error('[SavePlaylist] failed', err?.error ?? err);
        },
      });
  }
}
