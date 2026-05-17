import { useState } from 'react';
import { Plus, Globe, Lock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useExams, useCreateExam, usePublishExam, useUnpublishExam } from '../../hooks/useExams';
import { examApi } from '../../api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

function CreateModal({ onClose }) {
  const create = useCreateExam();
  const [form, setForm] = useState({ name: '', semester: '', dept: '' });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Exam</h2>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Exam Name', placeholder: 'e.g. Final Examination Spring 2025' },
            { key: 'semester', label: 'Semester', placeholder: 'e.g. Spring 2025, 7th Semester' },
            { key: 'dept', label: 'Department', placeholder: 'e.g. CSE, EEE, BBA' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" placeholder={placeholder}
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button className="btn-primary flex-1"
            disabled={!form.name || !form.semester || !form.dept || create.isPending}
            onClick={async () => { await create.mutateAsync(form); onClose(); }}>
            {create.isPending ? 'Creating…' : 'Create Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExams({ page, limit: 15 });
  const publish = usePublishExam();
  const unpublish = useUnpublishExam();
  const qc = useQueryClient();

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam and all its results?')) return;
    try {
      await examApi.delete(id);
      toast.success('Exam deleted');
      qc.invalidateQueries(['exams']);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed');
    }
  };

  const exams = data?.exams || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">{data?.total || 0} total exams</p>
        </div>
        <button id="create-exam-btn" className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Exam
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Exam Name</th><th>Semester</th><th>Dept</th><th>Students</th><th>Status</th><th>Published</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="h-10 skeleton" /></td></tr>
              ))}
              {!isLoading && exams.map((ex) => (
                <tr key={ex._id}>
                  <td className="font-semibold">{ex.name}</td>
                  <td>{ex.semester}</td>
                  <td><span className="badge-primary">{ex.dept}</span></td>
                  <td>{ex.totalStudents || 0}</td>
                  <td>
                    <span className={ex.status === 'published' ? 'badge-success' : 'badge-warning'}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs">
                    {ex.publishedAt ? new Date(ex.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {ex.status === 'draft' ? (
                        <button className="btn-success btn-sm" title="Publish"
                          onClick={() => publish.mutate(ex._id)}
                          disabled={publish.isPending}>
                          <Globe className="w-3.5 h-3.5" /> Publish
                        </button>
                      ) : (
                        <button className="btn-secondary btn-sm" title="Unpublish"
                          onClick={() => unpublish.mutate(ex._id)}>
                          <Lock className="w-3.5 h-3.5" /> Unpublish
                        </button>
                      )}
                      <button className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(ex._id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && exams.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-400 py-12">No exams yet. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {data.pages}</span>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn-secondary btn-sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
