import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useResult } from '../hooks/useResult';
import {
  GraduationCap, Download, ArrowLeft, Search,
  Trophy, CheckCircle2, XCircle, User, BookOpen, Hash
} from 'lucide-react';

const GRADE_COLORS = {
  'A+': 'bg-green-100 text-green-700', A: 'bg-green-100 text-green-600',
  'A-': 'bg-emerald-100 text-emerald-600', 'B+': 'bg-blue-100 text-blue-700',
  B: 'bg-blue-100 text-blue-600', 'B-': 'bg-sky-100 text-sky-600',
  'C+': 'bg-amber-100 text-amber-600', C: 'bg-amber-100 text-amber-500',
  D: 'bg-orange-100 text-orange-600', F: 'bg-red-100 text-red-700',
};

function GPACircle({ gpa }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = ((gpa / 4) * 100 / 100) * circ;
  const color = gpa >= 3.5 ? '#16a34a' : gpa >= 2.5 ? '#2563eb' : gpa >= 2 ? '#f59e0b' : '#dc2626';
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900">{gpa.toFixed(2)}</span>
        <span className="text-xs text-slate-500 font-medium">SGPA</span>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roll = params.get('roll') || '';
  const examId = params.get('exam') || '';
  const { data, isLoading, isError, error } = useResult(roll, examId, !!(roll && examId));

  if (!roll || !examId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-4">No search parameters found</h2>
          <Link to="/" className="btn-primary">Back to Search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-slate-800">ResultMS</span>
          </div>
          <span className="ml-auto text-sm text-slate-500">Roll: <strong className="text-slate-800">{roll}</strong></span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="space-y-4">
            {[48, 32, 96].map((h) => (
              <div key={h} className={`h-${h} skeleton`} />
            ))}
          </div>
        )}

        {isError && (
          <div className="card p-12 text-center animate-fade-in">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Result Not Found</h2>
            <p className="text-slate-500 mb-6">{error?.response?.data?.error || 'No result found for this roll number and exam.'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Search
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-slide-up">
            {/* Header card */}
            <div className="card overflow-hidden">
              <div className="bg-hero-gradient p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-primary-200 text-sm mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {data.exam?.name} · {data.exam?.semester} · {data.exam?.dept}
                    </p>
                    <h1 className="text-3xl font-extrabold">{data.student?.name}</h1>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold self-start ${
                    data.result?.status === 'pass' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                  }`}>
                    {data.result?.status === 'pass' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {data.result?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Hash, label: 'Roll Number', value: data.student?.rollNo },
                  { icon: User, label: 'Batch', value: data.student?.batch },
                  { icon: Trophy, label: 'Class Rank', value: data.result?.rank ? `#${data.result.rank}` : 'N/A' },
                  { icon: BookOpen, label: 'Total Credit', value: data.result?.totalCredit ?? '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-semibold text-slate-800 text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GPA + Grade distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 flex flex-col items-center justify-center">
                <GPACircle gpa={data.result?.gpa || 0} />
                <p className="text-slate-500 text-sm mt-2">out of 4.00</p>
              </div>
              <div className="md:col-span-2 card p-6">
                <h3 className="font-bold text-slate-700 mb-4">Grade Distribution</h3>
                <div className="space-y-2">
                  {['A+','A','A-','B+','B','B-','C+','C','D','F'].map((g) => {
                    const count = data.result?.subjects?.filter((s) => s.grade === g).length || 0;
                    if (!count) return null;
                    const total = data.result?.subjects?.length || 1;
                    return (
                      <div key={g} className="flex items-center gap-3">
                        <span className={`w-10 h-7 rounded-md text-xs font-bold flex items-center justify-center ${GRADE_COLORS[g]}`}>{g}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subject table */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Course Results</h3>
                {data.result?.pdfUrl && (
                  <a id="download-pdf-btn" href={data.result.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                )}
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>#</th><th>Code</th><th>Course Title</th><th>Credit</th><th>Marks</th><th>Grade</th><th>Grade Point</th></tr>
                  </thead>
                  <tbody>
                    {data.result?.subjects?.map((s, i) => (
                      <tr key={i}>
                        <td className="text-slate-400">{i + 1}</td>
                        <td className="font-mono text-xs text-slate-500">{s.code || '—'}</td>
                        <td className="font-medium">{s.name}</td>
                        <td>{s.credit?.toFixed(2)}</td>
                        <td>{s.marks}/{s.total}</td>
                        <td><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${GRADE_COLORS[s.grade] || 'bg-slate-100 text-slate-600'}`}>{s.grade}</span></td>
                        <td className="font-semibold">{s.gradePoint?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-700">
                      <td colSpan={3} className="px-4 py-3 text-right">Total Credit</td>
                      <td className="px-4 py-3">{data.result?.totalCredit}</td>
                      <td />
                      <td className="px-4 py-3 text-right">SGPA</td>
                      <td className="px-4 py-3 text-primary-700 text-lg">{data.result?.gpa?.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-700"><strong>N.B.:</strong> For any discrepancy, please contact the examination office.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
