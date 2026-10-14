import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Course } from '../types/course';

const CATEGORIES = [
  'All',
  'Programming',
  'Design',
  'Business',
  'Mathematics',
  'Science',
  'Engineering',
  'Language',
  'Arts',
] as const;

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="bg-white rounded-2xl border border-[#E7E2DA] p-5 shadow-subtle hover:border-[#A99B8A] hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
  >
    <div>
      {/* Thumbnail or Icon Banner */}
      <div className="w-full h-44 bg-[#F6F2EC] rounded-xl flex items-center justify-center overflow-hidden mb-4 relative border border-[#E7E2DA]">
        {course.thumbnail ? (
          <img
            src={`/static/${course.thumbnail}`}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[#77736D]">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E7E2DA] flex items-center justify-center text-[#171717]">
              <BookOpen size={20} className="text-[#6F8FA8]" />
            </div>
            <span className="text-[11px] font-medium text-[#77736D] font-sans">
              Veyro Curriculum
            </span>
          </div>
        )}

        {/* Verified Badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge variant="verified" icon={<ShieldCheck size={12} />}>
            Audited
          </Badge>
        </div>
      </div>

      {/* Category & Level */}
      <div className="flex items-center gap-2 mb-2.5">
        <Badge variant="neutral">{course.category || 'General'}</Badge>
        {course.level && <Badge variant="draft">{course.level}</Badge>}
      </div>

      {/* Title & Description */}
      <h3 className="font-sans font-semibold text-[#171717] text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-[#6F8FA8] transition-colors">
        {course.title}
      </h3>
      <p className="text-[#77736D] text-xs line-clamp-2 leading-relaxed font-sans mb-4">
        {course.description || 'Master core concepts through structured lessons and verified assessments.'}
      </p>
    </div>

    {/* Footer Meta */}
    <div className="pt-3 border-t border-[#E7E2DA]/60 flex items-center justify-between text-xs text-[#77736D] font-sans">
      <span className="flex items-center gap-1">
        <Clock size={12} />
        <span>Self-paced</span>
      </span>
      <span className="text-[#171717] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
        <span>View course</span>
        <ArrowRight size={12} />
      </span>
    </div>
  </Link>
);

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === 'published' || !c.status);

  const filtered = published.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-8 sm:py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77736D]">
            <Compass size={14} className="text-[#6F8FA8]" />
            <span>Curriculum Catalog</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal leading-tight tracking-tight">
            Explore Accredited Courses
          </h1>
          <p className="text-sm text-[#77736D] leading-relaxed">
            Every course features server-audited video watch time, anti-cheat assessments, and cryptographic completion certificates.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search courses by title, topic, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search size={15} />}
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#171717] text-white shadow-2xs'
                    : 'bg-white text-[#77736D] border border-[#E7E2DA] hover:text-[#171717] hover:border-[#A99B8A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E2DA] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] flex items-center justify-center mx-auto text-[#A99B8A]">
              <BookOpen size={20} />
            </div>
            <h3 className="font-serif text-lg text-[#171717]">No courses found</h3>
            <p className="text-xs text-[#77736D] max-w-sm mx-auto">
              We couldn't find any courses matching your search. Try resetting your category filter or search query.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
