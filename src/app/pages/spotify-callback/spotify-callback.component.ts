import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-spotify-callback',
  imports: [],
  templateUrl: './spotify-callback.component.html',
  styleUrl: './spotify-callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotifyCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spotifyAuth = inject(SpotifyAuthService);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if(!code) {
      this.router.navigateByUrl('/weather-playlist');
      return;
    } 
    
    this.spotifyAuth.exchangeCodeForToken(code).subscribe({
      next: () => this.router.navigate(['/weather-playlist']),
      error: () => this.router.navigate(['/weather-playlist'])
    });
  
  }
}
