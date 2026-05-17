import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Zap, Shield, BarChart3, ChevronRight, BookOpen } from 'lucide-react';
import { useExams } from '../hooks/useExams';

export default function LandingPage() {
  const navigate = useNavigate();
  const [roll, setRoll] = useState('');
  const [examId, setExamId] = useState('');
  const { data: examsData } = useExams({ status: 'published', limit: 50 });
  const exams = examsData?.exams || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!roll.trim() || !examId) return;
    navigate(`/result?roll=${roll.trim().toUpperCase()}&exam=${examId}`);
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Redis-cached results served in <100ms even under 5,000 concurrent hits', color: 'bg-amber-50 text-amber-600' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'JWT auth, bcrypt hashing, rate limiting, and MongoDB replica set', color: 'bg-green-50 text-green-600' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time GPA distributions, pass rates, and department insights', color: 'bg-purple-50 text-purple-600' },
    { icon: BookOpen, title: 'PDF Marksheets', desc: 'Auto-generated PDF marksheets stored on S3 for instant download', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ResultMS</span>
        </div>
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors font-medium"
        >
          Admin Panel <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-16 pb-24 lg:pt-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-200 text-sm font-medium mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          Handles 5,000+ concurrent students
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
          Check Your{' '}
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Academic Results
          </span>
        </h1>
        <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mb-12 animate-fade-in">
          Enter your roll number and select your exam to instantly view your grades, GPA, rank, and download your official marksheet PDF.
        </p>

        {/* Search Card */}
        <div className="w-full max-w-2xl animate-slide-up">
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary-200 mb-2">Roll Number</label>
              <input
                id="roll-input"
                type="text"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="e.g. CSE-2021-001"
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-200 mb-2">Select Exam / Semester</label>
              <select
                id="exam-select"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              >
                <option value="" disabled className="text-slate-800">— Select an exam —</option>
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id} className="text-slate-800">
                    {ex.name} · {ex.semester} · {ex.dept}
                  </option>
                ))}
                {exams.length === 0 && (
                  <option disabled className="text-slate-800">No published exams yet</option>
                )}
              </select>
            </div>
            <button
              id="search-btn"
              type="submit"
              disabled={!roll.trim() || !examId}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-glow hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
            >
              <Search className="w-5 h-5" />
              Search Result
            </button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-50 py-24 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Built for Scale & Speed</h2>
          <p className="text-center text-slate-500 mb-16">Enterprise-grade infrastructure powering thousands of simultaneous result lookups</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Result Management System · Built with React, Node.js, MongoDB & Redis</p>
      </div>
    </div>
  );
}
