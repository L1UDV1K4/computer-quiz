import { Injectable, signal } from '@angular/core';

export interface QuizAttempt {
  date: string;
  score: number;
  total: number;
  percent: number;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly STORAGE_KEY = 'quiz_attempts';

  attempts = signal<QuizAttempt[]>(this.loadAttempts());

  private loadAttempts(): QuizAttempt[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveAttempt(score: number, total: number, percent: number): void {
    const newAttempt: QuizAttempt = {
      date: new Date().toISOString(),
      score,
      total,
      percent,
    };
    const updated = [newAttempt, ...this.attempts()];
    this.attempts.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}
