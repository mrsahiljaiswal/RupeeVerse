import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, BookOpen, TrendingUp, Award, Clock, ChevronRight, Bookmark, Share2, X, FileText, Download, Trophy, Star, Target, History, Medal, Zap, RefreshCw, Filter, GraduationCap, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { financialArticles, getArticlesByCategory } from '@/data/financialArticles';
import { Article, UserProgress } from '@/types/financial';
import { motion, AnimatePresence } from 'framer-motion';
import Quiz from '@/components/Quiz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { getSecureAuthData } from '@/utils/secureAuthStorage';

interface ProgressHistory {
  id: string;
  type: 'article' | 'quiz';
  title: string;
  score?: number;
  timestamp: string;
}

interface BookmarkCategory {
  id: string;
  name: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (progress: UserProgress) => boolean;
}

const bookmarkCategories: BookmarkCategory[] = [
  { id: 'favorites', name: 'Favorites', color: 'text-yellow-500' },
  { id: 'to-read', name: 'To Read', color: 'text-blue-500' },
  { id: 'in-progress', name: 'In Progress', color: 'text-green-500' },
  { id: 'completed', name: 'Completed', color: 'text-purple-500' },
];

const ArticleCard = ({ article, onSelect, onBookmark }: { 
  article: Article; 
  onSelect: (article: Article) => void;
  onBookmark: (articleId: number) => void;
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2">
            {article.difficulty}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(article.id);
            }}
          >
            <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readTime}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {article.quiz.length} Questions
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onSelect(article)}
        >
          Read Article
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const ArticleView = ({ article, onClose, onQuizComplete, onBookmark, onShare }: { 
  article: Article; 
  onClose: () => void;
  onQuizComplete: (score: number) => void;
  onBookmark: (articleId: number) => void;
  onShare: (article: Article) => void;
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href
        });
      } else {
        onShare(article);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-primary/10">{article.difficulty}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {article.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Source: {article.source}</span>
              <div className="flex gap-2 ml-auto">
                <Button variant="ghost" size="icon" onClick={() => setShowPdf(!showPdf)}>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onBookmark(article.id)}
                >
                  <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="prose prose-invert max-w-none py-8">
            {showPdf ? (
              <div className="aspect-[3/4] w-full bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">PDF version coming soon</p>
                </div>
              </div>
            ) : (
              <>
                <div className="whitespace-pre-line bg-card/50 p-6 rounded-lg border border-border/50">
                  {article.content}
                </div>
                
                <div className="mt-8 bg-card/50 p-6 rounded-lg border border-border/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Key Takeaways
                  </h3>
                  <ul className="list-none space-y-3">
                    {article.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-border/50">
            <Button variant="outline" onClick={onClose}>
              Back to Articles
            </Button>
            <div className="flex gap-2">
              {showPdf && (
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
              <Button onClick={() => setShowQuiz(true)} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Take Quiz
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <AnimatePresence>
        {showQuiz && (
          <Quiz
            questions={article.quiz}
            onComplete={(score) => {
              onQuizComplete(score);
              setShowQuiz(false);
            }}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const achievements: Achievement[] = [
  {
    id: 'first-article',
    title: 'First Steps',
    description: 'Read your first article',
    icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    condition: (progress) => progress.articlesRead.length >= 1
  },
  {
    id: 'first-quiz',
    title: 'Quiz Master',
    description: 'Complete your first quiz with 80% or higher',
    icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    condition: (progress) => progress.quizzesCompleted.length >= 1
  },
  {
    id: 'halfway',
    title: 'Halfway There',
    description: 'Complete 50% of all articles',
    icon: <Target className="h-6 w-6 text-green-500" />,
    condition: (progress) => (progress.articlesRead.length / progress.totalArticles) >= 0.5
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: <Medal className="h-6 w-6 text-purple-500" />,
    condition: (progress) => progress.lastQuizScore === 100
  }
];

const ProgressStats = ({ progress, onResetProgress }: { 
  progress: UserProgress;
  onResetProgress: () => void;
}) => {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

  // Add default values for progress
  const safeProgress = {
    articlesRead: [],
    quizzesCompleted: [],
    totalArticles: 0,
    totalQuizzes: 0,
    lastQuizScore: 0,
    lastReadArticle: null,
    ...progress
  };

  const averageQuizScore = safeProgress.lastQuizScore || 0;
  const completionRate = (safeProgress.articlesRead.length / safeProgress.totalArticles) * 100;
  const quizCompletionRate = (safeProgress.quizzesCompleted.length / safeProgress.totalQuizzes) * 100;

  return (
    <div className="space-y-6">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
                {safeProgress.articlesRead.length} of {safeProgress.totalArticles} articles read
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
                {safeProgress.quizzesCompleted.length} of {safeProgress.totalQuizzes} quizzes completed
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Achievements Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-yellow-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = achievement.condition(safeProgress);
            return (
              <Card 
                key={achievement.id}
                className={`bg-card/50 backdrop-blur-sm border-white/10 transition-all ${
                  isUnlocked ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {achievement.icon}
                    <span className="text-sm font-medium">{achievement.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {isUnlocked && (
                    <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Unlocked
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progress Reset Dialog */}
      <div className="mt-6 flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Progress
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Progress</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset all your progress? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Cancel</Button>
              <Button 
                variant="destructive"
                onClick={onResetProgress}
              >
                Reset Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const ArticleRecommendations = ({ currentArticle, onSelect }: {
  currentArticle: Article;
  onSelect: (article: Article) => void;
}) => {
  const recommendations = financialArticles
    .filter(article => 
      article.id !== currentArticle.id && 
      (article.category === currentArticle.category || 
       article.difficulty === currentArticle.difficulty)
    )
    .slice(0, 3);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        Recommended Articles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map(article => (
          <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(article)}>
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
        ))}
      </div>
    </div>
  );
};

// Base URL configuration
const API_CONFIG = {
  BASE_URL: 'https://upiconnect.onrender.com', // Change this to your actual API base URL
  ENDPOINTS: {
    FINLEARN: {
      PROGRESS: '/api/finlearn/progress',
      BOOKMARKS: '/api/finlearn/bookmarks'
    }
  }
};

// API endpoints
const API_ENDPOINTS = {
  GET_PROGRESS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINLEARN.PROGRESS}`,
  UPDATE_PROGRESS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINLEARN.PROGRESS}`,
  UPDATE_BOOKMARKS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINLEARN.BOOKMARKS}`
};

// API service functions
const finlearnApi = {
  getProgress: async (token: string) => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_PROGRESS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        articlesRead: [],
        quizzesCompleted: [],
        bookmarkedArticles: [],
        bookmarkCategories: {},
        lastQuizScore: 0,
        lastReadArticle: null,
        ...response.data?.data
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        articlesRead: [],
        quizzesCompleted: [],
        bookmarkedArticles: [],
        bookmarkCategories: {},
        lastQuizScore: 0,
        lastReadArticle: null
      };
    }
  },

  updateProgress: async (token: string, progress: Partial<UserProgress>) => {
    const response = await axios.patch(API_ENDPOINTS.UPDATE_PROGRESS, progress, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  },

  updateBookmarks: async (token: string, bookmarks: { bookmarkedArticles: number[], bookmarkCategories: Record<number, string> }) => {
    try {
      const response = await axios.patch(API_ENDPOINTS.UPDATE_BOOKMARKS, bookmarks, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error in updateBookmarks:', error);
      throw error;
    }
  }
};

const FinLearn = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({
    articlesRead: [],
    quizzesCompleted: [],
    totalArticles: financialArticles.length,
    totalQuizzes: financialArticles.reduce((acc, article) => acc + article.quiz.length, 0)
  });
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [selectedBookmarkCategory, setSelectedBookmarkCategory] = useState<string>('all');
  const [bookmarkCategories, setBookmarkCategories] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check authentication
  const isUserAuthenticated = () => {
    const secureData = getSecureAuthData();
    return !!(secureData && secureData.token && secureData.userData);
  };

  // Debug logging for auth state
  useEffect(() => {
    const secureData = getSecureAuthData();
    console.log('Auth State:', {
      isAuthenticated,
      user,
      secureData,
      isUserAuthenticated: isUserAuthenticated()
    });
  }, [isAuthenticated, user]);

  // Load all user data on component mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      console.log('Loading user data:', { 
        user, 
        isAuthenticated,
        isUserAuthenticated: isUserAuthenticated() 
      });

      if (!isUserAuthenticated()) {
        console.log('User not authenticated, skipping data load');
        setIsLoading(false);
        return;
      }

      try {
        const secureData = getSecureAuthData();
        const token = secureData?.token;
        console.log('Auth token:', token ? 'Present' : 'Missing');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const data = await finlearnApi.getProgress(token);
        console.log('Progress data loaded:', data);
        
        // Update all state with the fetched data
        setProgress({
          ...data,
          totalArticles: financialArticles.length,
          totalQuizzes: financialArticles.reduce((acc, article) => acc + article.quiz.length, 0)
        });
        
        setBookmarkedArticles(data.bookmarkedArticles || []);
        setBookmarkCategories(data.bookmarkCategories || {});
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load your progress', {
          description: 'Please try refreshing the page.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, isAuthenticated]);

  // Save progress whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || !isAuthenticated) return;

      try {
        const token = getSecureAuthData()?.token;
        if (!token) {
          throw new Error('No authentication token found');
        }

        await finlearnApi.updateProgress(token, {
          articlesRead: progress.articlesRead,
          quizzesCompleted: progress.quizzesCompleted,
          lastQuizScore: progress.lastQuizScore,
          lastReadArticle: progress.lastReadArticle
        });
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save your progress', {
          description: 'Please try again.',
        });
      }
    };

    saveProgress();
  }, [progress, user, isAuthenticated]);

  // Save bookmarks whenever they change
  useEffect(() => {
    const saveBookmarks = async () => {
      if (!isUserAuthenticated()) return;

      try {
        const secureData = getSecureAuthData();
        const token = secureData?.token;
        if (!token) {
          throw new Error('No authentication token found');
        }

        await finlearnApi.updateBookmarks(token, {
          bookmarkedArticles,
          bookmarkCategories
        });
      } catch (error) {
        console.error('Error saving bookmarks:', error);
        toast.error('Failed to save your bookmarks', {
          description: 'Please try again.',
        });
      }
    };

    saveBookmarks();
  }, [bookmarkedArticles, bookmarkCategories]);

  const handleArticleSelect = async (article: Article) => {
    console.log('Article select:', {
      article,
      isAuthenticated,
      user,
      secureData: getSecureAuthData(),
      isUserAuthenticated: isUserAuthenticated()
    });

    if (!isUserAuthenticated()) {
      toast.error('Please log in to track your progress', {
        description: 'Your progress will be saved once you log in.',
      });
      return;
    }

    setSelectedArticle(article);
    const secureData = getSecureAuthData();
    if (!progress.articlesRead.includes(article.id)) {
      const newProgress = {
        ...progress,
        articlesRead: [...progress.articlesRead, article.id],
        lastReadArticle: article.id
      };
      setProgress(newProgress);

      try {
        const token = secureData?.token;
        console.log('Updating progress with token:', token ? 'Present' : 'Missing');

        await finlearnApi.updateProgress(token!, {
          articlesRead: newProgress.articlesRead,
          lastReadArticle: article.id
        });

        toast.success('Article marked as read!', {
          description: 'Your progress has been updated.',
          icon: '📚'
        });
      } catch (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update progress', {
          description: 'Please try again.',
        });
      }
    }
  };

  const handleQuizComplete = async (score: number) => {
    console.log('Quiz complete:', {
      score,
      isAuthenticated,
      user,
      secureData: getSecureAuthData()
    });

    // Check if user is authenticated using secure data
    const secureData = getSecureAuthData();
    if (!secureData || !secureData.token) {
      toast.error('Please log in to track your quiz progress', {
        description: 'Your quiz results will be saved once you log in.',
      });
      return;
    }

    if (selectedArticle) {
      const newProgress = {
        ...progress,
        quizzesCompleted: [...progress.quizzesCompleted],
        lastQuizScore: score
      };

      if (score >= 80 && !newProgress.quizzesCompleted.includes(selectedArticle.id)) {
        newProgress.quizzesCompleted.push(selectedArticle.id);
        setProgress(newProgress);

        try {
          const token = secureData.token;
          console.log('Updating quiz progress with token:', token ? 'Present' : 'Missing');

          await finlearnApi.updateProgress(token, {
            quizzesCompleted: newProgress.quizzesCompleted,
            lastQuizScore: score
          });

          toast.success('Quiz completed successfully!', {
            description: `You scored ${score}%!`,
            icon: '🎯'
          });
        } catch (error) {
          console.error('Error updating quiz progress:', error);
          toast.error('Failed to save quiz results', {
            description: 'Please try again.',
          });
        }
      } else if (score < 80) {
        toast.error('Try again to improve your score!', {
          description: 'You need 80% or higher to complete the quiz.',
          icon: '📝'
        });
      }
    }
  };

  const handleBookmark = async (articleId: number) => {
    console.log('Bookmark:', {
      articleId,
      isAuthenticated,
      user,
      secureData: getSecureAuthData(),
      isUserAuthenticated: isUserAuthenticated()
    });

    // Check if user is authenticated using secure data
    const secureData = getSecureAuthData();
    if (!secureData || !secureData.token) {
      toast.error('Please log in to bookmark articles', {
        description: 'Your bookmarks will be saved once you log in.',
      });
      return;
    }

    try {
      // Update local state first
      setBookmarkedArticles(prev => {
        const isCurrentlyBookmarked = prev.includes(articleId);
        const newBookmarks = isCurrentlyBookmarked
          ? prev.filter(id => id !== articleId)
          : [...prev, articleId];
        
        // If removing bookmark, also remove its category
        if (isCurrentlyBookmarked) {
          setBookmarkCategories(prev => {
            const newCategories = { ...prev };
            delete newCategories[articleId];
            return newCategories;
          });
        }

        // Show toast notification based on the new state
        if (!isCurrentlyBookmarked) {
          toast.success('Article bookmarked!', {
            description: 'You can find it in your bookmarks.',
            icon: '🔖'
          });
        } else {
          toast.info('Article removed from bookmarks', {
            description: 'The article has been removed from your bookmarks.',
            icon: '📚'
          });
        }

        return newBookmarks;
      });

      // Update on server
      const token = secureData.token;
      await finlearnApi.updateBookmarks(token, {
        bookmarkedArticles: bookmarkedArticles.includes(articleId)
          ? bookmarkedArticles.filter(id => id !== articleId)
          : [...bookmarkedArticles, articleId],
        bookmarkCategories
      });

    } catch (error) {
      console.error('Error updating bookmarks:', error);
      toast.error('Failed to update bookmarks', {
        description: 'Please try again.',
      });
    }
  };

  const handleBookmarkCategory = async (articleId: number, category: string) => {
    const secureData = getSecureAuthData();
    if (!secureData || !secureData.token) {
      toast.error('Please log in to update bookmark categories', {
        description: 'Your changes will be saved once you log in.',
      });
      return;
    }

    try {
      // Update local state
      setBookmarkCategories(prev => ({
        ...prev,
        [articleId]: category
      }));

      // Update on server
      const token = secureData.token;
      await finlearnApi.updateBookmarks(token, {
        bookmarkedArticles,
        bookmarkCategories: {
          ...bookmarkCategories,
          [articleId]: category
        }
      });

      toast.success('Bookmark category updated!', {
        description: `Article moved to ${category}`,
        icon: '📑'
      });
    } catch (error) {
      console.error('Error updating bookmark category:', error);
      toast.error('Failed to update bookmark category', {
        description: 'Please try again.',
      });
    }
  };

  const handleShare = (article: Article) => {
    // Create shareable link
    const shareUrl = `${window.location.origin}/finlearn/article/${article.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Link copied to clipboard!', {
        description: 'Share this link with others.',
        icon: '🔗'
      });
    }).catch(() => {
      toast.error('Failed to copy link', {
        description: 'Please try again.',
        icon: '❌'
      });
    });
  };

  const handleResetProgress = async () => {
    const secureData = getSecureAuthData();
    if (!secureData || !secureData.token) {
      toast.error('Please log in to reset your progress', {
        description: 'You need to be logged in to reset progress.',
      });
      return;
    }

    try {
      // Reset local state
      const resetProgress = {
        articlesRead: [],
        quizzesCompleted: [],
        totalArticles: progress.totalArticles,
        totalQuizzes: progress.totalQuizzes,
        lastQuizScore: 0,
        lastReadArticle: null
      };

      // Update API
      await finlearnApi.updateProgress(secureData.token, resetProgress);

      // Update local state
      setProgress(resetProgress);
      setBookmarkedArticles([]);
      setBookmarkCategories({});

      toast.success('Progress reset successfully', {
        description: 'All your progress has been reset.',
        icon: '🔄'
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress', {
        description: 'Please try again.',
      });
    }
  };

  const filteredArticles = financialArticles
    .map(article => ({
      ...article,
      isBookmarked: bookmarkedArticles.includes(article.id),
      bookmarkCategory: bookmarkCategories[article.id] || 'favorites'
    }))
    .filter(article => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.keyTakeaways.some(takeaway => 
          takeaway.toLowerCase().includes(searchLower)
        );
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesBookmarkCategory = selectedBookmarkCategory === 'all' || 
        (article.isBookmarked && article.bookmarkCategory === selectedBookmarkCategory);
      
      return matchesSearch && matchesCategory && matchesBookmarkCategory;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container px-4 mx-auto py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="font-poppins font-bold text-4xl mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            FinLearn Financial Education
          </h1>
          <p className="text-muted-foreground text-lg">Master your financial future with our comprehensive learning platform</p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Learning Progress</CardTitle>
                  <CardDescription>Track your journey to financial literacy</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowBookmarks(!showBookmarks)}
                >
                  <Bookmark className="h-4 w-4" />
                  {showBookmarks ? 'Show All Articles' : 'Show Bookmarks'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressStats progress={progress} onResetProgress={handleResetProgress} />
            </CardContent>
          </Card>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder={showBookmarks ? "Search bookmarked articles..." : "Search articles by title, content, or key takeaways..."} 
              className="pl-10 bg-white/5 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Bookmark Categories */}
        {showBookmarks && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedBookmarkCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBookmarkCategory('all')}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {Object.entries(bookmarkCategories).map(([id, name]) => (
                <Button
                  key={id}
                  variant={selectedBookmarkCategory === id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBookmarkCategory(id)}
                  className="whitespace-nowrap"
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4 overflow-x-auto pb-2">
            <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
            <TabsTrigger value="budgeting" className="whitespace-nowrap">Budgeting</TabsTrigger>
            <TabsTrigger value="banking" className="whitespace-nowrap">Banking</TabsTrigger>
            <TabsTrigger value="insurance" className="whitespace-nowrap">Insurance</TabsTrigger>
            <TabsTrigger value="credit" className="whitespace-nowrap">Credit</TabsTrigger>
            <TabsTrigger value="investment" className="whitespace-nowrap">Investment</TabsTrigger>
            <TabsTrigger value="taxes" className="whitespace-nowrap">Taxes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showBookmarks ? filteredArticles.filter(article => article.isBookmarked) : filteredArticles)
                .map(article => (
                  <ArticleCard 
                    key={article.id}
                    article={article}
                    onSelect={handleArticleSelect}
                    onBookmark={handleBookmark}
                  />
                ))}
            </div>
          </TabsContent>
          
          {['budgeting', 'banking', 'insurance', 'credit', 'investment', 'taxes'].map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showBookmarks ? filteredArticles.filter(article => article.isBookmarked) : filteredArticles)
                  .filter(article => article.category === category)
                  .map(article => (
                    <ArticleCard 
                      key={article.id}
                      article={article}
                      onSelect={handleArticleSelect}
                      onBookmark={handleBookmark}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <AnimatePresence>
          {selectedArticle && (
            <ArticleView 
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
              onQuizComplete={handleQuizComplete}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          )}
        </AnimatePresence>

        <Footer />
      </main>
    </div>
  );
};

export default FinLearn;
