import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, BookOpen, TrendingUp, Award, Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

type Course = {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  completedLessons?: number;
  image: string;
};

type FilterLevel = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

const CourseCard = ({ course }: { course: Course }) => {
  const isStarted = course.completedLessons !== undefined;
  const progress = isStarted ? (course.completedLessons! / course.lessons) * 100 : 0;
  
  return (
    <div className="card-gradient rounded-2xl overflow-hidden">
      <div className="aspect-video bg-muted/20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="icon" className="rounded-full bg-primary/90 hover:bg-primary">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{course.title}</h3>
          <div className={`badge ${course.level === 'Beginner' ? 'badge-green' : 'badge-purple'}`}>
            {course.level}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{course.lessons} Lessons</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{course.duration}</span>
          </div>
        </div>
        
        {isStarted && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span>{course.completedLessons}/{course.lessons} Lessons</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full purple-gradient rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <a 
          href="https://www.youtube.com/@varsitybyzerodha" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className={isStarted ? "w-full" : "w-full purple-gradient"}>
            {isStarted ? "Continue Learning" : "Start Course"}
          </Button>
        </a>
      </div>
    </div>
  );
};

const FinLearn = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('All');
  
  const courses: Course[] = [
    {
      id: 1,
      title: "Basics of Money Management",
      description: "Learn how to budget, save, and manage your finances effectively.",
      level: "Beginner",
      duration: "2 hours",
      lessons: 8,
      completedLessons: 3,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Understanding Loans & Interest",
      description: "Know how loans work and how interest is calculated.",
      level: "Beginner",
      duration: "1.5 hours",
      lessons: 6,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Digital Banking Safety",
      description: "Protect yourself while using digital banking and avoid scams.",
      level: "Intermediate",
      duration: "3 hours",
      lessons: 10,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Savings & Investments",
      description: "Learn strategies to grow your wealth over time.",
      level: "Intermediate",
      duration: "4 hours",
      lessons: 12,
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Rural Financial Planning",
      description: "Financial planning specifically for agricultural communities.",
      level: "Beginner",
      duration: "2.5 hours",
      lessons: 8,
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Government Schemes & Benefits",
      description: "Learn about government financial assistance programs.",
      level: "Beginner",
      duration: "2 hours",
      lessons: 7,
      image: "/placeholder.svg"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'All' || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

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
          <h1 className="font-poppins font-bold text-3xl mb-2">FinLearn Financial Education</h1>
          <p className="text-muted-foreground">Improve your financial knowledge with our courses</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-3/4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search for courses..." 
                className="pl-10 bg-white/5 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="md:w-1/4">
            <select 
              className="w-full h-10 px-4 rounded-md bg-white/5 border border-white/10 text-foreground"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="mb-12">
          <div className="card-gradient rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl green-gradient flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-poppins font-medium text-2xl mb-2">Your Learning Journey</h2>
              <p className="text-muted-foreground">Track your progress and earn certificates as you learn financial skills.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-medium">1 Certificate Earned</span>
              </div>
              <p className="text-sm text-muted-foreground">3/24 Lessons Completed</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="font-poppins font-semibold text-2xl mb-6">Recommended Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 3).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="font-poppins font-semibold text-2xl mb-6">All Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FinLearn;
