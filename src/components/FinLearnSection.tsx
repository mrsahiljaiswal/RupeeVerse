import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Trophy, Star, Target, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getSecureAuthData } from '@/utils/secureAuthStorage';
import { financialArticles } from '@/data/financialArticles';
import { Article, UserProgress } from '@/types/financial';
import { toast } from 'sonner';

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {article.readTime}
        </div>
      </CardContent>
    </Card>
  );
};

const FinLearnSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    articlesRead: [],
    quizzesCompleted: [],
    totalArticles: financialArticles.length,
    totalQuizzes: financialArticles.reduce((acc, article) => acc + article.quiz.length, 0),
    lastQuizScore: 0,
    lastReadArticle: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const secureData = getSecureAuthData();
      if (!secureData?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/finlearn/progress', {
          headers: {
            'Authorization': `Bearer ${secureData.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const data = await response.json();
        setProgress({
          ...data.data,
          totalArticles: financialArticles.length,
          totalQuizzes: financialArticles.reduce((acc, article) => acc + article.quiz.length, 0)
        });
      } catch (error) {
        console.error('Error loading progress:', error);
        toast.error('Failed to load your progress');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  const averageQuizScore = progress.lastQuizScore || 0;
  const completionRate = (progress.articlesRead.length / progress.totalArticles) * 100;
  const quizCompletionRate = (progress.quizzesCompleted.length / progress.totalQuizzes) * 100;

  // Get 3 random articles that haven't been read yet
  const unreadArticles = financialArticles.filter(article => !progress.articlesRead.includes(article.id));
  const recommendedArticles = unreadArticles
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <section className="py-16 md:py-24 container px-4 mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
          Learn <span className="text-primary">Financial Skills</span> That Last a Lifetime
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Our FinLearn platform provides accessible financial education, available offline for continuous learning.
        </p>
      </div>

      {/* Quick Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Average Quiz Score</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
              {averageQuizScore.toFixed(0)}%
            </div>
            <Progress value={averageQuizScore} className="h-2 mt-2" />
            <div className="text-sm text-muted-foreground mt-1">
              Based on your last quiz attempt
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Article Completion</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
              {completionRate.toFixed(0)}%
            </div>
            <Progress value={completionRate} className="h-2 mt-2" />
            <div className="text-sm text-muted-foreground mt-1">
              {progress.articlesRead.length} of {progress.totalArticles} articles read
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Quiz Completion</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-300 bg-clip-text text-transparent">
              {quizCompletionRate.toFixed(0)}%
            </div>
            <Progress value={quizCompletionRate} className="h-2 mt-2" />
            <div className="text-sm text-muted-foreground mt-1">
              {progress.quizzesCompleted.length} of {progress.totalQuizzes} quizzes completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Articles */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recommended Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/finlearn">
          <Button className="purple-gradient">
            Explore All Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FinLearnSection;
