import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api';
import { useDropzone } from 'react-dropzone';
import { Plus, Search, Upload, Trash2, Pencil, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

function StudentModal({ student, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!student;
  const [form, setForm] = useState(student || { name: '', rollNo: '', dept: '', batch: '', email: '', phone: '' });

  const mutation = useMutation({
    mutationFn: isEdit
      ? (d) => studentApi.update(student._id, d)
      : (d) => studentApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['students']);
      toast.success(isEdit ? 'Student updated' : 'Student added');
      onClose();
    },
    onError: (e) => toast.error(e?.response?.data?.error || 'Failed'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', span: 2, placeholder: 'Student full name' },
            { key: 'rollNo', label: 'Roll Number', placeholder: 'CSE-2021-001' },
            { key: 'dept', label: 'Department', placeholder: 'CSE, EEE, BBA' },
            { key: 'batch', label: 'Batch', placeholder: '2021, 65th' },
            { key: 'email', label: 'Email', placeholder: 'student@email.com' },
            { key: 'phone', label: 'Phone', placeholder: '+880...' },
          ].map(({ key, label, span, placeholder }) => (
            <div key={key} className={span === 2 ? 'col-span-2' : ''}>
              <label className="label">{label}</label>
              <input className="input" placeholder={placeholder}
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button className="btn-primary flex-1"
            disabled={!form.name || !form.rollNo || !form.dept || !form.batch || mutation.isPending}
            onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | student obj

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => studentApi.list({ search, page, limit: 20 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'text/csv': ['.csv'] }, maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return;
      try {
        const { data: res } = await studentApi.bulkImport(file);
        toast.success(`Imported ${res.inserted} students, updated ${res.updated}`);
        qc.invalidateQueries(['students']);
      } catch (e) {
        toast.error(e?.response?.data?.error || 'Import failed');
      }
    },
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await studentApi.delete(id);
      toast.success('Student deleted');
      qc.invalidateQueries(['students']);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed');
    }
  };

  const students = data?.students || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{data?.total || 0} total students</p>
        </div>
        <div className="flex items-center gap-3">
          <div {...getRootProps()} className="btn-secondary cursor-pointer">
            <input {...getInputProps()} id="bulk-csv-input" />
            <Upload className="w-4 h-4" /> Bulk CSV
          </div>
          <button id="add-student-btn" className="btn-primary" onClick={() => setModal('create')}>
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input id="student-search" className="input pl-11" placeholder="Search by name, roll number or email…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Roll No</th><th>Dept</th><th>Batch</th><th>Email</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="h-10 skeleton" /></td></tr>
              ))}
              {!isLoading && students.map((s) => (
                <tr key={s._id}>
                  <td className="font-semibold">{s.name}</td>
                  <td className="font-mono text-xs text-slate-600">{s.rollNo}</td>
                  <td><span className="badge-primary">{s.dept}</span></td>
                  <td>{s.batch}</td>
                  <td className="text-slate-500 text-xs">{s.email || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        onClick={() => setModal(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(s._id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && students.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                  No students found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Page {page} of {data.pages} · {data.total} students</span>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn-secondary btn-sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <StudentModal student={modal === 'create' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
