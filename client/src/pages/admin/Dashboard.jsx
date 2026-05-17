import { useQuery } from '@tanstack/react-query';
import { examApi, studentApi, resultAdminApi } from '../../api';
import { useExams } from '../../hooks/useExams';
import {
  GraduationCap, FileText, Users, TrendingUp,
  CheckCircle2, Clock, Activity, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb','#16a34a','#f59e0b','#dc2626','#8b5cf6'];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon className="w-6 h-6" /></div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: examsData } = useExams({});
  const { data: studentsData } = useQuery({
    queryKey: ['students-count'],
    queryFn: () => studentApi.list({ limit: 1 }).then((r) => r.data),
  });

  const exams = examsData?.exams || [];
  const published = exams.filter((e) => e.status === 'published').length;
  const draft = exams.filter((e) => e.status === 'draft').length;

  const deptData = exams.reduce((acc, e) => {
    const found = acc.find((x) => x.dept === e.dept);
    if (found) found.exams++;
    else acc.push({ dept: e.dept || 'Unknown', exams: 1 });
    return acc;
  }, []);

  const pieData = [
    { name: 'Published', value: published },
    { name: 'Draft', value: draft },
  ].filter((d) => d.value > 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">System overview and statistics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
          System Operational
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FileText} label="Total Exams" value={examsData?.total} color="bg-primary-50 text-primary-600"
          sub={`${published} published`} />
        <StatCard icon={CheckCircle2} label="Published" value={published} color="bg-green-50 text-green-600" />
        <StatCard icon={Clock} label="Draft" value={draft} color="bg-amber-50 text-amber-600" />
        <StatCard icon={Users} label="Students" value={studentsData?.total} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" /> Exams by Department
          </h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="exams" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No exam data yet</div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" /> Exam Status
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Recent exams */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-600" />
          <h3 className="font-bold text-slate-700">Recent Exams</h3>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Name</th><th>Semester</th><th>Dept</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>
              {exams.slice(0, 8).map((ex) => (
                <tr key={ex._id}>
                  <td className="font-medium">{ex.name}</td>
                  <td>{ex.semester}</td>
                  <td>{ex.dept}</td>
                  <td>{ex.totalStudents || 0}</td>
                  <td>
                    <span className={ex.status === 'published' ? 'badge-success' : 'badge-warning'}>
                      {ex.status}
                    </span>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">No exams created yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
