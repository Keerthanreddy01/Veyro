import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, Filter } from 'lucide-react';
import api from '../api/axios';

const CourseCard = ({ course }) => (
  <Link to={`/courses/${course._id}`}
    className="card p-0 overflow-hidden hover:border-brand-600/40 hover:-translate-y-1 transition-all duration-200 group block">
    <div className="w-full h-44 bg-gradient-to-br from-brand-900/60 to-purple-900/40 flex items-center justify-center overflow-hidden">
      {course.thumbnail
        ? <img src={`/static/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        : <BookOpen size={40} className="text-brand-400/50" />}
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-brand-400 bg-brand-900/40 px-2.5 py-1 rounded-full">{course.category}</span>
      </div>
      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2 mb-1">{course.title}</h3>
      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{course.description}</p>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Users size={12} />{course.instructorId?.name}</span>
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
      setCourses(data.courses);
      setTotalPages(data.pages);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(search, 1);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Explore <span className="bg-brand-gradient bg-clip-text text-transparent">Courses</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">Discover world-class courses taught by expert instructors</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-11" placeholder="Search courses…" />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No courses found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => { setPage(i + 1); fetchCourses(search, i + 1); }}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                ${page === i + 1 ? 'bg-brand-600 text-white shadow-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
