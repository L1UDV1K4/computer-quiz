import { Component, inject, signal, computed } from '@angular/core';
import { TriviaService } from './services/trivia.service';
import { QuestionWithAnswers } from './models/question.model';
import { CommonModule } from '@angular/common';
import { RESULT_MESSAGES } from './constants/result-messages';
import { HistoryService } from './services/history.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly triviaService = inject(TriviaService);
  readonly historyService = inject(HistoryService);

  questions = signal<QuestionWithAnswers[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  score = signal(0);
  currIndex = signal(0);
  isFinished = signal(false);

  constructor() {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.triviaService.retrieveQuestions().subscribe({
      next: (data) => {
        const mapped = data.results.map((q) => {
          const answers = this.shuffle(q.correct_answer, q.incorrect_answers);
          return {
            type: q.type,
            difficulty: q.difficulty,
            category: q.category,
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
            shuffled_answers: answers,
          };
        });
        this.questions.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  private shuffle(correct: string, incorrect: string[]): string[] {
    const combined = incorrect.concat(correct);

    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined;
  }

  currQuestion = computed(() => this.questions()[this.currIndex()]);

  selectAnswer(question: QuestionWithAnswers, answer: string) {
    if (question.selected_answer !== undefined) return;
    question.selected_answer = answer;
    if (answer === question.correct_answer) {
      this.score.update((s) => s + 1);
    }
  }

  nextQuestion() {
    if (this.currIndex() + 1 >= this.questions().length) {
      this.isFinished.set(true);
      this.historyService.saveAttempt(this.score(), this.questions().length, this.scorePercent());
    } else {
      this.currIndex.update((i) => i + 1);
    }
  }

  restartQuiz() {
    this.score.set(0);
    this.currIndex.set(0);
    this.isFinished.set(false);
    this.loadQuestions();
  }

  progress = computed(() => {
    const total = this.questions().length;
    return total ? ((this.currIndex() + 1) / total) * 100 : 0;
  });

  scorePercent = computed(() => Math.round((this.score() / this.questions().length) * 100));
  resultMessage = computed(() => {
    const percent = this.scorePercent();
    if (percent === 100) return RESULT_MESSAGES.PERFECT;
    if (percent >= 80) return RESULT_MESSAGES.EXCELLENT;
    if (percent >= 50) return RESULT_MESSAGES.GOOD;
    return RESULT_MESSAGES.NEEDS_PRACTICE;
  });

  getResultLevel(percent: number): string {
    if (percent >= 80) return 'good';
    if (percent >= 50) return 'ok';
    return 'poor';
  }
}
