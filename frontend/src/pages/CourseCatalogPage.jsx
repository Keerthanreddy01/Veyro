import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, ArrowRight, Sparkles, Compass } from 'lucide-react';
import api from '../api/axios';

const CourseCard = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between"
  >
    <div>
      {/* Thumbnail */}
      <div className="w-full h-44 bg-gradient-to-br from-[#e0e7ff] to-[#f3e8ff] rounded-2xl flex items-center justify-center overflow-hidden mb-4 shadow-inner">
        {course.thumbnail ? (
          <img
            src={`/static/${course.thumbnail}`}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center text-indigo-600 shadow-xs">
            <BookOpen size={28} />
          </div>
        )}
      </div>

      {/* Category Pill + Level */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-bold text-sky-950 bg-[#d6ecff] px-3 py-1 rounded-full">
          {course.category || 'General'}
        </span>
        {course.level && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {course.level}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
        {course.title}
      </h3>
      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
        {course.description || 'Comprehensive learning modules with video lessons, resource attachments, and quizzes.'}
      </p>
    </div>

    {/* Footer Info */}
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
        <Users size={13} className="text-slate-400" />
        <span className="truncate max-w-[120px]">{course.instructorId?.name || 'Veyro Faculty'}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-extrabold text-slate-900 text-xs">
          {course.price ? `$${course.price}` : 'Free'}
        </span>
        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  </Link>
);

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async (q = '', p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (q) params.set('search', q);
      const { data } = await api.get(`/courses?${params}`);
      setCourses(data.courses || []);
      setTotalPages(data.pages || 1);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(search, 1);
  };

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700 mb-3">
            <Compass size={13} className="text-indigo-600" />
            <span>Course Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Courses
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Discover structured curricula, interactive video lectures, and anti-cheat assessments taught by verified instructors.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium rounded-full pl-11 pr-4 py-3.5 shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              placeholder="Search by course title or keyword…"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            Search
          </button>
        </form>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] h-80 animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center max-w-lg mx-auto shadow-sm border border-slate-200/80 my-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <BookOpen size={30} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">No courses found</h3>
            <p className="text-slate-500 text-xs mt-1 mb-5">
              Try searching with another keyword or explore newly added curricula.
            </p>
            {search && (
              <button
                onClick={() => { setSearch(''); fetchCourses('', 1); }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setPage(i + 1); fetchCourses(search, i + 1); }}
                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  page === i + 1
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
