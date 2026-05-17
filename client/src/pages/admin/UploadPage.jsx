import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useExams } from '../../hooks/useExams';
import { resultAdminApi } from '../../api';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, ChevronRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Select Exam', 'Upload CSV', 'Processing', 'Complete'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            i < current ? 'bg-green-100 text-green-700' :
            i === current ? 'bg-primary-600 text-white shadow-glow-sm' :
            'bg-slate-100 text-slate-400'
          }`}>
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 text-xs">{i+1}</span>}
            {s}
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [examId, setExamId] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const { data: examsData } = useExams({ status: 'draft', limit: 50 });
  const exams = examsData?.exams || [];

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || !examId) return;
    setStep(2);
    setError('');
    try {
      const { data } = await resultAdminApi.upload(examId, file, setProgress);
      setResult(data);
      setStep(3);
      toast.success(`${data.total} results uploaded!`);
    } catch (e) {
      setError(e?.response?.data?.error || 'Upload failed');
      setStep(1);
    }
  };

  const reset = () => {
    setStep(0); setExamId(''); setFile(null);
    setProgress(0); setResult(null); setError('');
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Results</h1>
          <p className="page-subtitle">Import student results from a CSV file</p>
        </div>
        <a href="/sample-results.csv" download className="btn-secondary btn-sm">
          <Download className="w-3.5 h-3.5" /> Sample CSV
        </a>
      </div>

      <StepIndicator current={step} />

      {/* Step 0 — Select Exam */}
      {step === 0 && (
        <div className="card p-8 animate-slide-up">
          <h2 className="font-bold text-slate-800 text-lg mb-6">Step 1: Select Exam</h2>
          <label className="label">Choose a draft exam to upload results for</label>
          <select id="exam-select" className="input mb-6" value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">— Select exam —</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>{ex.name} · {ex.semester} · {ex.dept}</option>
            ))}
          </select>
          {exams.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4" /> No draft exams. Create an exam first.
            </div>
          )}
          <button id="step1-next" className="btn-primary w-full" disabled={!examId} onClick={() => setStep(1)}>
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1 — Upload CSV */}
      {step === 1 && (
        <div className="card p-8 animate-slide-up space-y-6">
          <h2 className="font-bold text-slate-800 text-lg">Step 2: Upload CSV File</h2>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
          }`}>
            <input {...getInputProps()} id="csv-upload" />
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            {file ? (
              <div>
                <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">{file.name}</p>
                <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <p className="font-semibold text-slate-600">Drag & drop your CSV file here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse · max 10MB</p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 mb-2">Required CSV columns:</p>
            <code className="block">rollNo, subject1_name, subject1_code, subject1_marks, subject1_total, subject1_credit, subject2_name, ...</code>
          </div>

          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setStep(0)}>Back</button>
            <button id="upload-btn" className="btn-primary flex-1" disabled={!file} onClick={handleUpload}>
              <Upload className="w-4 h-4" /> Upload & Process
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Processing */}
      {step === 2 && (
        <div className="card p-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-primary-600 animate-bounce" />
          </div>
          <h2 className="font-bold text-slate-800 text-xl mb-2">Processing…</h2>
          <p className="text-slate-500 mb-8">Validating, computing grades, and assigning ranks</p>
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${progress || 20}%` }} />
          </div>
          <p className="text-sm text-slate-400 mt-3">{progress || '—'}%</p>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && result && (
        <div className="card p-10 text-center animate-slide-up">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-bold text-slate-800 text-2xl mb-2">Upload Complete!</h2>
          <p className="text-slate-500 mb-8">PDF generation has been queued in the background.</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total', value: result.total, color: 'bg-primary-50 text-primary-700' },
              { label: 'Inserted', value: result.upserted, color: 'bg-green-50 text-green-700' },
              { label: 'PDF Jobs', value: result.pdfJobsQueued, color: 'bg-purple-50 text-purple-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-2xl p-4 ${color}`}>
                <div className="text-3xl font-extrabold">{value}</div>
                <div className="text-sm font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={reset}>Upload Another</button>
        </div>
      )}
    </div>
  );
}
