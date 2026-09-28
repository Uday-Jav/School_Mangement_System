import React, { useEffect, useState } from 'react';
import { X, User, Phone, Mail, Calendar, MapPin, Activity, Award, CreditCard, BookOpen, Bus, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student, AttendanceRecord, ExamResult, Payment, BookIssue, StudentTransport } from '../../types';
import { StatusBadge } from './StatusBadge';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { resultService } from '../../services/resultService';
import { feeService } from '../../services/feeService';
import { libraryService } from '../../services/libraryService';
import { transportService } from '../../services/transportService';

interface StudentPreviewPanelProps {
  studentId: string | null;
  onClose: () => void;
  onNavigateToFullProfile: (id: string) => void;
}

type TabType = 'overview' | 'attendance' | 'results' | 'fees' | 'library' | 'transport';

export const StudentPreviewPanel: React.FC<StudentPreviewPanelProps> = ({ studentId, onClose, onNavigateToFullProfile }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [libraryIssues, setLibraryIssues] = useState<BookIssue[]>([]);
  const [transportAssignments, setTransportAssignments] = useState<StudentTransport[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!studentId) return;
      setLoading(true);
      setIsClosing(false);
      setActiveTab('overview');
      try {
        const s = await studentService.getStudentById(studentId);
        if (s) {
          setStudent(s);
          const att = await attendanceService.getAttendanceRecords();
          setAttendance(att.filter(a => a.student_id === studentId));
          
          const res = await resultService.getResults();
          setResults(res.filter(r => r.student_id === studentId));
          
          const pays = await feeService.getPayments();
          setPayments(pays.filter(p => p.student_id === studentId));

          const lib = await libraryService.getStudentHistory(studentId);
          setLibraryIssues(lib);

          const trans = await transportService.getAssignments();
          setTransportAssignments(trans.filter(t => t.student_id === studentId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (studentId) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [studentId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setStudent(null);
    }, 300);
  };

  if (!studentId || !student) return null;

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const totalCount = attendance.length || 1;
  const attRate = Math.round((presentCount / totalCount) * 100);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
        onClick={handleClose} 
      />
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Student Profile
          </h2>
          <button 
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {/* Header section */}
            <div className="bg-white p-6 border-b border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-3xl shrink-0 border border-teal-200 shadow-sm">
                  {student.first_name?.[0] || ''}{student.last_name?.[0] || ''}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">{student.full_name}</h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">{student.class_name} - {student.section_name} (Roll: {student.roll_no})</p>
                  <p className="text-xs text-slate-400">Admission No: {student.admission_no}</p>
                  <div className="mt-3 flex gap-2">
                    <StatusBadge status={student.status} size="sm" />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${attRate < 75 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {attRate}% Attendance
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-2 overflow-x-auto hide-scrollbar sticky top-0 z-10 shadow-sm">
              {[
                { id: 'overview', label: 'Overview', icon: MapPin },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
                { id: 'results', label: 'Assessments', icon: Award },
                { id: 'fees', label: 'Fees', icon: CreditCard },
                { id: 'library', label: 'Library', icon: BookOpen },
                { id: 'transport', label: 'Transport', icon: Bus },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                    activeTab === t.id ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-teal-600' : 'text-slate-400'}`} />
                  {t.label}
                  {activeTab === t.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="premium-card p-5 bg-white border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal & Contact Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                      <div><span className="text-slate-400 text-xs block mb-0.5">Date of Birth</span><span className="font-medium">{student.dob}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Blood Group</span><span className="font-medium">{student.blood_group}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Phone</span><span className="font-medium">{student.phone}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Email</span><span className="font-medium">{student.email}</span></div>
                      <div className="md:col-span-2"><span className="text-slate-400 text-xs block mb-0.5">Address</span><span className="font-medium">{student.address}</span></div>
                    </div>
                  </div>

                  <div className="premium-card p-5 bg-white border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Guardian Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                      <div><span className="text-slate-400 text-xs block mb-0.5">Name</span><span className="font-medium">{student.guardian?.name || (student as any).guardian_name || 'N/A'}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Relationship</span><span className="font-medium">{student.guardian?.relationship || (student as any).guardian_relationship || 'N/A'}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Phone</span><span className="font-medium">{student.guardian?.phone || (student as any).guardian_phone || 'N/A'}</span></div>
                      <div><span className="text-slate-400 text-xs block mb-0.5">Email</span><span className="font-medium">{student.guardian?.email || (student as any).guardian_email || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="premium-card p-5 bg-white border-slate-200 flex flex-col items-center justify-center text-center">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1">Total Present</span>
                      <span className="text-3xl font-black text-teal-600">{presentCount}</span>
                      <span className="text-slate-400 text-xs mt-1">out of {totalCount} days</span>
                    </div>
                    <div className="premium-card p-5 bg-white border-slate-200 flex flex-col items-center justify-center text-center">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1">Attendance Rate</span>
                      <span className={`text-3xl font-black ${attRate < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>{attRate}%</span>
                      <span className="text-slate-400 text-xs mt-1">{attRate < 75 ? 'Needs Attention' : 'Good Standing'}</span>
                    </div>
                  </div>

                  <div className="premium-card p-5 bg-white border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Recent Records</h3>
                    {attendance.length > 0 ? (
                      <div className="space-y-3">
                        {attendance.slice(0, 10).map((a, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-slate-700">{a.date}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              a.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 
                              a.status === 'Absent' ? 'bg-rose-50 text-rose-700' : 
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No attendance records found.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {Array.from(new Set(results.map(r => r.exam_id))).map(examId => {
                        const examRes = results.filter(r => r.exam_id === examId);
                        const totalObtained = examRes.reduce((sum, r) => sum + r.marks_obtained, 0);
                        const totalMax = examRes.reduce((sum, r) => sum + r.max_marks, 0);
                        const percent = Math.round((totalObtained / totalMax) * 100);
                        
                        return (
                          <div key={examId} className="premium-card p-5 bg-white border-slate-200">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                              <h3 className="font-bold text-slate-900">{examId}</h3>
                              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">Score: {percent}%</span>
                            </div>
                            <div className="space-y-3">
                              {examRes.map((r, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                  <span className="font-medium text-slate-700">{r.subject_name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-500">{r.marks_obtained} / {r.max_marks}</span>
                                    <span className="w-8 text-center font-bold text-slate-900">{r.grade}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="premium-card p-8 bg-white border-slate-200 text-center text-slate-500">
                      <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium">No assessment results recorded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="premium-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-none">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Account Status</h3>
                      <StatusBadge status={student.fee_status} size="sm" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-400 mb-1">Total Payments (YTD)</span>
                      <span className="text-3xl font-black">${payments.filter(p=>p.status==='Paid').reduce((sum,p)=>sum+p.amount,0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="premium-card p-5 bg-white border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Recent Transactions</h3>
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map(p => (
                          <div key={p.id} className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{p.fee_type}</p>
                              <p className="text-xs text-slate-500">{p.payment_date} • {p.payment_method}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-emerald-600">+${p.amount}</p>
                              <p className="text-[10px] uppercase font-bold text-slate-400">{p.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No payments recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'library' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="premium-card p-5 bg-white border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Borrowing History</h3>
                    {libraryIssues.length > 0 ? (
                      <div className="space-y-4">
                        {libraryIssues.map(i => (
                          <div key={i.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{i.book_title}</p>
                              <p className="text-xs text-slate-500">Issued: {i.issue_date} • Due: {i.due_date}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                               <StatusBadge status={i.status} size="sm" />
                               {i.fine_amount > 0 && <span className="text-xs font-black text-rose-600 mt-1">Fine: ${i.fine_amount}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No library borrowing history.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'transport' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="premium-card p-5 bg-white border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Transport Assignment</h3>
                    {transportAssignments.length > 0 ? (
                      <div className="space-y-4">
                        {transportAssignments.map(t => (
                          <div key={t.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-sm text-slate-900">Route: {t.route_name}</p>
                              <p className="text-xs text-slate-500">Pickup: {t.pickup_point}</p>
                            </div>
                            <div className="text-right">
                               <StatusBadge status={t.status} size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No transport route assigned.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
