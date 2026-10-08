import { TestBed } from '@angular/core/testing';
import {expect, describe, it, beforeEach} from 'vitest';

import { MoodService } from './mood.service';

describe('MoodService', () => {
  let service: MoodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the correct mood for a given weather code', () => {
    const testCases = [
      { weatherCode: 0, expectedMood: 'happy' },
      { weatherCode: 2, expectedMood: 'sluggish' },
      { weatherCode: 45, expectedMood: 'mysterious' },
      { weatherCode: 51, expectedMood: 'sad' },
      { weatherCode: 71, expectedMood: 'playful' },
      { weatherCode: 95, expectedMood: 'angry' }
    ];

    testCases.forEach(({ weatherCode, expectedMood }) => {
      const mood = service.getMoodFromWeatherCode(weatherCode);
      expect(mood?.mood).toBe(expectedMood);
    });
  });
});
