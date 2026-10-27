export type CourseStatus = 'draft' | 'under_review' | 'pending' | 'approved' | 'published' | 'rejected';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type LessonType = 'video' | 'pdf' | 'text';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Lesson {
  _id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  contentUrl?: string;
  videoUrl?: string;
  videoURL?: string;
  video?: string;
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
  maxAttempts?: number;
  questions?: QuizQuestion[];
  isLocked?: boolean;
  isProctored?: boolean;
  requireCamera?: boolean;
  maxTabViolations?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  questionPoolSize?: number;
}

export interface Module {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: Lesson[];
  quiz?: Quiz | null;
  quizzes?: Quiz[];
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
  isEligibleForCertificate?: boolean;
  totalLessons?: number;
  completedLessons?: number;
  totalQuizzes?: number;
  quizzesPassed?: number;
}

export interface CourseProgress {
  percentage: number;
  completed: number;
  total: number;
  totalQuizzes?: number;
  quizzesPassed?: number;
  isEligibleForCertificate?: boolean;
  enrollmentStatus?: string;
  certificateCode?: string | null;
  completedAt?: string | null;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastPosition: number;
  watchedRanges?: Array<{ start: number; end: number }>;
}

export interface IntegrityEvent {
  eventType: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | 'violation';
  description: string;
}

export interface QuizSubmission {
  _id: string;
  student?: { _id: string; name: string; email: string };
  score: number;
  passed: boolean;
  tabViolations: number;
  cameraViolations?: number;
  integrityEvents?: IntegrityEvent[];
  autoSubmitted: boolean;
  autoSubmitReason?: string | null;
  reviewStatus?: 'cleared' | 'flagged' | 'pending_review' | 'verified';
  instructorNotes?: string;
  reviewedBy?: { _id: string; name: string; email: string } | null;
  reviewedAt?: string | null;
  isProctored?: boolean;
  requireCamera?: boolean;
  maxViolationsAllowed?: number;
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

// ── Learning Reels Interfaces ────────────────────────────────────────────────
export interface ReelSection {
  heading?: string;
  body: string;
  visualPrompt?: string;
  duration?: number;
}

export interface ReelCaption {
  start: number;
  end: number;
  text: string;
}

export interface ReelQuickQuestion {
  questionText: string;
  question?: string;
  options: string[];
  correctOptionIndex?: number;
  correctIndex?: number;
  explanation?: string;
}

export interface ReelProgressData {
  watched: boolean;
  completed: boolean;
  quizAnswered: boolean;
  quizCorrect: boolean;
  selectedOptionIndex?: number;
}

export interface Reel {
  _id: string;
  courseId: Course | { _id: string; title: string; category?: string; level?: string; thumbnail?: string };
  moduleId?: string;
  lessonId?: Lesson | { _id: string; title: string; type?: string; durationSeconds?: number };
  instructorId: InstructorRef | { _id: string; name: string };
  title: string;
  concept: string;
  order: number;
  durationSeconds: number;
  status: 'draft' | 'processing' | 'review' | 'published' | 'failed';
  isPublished?: boolean;
  generationError?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  script: {
    hook: string;
    sections: ReelSection[];
    summary: string;
    coreExplanation?: string;
    practicalApplication?: string;
  };
  captions: ReelCaption[];
  takeaways: string[];
  quickQuestion?: ReelQuickQuestion;
  viewsCount: number;
  completionsCount: number;
  quizAttemptsCount: number;
  quizPassCount: number;
  tags?: string[];
  progress?: ReelProgressData | null;
  createdAt?: string;
  updatedAt?: string;
}
