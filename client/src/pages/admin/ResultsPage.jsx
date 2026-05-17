import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { examApi, resultAdminApi } from '../../api';
import { BarChart3, CheckCircle2, XCircle, Trophy, Download } from 'lucide-react';

export default function ResultsPage() {
  const [examId, setExamId] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: examsData } = useQuery({
    queryKey: ['exams-all'],
    queryFn: () => examApi.list({ limit: 100 }).then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['results-admin', examId, page, statusFilter],
    queryFn: () => resultAdminApi.byExam(examId, { page, limit: 30, status: statusFilter }).then((r) => r.data),
    enabled: !!examId,
    keepPreviousData: true,
  });

  const exams = examsData?.exams || [];
  const results = data?.results || [];

  const GRADE_COLORS = {
    'A+': 'text-green-700 bg-green-50', A: 'text-green-600 bg-green-50',
    'A-': 'text-emerald-600 bg-emerald-50', 'B+': 'text-blue-700 bg-blue-50',
    B: 'text-blue-600 bg-blue-50', F: 'text-red-700 bg-red-50',
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-subtitle">Browse all results by exam</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Select Exam</label>
            <select id="exam-filter" className="input" value={examId}
              onChange={(e) => { setExamId(e.target.value); setPage(1); }}>
              <option value="">— Choose an exam —</option>
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>{ex.name} · {ex.semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Filter by Status</label>
            <select id="status-filter" className="input" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="pass">Pass Only</option>
              <option value="fail">Fail Only</option>
            </select>
          </div>
          {data && (
            <div className="flex items-end">
              <div className="flex gap-4 text-sm">
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-semibold">
                  Pass: {results.filter((r) => r.status === 'pass').length}
                </div>
                <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl font-semibold">
                  Fail: {results.filter((r) => r.status === 'fail').length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!examId ? (
        <div className="card p-16 text-center text-slate-400">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold">Select an exam to view results</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th><th>Roll No</th><th>Student</th>
                  <th>Dept</th><th>SGPA</th><th>Status</th><th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && [...Array(10)].map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-10 skeleton" /></td></tr>
                ))}
                {!isLoading && results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.rank <= 3 ? <Trophy className={`w-4 h-4 ${r.rank === 1 ? 'text-amber-400' : r.rank === 2 ? 'text-slate-400' : 'text-amber-700'}`} /> : null}
                        <span className="font-bold text-slate-700">#{r.rank}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs font-semibold">{r.rollNo}</td>
                    <td className="font-medium">{r.studentId?.name || '—'}</td>
                    <td><span className="badge-primary">{r.studentId?.dept || '—'}</span></td>
                    <td>
                      <span className={`font-bold text-lg ${r.gpa >= 3.5 ? 'text-green-600' : r.gpa >= 2.5 ? 'text-blue-600' : 'text-red-600'}`}>
                        {r.gpa?.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={r.status === 'pass' ? 'badge-success' : 'badge-danger'}>
                        {r.status === 'pass'
                          ? <><CheckCircle2 className="w-3 h-3" /> Pass</>
                          : <><XCircle className="w-3 h-3" /> Fail</>}
                      </span>
                    </td>
                    <td>
                      {r.pdfUrl ? (
                        <a href={r.pdfUrl} target="_blank" rel="noreferrer"
                          className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors inline-flex">
                          <Download className="w-4 h-4" />
                        </a>
                      ) : <span className="text-slate-300 text-xs">pending</span>}
                    </td>
                  </tr>
                ))}
                {!isLoading && results.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No results found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data?.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Page {page} of {data.pages} · {data.total} results</span>
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <button className="btn-secondary btn-sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
