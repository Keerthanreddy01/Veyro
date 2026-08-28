import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, ArrowRight, Sparkles, Compass, Layers } from 'lucide-react';
import api from '../api/axios';

const CourseCard = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="bg-[#aee5f8] rounded-[20px] border-2 border-[#282724] p-4 shadow-[2px_3px_0_#282724] hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
  >
    <div>
      {/* Thumbnail */}
      <div className="w-full h-36 bg-white/40 rounded-xl flex items-center justify-center overflow-hidden mb-4">
        {course.thumbnail ? (
          <img
            src={`/static/${course.thumbnail}`}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center text-slate-900 shadow-xs">
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
      <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-[#e86b51] transition-colors line-clamp-2 mb-1.5">
        {course.title}
      </h3>
      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
        {course.description || 'Comprehensive learning modules with video lessons, resource attachments, and quizzes.'}
      </p>
    </div>

    {/* Footer Info */}
    <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
        <Users size={13} className="text-slate-400" />
        <span className="truncate max-w-[120px]">{course.instructorId?.name || 'Veyro Faculty'}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-extrabold text-slate-900 text-xs">
          {course.price ? `$${course.price}` : 'Free'}
        </span>
        <span className="w-7 h-7 rounded-full bg-[#ff6847] text-white flex items-center justify-center transition-colors">
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
    <div className="min-h-screen bg-[#b9d1dc] text-slate-800 animate-fade-in">
      <div className="min-h-screen w-full overflow-hidden bg-[#f8f8f6]">
        <header className="flex h-16 items-center justify-between bg-[#2e2d2a] px-5 text-white sm:px-8">
          <Link to="/dashboard" className="font-serif text-xl font-semibold italic tracking-tight">Veyro</Link>
          <nav className="hidden items-center gap-2 sm:flex"><Link to="/dashboard" className="rounded-lg px-4 py-2 text-xs text-white/65 hover:bg-white/10">My courses</Link><Link to="/courses" className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold">Browse courses</Link></nav>
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1cc68] text-xs font-bold text-slate-900">U</div><span className="hidden text-xs font-semibold sm:block">Veyro learner</span></div>
        </header>
        <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[58px_minmax(0,1fr)]">
          <aside className="hidden flex-col items-center gap-4 bg-[#2e2d2a] py-6 text-white/75 lg:flex"><Link to="/dashboard" className="rounded-md p-2 hover:bg-white/10" title="Dashboard"><Layers size={17} /></Link><button className="rounded-md bg-[#ffda55] p-2 text-slate-900" title="Browse courses"><BookOpen size={17} /></button><button className="rounded-md p-2 hover:bg-white/10" title="Saved courses"><Compass size={17} /></button><button className="mt-auto rounded-md p-2 hover:bg-white/10" title="Schedule"><Clock size={17} /></button></aside>
          <main className="bg-[#f8f8f6] p-5 sm:p-8">
        
        <div className="mb-5"><p className="text-xs text-slate-500">Welcome to <span className="font-bold text-[#ee6b4d]">Veyro</span></p><h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Browse courses</h1></div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium rounded-lg pl-11 pr-4 py-3 shadow-sm border border-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              placeholder="Search courses"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#ff6847] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Course Grid */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

          </main>
        </div>
      </div>
    </div>
  );
}
