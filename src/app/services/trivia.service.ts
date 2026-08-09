import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { TriviaResponse } from '../models/question.model';

@Injectable({
  providedIn: 'root',
})
export class TriviaService {
  private readonly API_URL = environment.OpenTriviaApi;
  private readonly http = inject(HttpClient);

  retrieveQuestions(): Observable<TriviaResponse> {
    return this.http
      .get<TriviaResponse>(this.API_URL)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error('Failed to fetch questions. Please try again.')),
        ),
      );
  }
}
