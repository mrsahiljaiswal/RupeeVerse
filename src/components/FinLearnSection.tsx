import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type CourseCardProps = {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  completedLessons?: number;
  totalLessons: number;
  className?: string;
};

const CourseCard = ({ 
  title, 
  description, 
  level, 
  duration, 
  completedLessons, 
  totalLessons,
  className 
}: CourseCardProps) => {
  const isStarted = completedLessons !== undefined && completedLessons > 0;
  const progress = isStarted ? (completedLessons / totalLessons) * 100 : 0;
  
  return (
    <div className={cn("card-gradient rounded-2xl overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-poppins font-medium text-xl mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <div className="badge badge-purple">{level}</div>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{totalLessons} Lessons</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{duration}</span>
          </div>
        </div>
        
        {isStarted ? (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span>{completedLessons}/{totalLessons} Lessons</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full purple-gradient rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : null}
        
        <a 
          href="https://www.youtube.com/@varsitybyzerodha" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full"
        >
          <Button className={isStarted ? "w-full" : "w-full purple-gradient"}>
            {isStarted ? "Continue Learning" : "Start Learning"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
};

const FinLearnSection = () => {
  const courses = [
    {
      title: "Basics of Money Management",
      description: "Learn how to budget, save, and manage your personal finances.",
      level: "Beginner" as const,
      duration: "2 hours",
      completedLessons: 3,
      totalLessons: 8,
    },
    {
      title: "Understanding Loans & Interest",
      description: "Know how loans work, how interest is calculated, and how to repay efficiently.",
      level: "Beginner" as const,
      duration: "1.5 hours",
      totalLessons: 6,
    },
    {
      title: "Digital Banking Safety",
      description: "Protect yourself while using digital banking services and avoid scams.",
      level: "Intermediate" as const,
      duration: "3 hours",
      totalLessons: 10,
    },
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard 
            key={index}
            title={course.title}
            description={course.description}
            level={course.level}
            duration={course.duration}
            completedLessons={course.completedLessons}
            totalLessons={course.totalLessons}
          />
        ))}
      </div>
      
      <div className="mt-12 card-gradient rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl green-gradient flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-poppins font-medium text-2xl mb-2">Improve Your Financial Health</h3>
          <p className="text-muted-foreground mb-4 md:mb-0">
            Access personalized financial literacy courses designed for rural communities. All content available offline.
          </p>
        </div>
        
        <Link to="/finlearn">
          <Button className="green-gradient md:self-center">
            Explore All Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FinLearnSection;
