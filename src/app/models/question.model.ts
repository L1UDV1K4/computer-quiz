export interface Question {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaResponse {
  response_code: number;
  results: Question[];
}
export interface QuestionWithAnswers extends Question {
  shuffled_answers: string[];
  selected_answer?: string;
}
