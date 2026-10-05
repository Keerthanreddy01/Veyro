import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Compass,
  Layers,
  GraduationCap,
  ShieldCheck,
  Filter,
  CheckCircle2
} from 'lucide-react';
import api from '../api/axios';

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
];

const CourseCard = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="bg-white rounded-3xl border border-[#111111]/15 p-5 shadow-xs hover:shadow-md hover:border-[#111111]/40 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between"
  >
    <div>
      {/* Thumbnail Container */}
      <div className="w-full h-44 bg-gradient-to-br from-[#FAF7EE] to-[#ebf6fc] rounded-2xl flex items-center justify-center overflow-hidden mb-4 relative border border-[#111111]/10">
        {course.thumbnail ? (
          <img
            src={`/static/${course.thumbnail}`}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-black/10 flex items-center justify-center text-[#111111]">
              <BookOpen size={24} className="text-[#60C5F1]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-syne">Veyro Curriculum</span>
          </div>
        )}

        {/* Verified Anti-Cheat Proctor Tag */}
        <div className="absolute top-2.5 right-2.5 bg-[#FAF7EE]/95 backdrop-blur-xs border border-[#111111]/15 rounded-full px-2.5 py-0.5 flex items-center gap-1 shadow-2xs">
          <ShieldCheck size={11} className="text-emerald-700" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#111111]">Verified</span>
        </div>
      </div>

      {/* Category Pill + Level */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111] bg-[#FFF490] border border-[#111111]/20 px-2.5 py-0.5 rounded-full">
          {course.category || 'General'}
        </span>
        {course.level && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {course.level}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-syne font-bold text-[#111111] text-lg leading-snug group-hover:text-[#111111] transition-colors line-clamp-2 mb-2">
        {course.title}
      </h3>
      <p className="text-[#111111]/60 text-xs line-clamp-2 leading-relaxed mb-4 font-body">
        {course.description || 'Master core subject fundamentals through video streaming and anti-cheat quizzes.'}
      </p>
    </div>

    {/* Footer Meta */}
    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-600 font-medium">
        <div className="w-6 h-6 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center text-[10px] font-bold text-[#111111]">
          {course.instructorId?.name ? course.instructorId.name[0].toUpperCase() : 'V'}
        </div>
        <span className="truncate max-w-[110px] text-xs font-semibold text-slate-800">
          {course.instructorId?.name || 'Veyro Faculty'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-extrabold text-slate-900 text-xs px-2 py-0.5 rounded-md bg-slate-100">
          {course.price ? `$${course.price}` : 'Free'}
        </span>
        <span className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center group-hover:bg-[#60C5F1] group-hover:text-[#111111] transition-colors shadow-2xs">
          <ArrowRight size={13} />
        </span>
      </div>
    </div>
  </Link>
);

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async (q = '', cat = 'All', p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 9 });
      if (q) params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      const { data } = await api.get(`/courses?${params}`);
      setCourses(data.courses || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(search, selectedCategory, 1);
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(search, selectedCategory, 1);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#111111] animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Editorial Top Banner */}
        <div className="bg-white rounded-[2.5rem] border border-[#111111]/15 p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#60C5F1]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#FFF490]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#111111]">
              <Sparkles size={13} className="text-[#111111]" />
              <span>Verified Academy Catalog</span>
            </div>

            <h1 className="font-syne font-extrabold text-3xl sm:text-5xl text-[#111111] tracking-tight leading-[1.05] uppercase">
              Curated Courses for High-Caliber Learners.
            </h1>

            <p className="text-[#111111]/70 text-sm sm:text-base leading-relaxed font-body">
              Explore accredited technical curricula with real watch auditing, anti-cheat assessments, and cryptographic completion credentials.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
            
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white text-[#111111] placeholder:text-[#111111]/40 text-sm font-medium rounded-full pl-11 pr-4 py-3 border-2 border-[#111111] outline-none focus:ring-2 focus:ring-[#60C5F1]/40 transition-all shadow-brutal-sm"
                  placeholder="Search by title, topic, or instructor…"
                />
              </div>
              <button
                type="submit"
                className="btn-dark-pill px-5 py-3 text-xs"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Quick Status / Total Counts */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]/60">
              <span className="w-2 h-2 rounded-full bg-[#60C5F1]" />
              <span>{courses.length} Active Courses Available</span>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-180 border ${
                  active
                    ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                    : 'bg-white text-slate-700 border-[#111111]/15 hover:bg-[#FAF7EE] hover:border-[#111111]/30'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-96 animate-pulse border border-[#111111]/10 p-5 space-y-4"
              >
                <div className="w-full h-44 bg-slate-100 rounded-2xl" />
                <div className="w-1/3 h-5 bg-slate-100 rounded-full" />
                <div className="w-3/4 h-6 bg-slate-100 rounded-md" />
                <div className="w-full h-10 bg-slate-100 rounded-md" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center max-w-lg mx-auto border border-[#111111]/15 shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF7EE] border border-[#111111]/15 flex items-center justify-center text-slate-400 mx-auto">
              <BookOpen size={28} className="text-[#60C5F1]" />
            </div>
            <div>
              <h3 className="font-syne font-extrabold text-slate-900 text-xl">No Courses Found</h3>
              <p className="text-slate-500 text-xs mt-1">
                We couldn't find any courses matching "{search || selectedCategory}". Try clearing your filters or exploring another topic.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                fetchCourses('', 'All', 1);
              }}
              className="btn-dark-pill text-xs px-5 py-2.5"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                  fetchCourses(search, selectedCategory, i + 1);
                }}
                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                  page === i + 1
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#111111]/15'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
