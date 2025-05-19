export interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  summary: string;
  source: string;
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  readTime: string;
  difficulty: string;
  isBookmarked?: boolean;
  pdfUrl?: string; // URL to the PDF version of the article
}

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type UserProgress = {
  articlesRead: number[];
  quizzesCompleted: number[];
  totalArticles: number;
  totalQuizzes: number;
  lastReadArticle?: number;
  lastQuizScore?: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  articleCount: number;
}; 