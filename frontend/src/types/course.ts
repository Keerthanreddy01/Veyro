export type CourseStatus = 'draft' | 'under_review' | 'published' | 'rejected';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type LessonType = 'video' | 'pdf' | 'text';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Lesson {
  _id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  contentUrl?: string;
  textContent?: string;
  durationSeconds?: number;
  order: number;
  summary?: string;
  isPreview?: boolean;
}

export interface QuizQuestion {
  _id?: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number; // Redacted for students
  timeLimitSeconds?: number;
}

export interface Quiz {
  _id: string;
  moduleId: string;
  title: string;
  passingScore?: number;
  timeLimitSeconds?: number;
  questions?: QuizQuestion[];
  isLocked?: boolean;
}

export interface Module {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: Lesson[];
  quiz?: Quiz | null;
}

export interface InstructorRef {
  _id: string;
  name: string;
  email: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructorId: InstructorRef | string;
  category: string;
  level?: CourseLevel;
  targetGrade?: string;
  price?: number;
  learningObjectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  thumbnail?: string;
  status: CourseStatus;
  rejectionReason?: string;
  version?: number;
  parentCourseId?: string;
  previousVersionId?: string;
  lessonsCount?: number;
  studentsEnrolled?: number;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
}

export interface Enrollment {
  _id: string;
  courseId: Course;
  studentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  progressPercentage?: number;
  certificateCode?: string;
  certificateIssuedAt?: string;
}

export interface CourseProgress {
  percentage: number;
  completed: number;
  total: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastPosition: number;
}

export interface QuizSubmission {
  _id: string;
  student?: { _id: string; name: string; email: string };
  score: number;
  passed: boolean;
  tabViolations: number;
  autoSubmitted: boolean;
  autoSubmitReason?: string | null;
  startedAt: string;
  submittedAt: string;
}

export interface CourseStudent {
  _id: string;
  name: string;
  email: string;
  enrolledAt: string;
  status: string; // 'active' | 'completed' | 'dropped'
  progressPercent: number;
  lessonsCompleted: number;
  quizzesAttempted?: number;
  quizAverage?: number;
  lastActivity?: string;
  certificateCode?: string;
}

export interface CourseAnalyticsData {
  course: {
    _id: string;
    title: string;
    status: string;
    totalLessons: number;
    totalQuizzes: number;
  };
  metrics: {
    totalEnrolled: number;
    activeLearners: number;
    completedStudents: number;
    completionRate: number;
    avgCourseProgress: number;
    avgQuizScore: number;
  };
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    lessonsCount: number;
    quiz?: { _id: string; title: string; passingScore: number } | null;
  }>;
  students: CourseStudent[];
}
