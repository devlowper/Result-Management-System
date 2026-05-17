import { useState, useEffect } from 'react';
import {
  GraduationCap, Search, User, Users,
  Hash, CreditCard, Info, Printer,
  AlertCircle, ChevronDown, BookOpen
} from 'lucide-react';

export default function App() {
  const [allResults, setAllResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetch('/results.json')
      .then((r) => r.json())
      .then((data) => {
        setAllResults(data);
        const unique = [...new Set(data.map((s) => s.semester))];
        setSemesters(unique);
        if (unique.length > 0) setSelectedSemester(unique[0]);
        setDataLoaded(true);
      })
      .catch((err) => console.error('Failed to load results.json', err));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim() || !selectedSemester) return;
    setLoading(true);
    setSearched(false);
    setResult(null);

    setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      const qClean = q.replace(/-/g, ''); // strip hyphens for flexible search
      const found = allResults.find(
        (s) =>
          s.semester === selectedSemester &&
          (
            s.roll?.toLowerCase() === q ||
            s.id?.toLowerCase() === q ||
            s.roll?.toLowerCase().replace(/-/g, '') === qClean ||
            s.id?.toLowerCase().replace(/-/g, '') === qClean
          )
      );
      setResult(found || null);
      setSearched(true);
      setLoading(false);
    }, 400);
  }

  // Totals
  const totalCredit = result
    ? result.courses.reduce((sum, c) => sum + (c.credit ?? 0), 0)
    : 0;

  // Format semester code into human readable text if needed
  const formatSemester = (sem) => {
    const semMap = {
      '11': '1st Year 1st Semester',
      '12': '1st Year 2nd Semester',
      '13': '1st Year 3rd Semester',
      '21': '2nd Year 1st Semester',
      '22': '2nd Year 2nd Semester',
      '23': '2nd Year 3rd Semester',
      '31': '3rd Year 1st Semester',
      '32': '3rd Year 2nd Semester',
      '33': '3rd Year 3rd Semester',
      '41': '4th Year 1st Semester',
      '42': '4th Year 2nd Semester',
      '43': '4th Year 3rd Semester',
    };
    return semMap[sem] || sem;
  };

  // Colour helper for grade chips
  const gradeColor = (grade = '') => {
    const g = grade.toUpperCase();
    if (g === 'A+' || g === 'A') return 'grade-a';
    if (g === 'A-' || g === 'B+') return 'grade-b';
    if (g === 'B' || g === 'B-' || g === 'C+') return 'grade-c';
    return 'grade-d';
  };

  // Safe display helpers
  const displayName = result?.name?.trim() ? result.name : 'No Name Found';

  return (
    <div className="app-root">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="site-header no-print">
        <div className="header-inner">
          <div className="brand-icon"><GraduationCap size={22} /></div>
          <div>
            <span className="brand-title">Academic Result Portal</span>

          </div>
        </div>
      </header>

      <main className="main-wrap">

        {/* ── Search card ────────────────────────────────────────────── */}
        <section className="card search-card no-print">
          <h2 className="card-title">
            <BookOpen size={18} strokeWidth={2.5} />
            Academic Result
          </h2>

          <form onSubmit={handleSearch}>
            <div className="field">
              <label className="field-label">Select Semester</label>
              <div className="select-wrap">
                <select
                  className="field-select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  {semesters.map((s) => (
                    <option key={s} value={s}>{formatSemester(s)}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="select-chevron" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Student ID or Registration No</label>
              <div className="input-wrap">
                <Search size={15} className="input-icon" />
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. 0242320005101821 or 232-15-821"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <button className="btn-search" type="submit" disabled={loading || !dataLoaded}>
              {loading
                ? <span className="spinner" />
                : <><Search size={16} strokeWidth={2.5} /> Search</>
              }
            </button>
          </form>
        </section>

        {/* ── Not found ──────────────────────────────────────────────── */}
        {searched && !result && (
          <div className="card not-found no-print">
            <AlertCircle size={36} className="nf-icon" />
            <p className="nf-title">No Result Found</p>
            <p className="nf-sub">
              No match for <strong>{searchQuery}</strong> in <em>{selectedSemester}</em>.
              Check the ID / Roll and try again.
            </p>
          </div>
        )}

        {/* ── Result card ────────────────────────────────────────────── */}
        {result && (
          <section className="card result-card">

            {/* Print-only university header */}
            <div className="print-header">
              <h2>Metropolitan University</h2>
              <p>Semester Result — {formatSemester(result.semester)}</p>
            </div>

            {/* Student info header */}
            <div className="result-top">
              <h2 className="result-section-title">
                <GraduationCap size={18} strokeWidth={2.5} />
                Student Information
              </h2>
              <div className="no-print print-actions">
                <button className="btn-print" onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <h3 className="student-name">{displayName}</h3>

            <ul className="info-list">
              <li className="info-item">
                <GraduationCap size={15} className="info-icon" />
                <span>{result.department || '—'}</span>
              </li>
              <li className="info-item">
                <Users size={15} className="info-icon" />
                <span>Batch: {result.batch || '—'}</span>
              </li>
              <li className="info-item">
                <Hash size={15} className="info-icon" />
                <span>Student ID: {result.id || '—'}</span>
              </li>
              <li className="info-item">
                <CreditCard size={15} className="info-icon" />
                <span>Reg ID: {result.roll || '—'}</span>
              </li>
              <li className="info-item">
                <Info size={15} className="info-icon" />
                <span>
                  SGPA of {formatSemester(result.semester)}:{' '}
                  <strong className="sgpa-inline">{Number(result.sgpa).toFixed(2)}</strong>
                </span>
              </li>
            </ul>

            {/* Course table */}
            <div className="tbl-wrap">
              <table className="result-tbl">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credit</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {result.courses.map((c, idx) => (
                    <tr key={c.code ?? idx}>
                      <td className="tc">{c.sl ?? idx + 1}</td>
                      <td className="code">{c.code ?? '—'}</td>
                      <td>{c.title ?? '—'}</td>
                      <td className="tc">{Number(c.credit ?? 0).toFixed(2)}</td>
                      <td className="tc">
                        <span className={`grade-chip ${gradeColor(c.grade)}`}>
                          {c.grade ?? '—'}
                        </span>
                      </td>
                      <td className="tc">{Number(c.point ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="tbl-total">
                    <td colSpan={3} className="total-lbl">Total Credit</td>
                    <td className="tc total-num">{totalCredit.toFixed(2)}</td>
                    <td className="tc total-lbl">SGPA</td>
                    <td className="tc total-num">{Number(result.sgpa).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notice */}
            <p className="notice">
              <strong>N.B.:</strong> If you see Teaching Evaluation Pending in any course,
              please complete{' '}
              <span className="notice-link">Teaching Evaluation</span>.
            </p>
          </section>
        )}
      </main>

      <footer className="site-footer no-print">
        © {new Date().getFullYear()} Academic Result Portal · All rights reserved
      </footer>
    </div>
  );
}
