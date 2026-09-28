import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, School, BookOpen, CalendarCheck, DollarSign, AlertCircle, Book,
  UserPlus, PlusCircle, CreditCard, CheckSquare, Bell, Calendar, ChevronRight, TrendingUp,
  FileText, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { mockStudents, mockPayments, mockNotices, mockExams, mockTimetable } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { UserRole, Event } from '../../types';
import { eventsService } from '../../services/eventsService';

interface DashboardViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddTeacher: () => void;
  onOpenRecordPayment: () => void;
  onOpenCreateNotice: () => void;
  onPreviewStudent: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userRole,
  onNavigate,
  onOpenAddStudent,
  onOpenAddTeacher,
  onOpenRecordPayment,
  onOpenCreateNotice,
  onPreviewStudent
}) => {
  if (userRole === 'TEACHER') {
    return <TeacherDashboard onNavigate={onNavigate} />;
  }
  
  if (userRole === 'STUDENT') {
    return <StudentDashboard onNavigate={onNavigate} role={userRole} />;
  }

  return (
    <AdminDashboard 
      onNavigate={onNavigate}
      onOpenAddStudent={onOpenAddStudent}
      onOpenAddTeacher={onOpenAddTeacher}
      onOpenRecordPayment={onOpenRecordPayment}
      onOpenCreateNotice={onOpenCreateNotice}
      onPreviewStudent={onPreviewStudent}
    />
  );
};

const AdminDashboard: React.FC<any> = ({ onNavigate, onOpenAddStudent, onOpenAddTeacher, onOpenRecordPayment, onOpenCreateNotice, onPreviewStudent }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventsService.getEvents().then(setEvents);
  }, []);

  const feeCollectionData = [
    { month: 'Apr', amount: 14.5 }, { month: 'May', amount: 18.2 }, { month: 'Jun', amount: 12.0 },
    { month: 'Jul', amount: 22.4 }, { month: 'Aug', amount: 28.8 }, { month: 'Sep', amount: 31.0 },
  ];
  const classEnrollmentData = [
    { name: 'Class 6', students: 8 }, { name: 'Class 7', students: 7 }, { name: 'Class 10', students: 8 },
  ];
  
  const recentAdmissions = mockStudents.slice(0, 5);
  const lowAttendanceStudents = mockStudents.filter(s => s.attendance_percentage < 75).slice(0, 4);
  const recentPayments = mockPayments.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="premium-card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time management portal for campus operations & finances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onOpenAddStudent} className="premium-btn premium-btn-secondary px-3 py-2 text-xs">
            <UserPlus className="w-4 h-4 mr-1.5 text-teal-600" /><span>Add Student</span>
          </button>
          <button onClick={onOpenAddTeacher} className="premium-btn premium-btn-secondary px-3 py-2 text-xs">
            <PlusCircle className="w-4 h-4 mr-1.5 text-mint-600" /><span>Add Teacher</span>
          </button>
          <button onClick={onOpenRecordPayment} className="premium-btn premium-btn-secondary px-3 py-2 text-xs">
            <CreditCard className="w-4 h-4 mr-1.5 text-amber-500" /><span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={50} icon={Users} color="indigo" trend="+12% YoY" onClick={() => onNavigate('students')} />
        <StatCard title="Total Teachers" value={20} icon={UserCheck} color="emerald" trend="100% Active" onClick={() => onNavigate('teachers')} />
        <StatCard title="Attendance Today" value="96.2%" icon={CalendarCheck} color="cyan" onClick={() => onNavigate('attendance')} />
        <StatCard title="Pending Fees" value="$14,200" icon={AlertCircle} color="rose" onClick={() => onNavigate('fees')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-600" /> Monthly Fee Collection</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeCollectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" stroke="#0f172a" fontSize={11} fontWeight={700} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={700} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#d97706" fill="#fef3c7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-rose-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Tasks Needing Attention</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">Low Attendance Alerts</p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{lowAttendanceStudents.length} students below 75% threshold</p>
              </div>
              <button onClick={() => onNavigate('attendance')} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700">Review</button>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">Pending Fee Approvals</p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">3 offline payments await verification</p>
              </div>
              <button onClick={() => onNavigate('fees')} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600">Verify</button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">Staff Leave Requests</p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">2 teachers requested leave next week</p>
              </div>
              <button onClick={() => onNavigate('teachers')} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-900">Manage</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" /> Recent Admissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="pb-2 font-medium">Student Name</th>
                  <th className="pb-2 font-medium">Class</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAdmissions.map(s => (
                  <tr key={s.id}>
                    <td className="py-2.5 font-semibold text-slate-900">{s.full_name}</td>
                    <td className="py-2.5 text-slate-600">{s.class_name}-{s.section_name}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => onPreviewStudent(s.id)} className="text-teal-600 hover:text-teal-800 text-xs font-bold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="premium-card p-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-600" /> Campus Events</h3>
            <button onClick={() => onNavigate('events')} className="text-xs font-bold text-indigo-700 hover:underline">Events Calendar</button>
          </div>
          <div className="space-y-3">
            {events.filter(ev => ev.status !== 'Cancelled').slice(0, 3).map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-slate-900">{ev.title}</p>
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 font-semibold text-[10px] rounded uppercase">{ev.event_type}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ev.date} | {ev.venue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard: React.FC<any> = ({ onNavigate }) => {
  const todaysSchedule = mockTimetable.filter(t => t.teacher_name === 'Dr. Robert Vance' && t.day === 'Monday');
  const nextClass = todaysSchedule[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Dr. Vance.</h1>
          <p className="text-slate-500 font-medium mt-1">Here is your schedule and tasks for today.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xl font-bold text-slate-900">Monday, Aug 31</div>
          <div className="text-sm text-slate-500 font-medium">Academic Year 2025-26</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Class Hero Card */}
        <div className="md:col-span-2 premium-card bg-gradient-to-br from-teal-800 to-teal-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-32 h-32" />
          </div>
          <div className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="px-2.5 py-1 bg-teal-700/50 rounded-full text-xs font-bold tracking-wide uppercase">Next Class</span>
              <h2 className="text-3xl font-bold mt-4">{nextClass?.subject_name || 'Mathematics'}</h2>
              <p className="text-teal-100 font-medium mt-1">{nextClass?.class_id.replace('cls-', 'Class ')}-{nextClass?.section_id.slice(-1).toUpperCase()} • Room {nextClass?.room_number}</p>
              <div className="flex items-center gap-2 mt-4 text-sm font-medium text-teal-200">
                <Clock className="w-4 h-4" /> {nextClass?.start_time || '08:30 AM'} - {nextClass?.end_time || '09:20 AM'}
              </div>
            </div>
            <div className="mt-8">
              <button onClick={() => onNavigate('attendance')} className="px-6 py-3 bg-white text-teal-900 font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <CheckSquare className="w-5 h-5" /> Take Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="premium-card p-5 flex flex-col">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" /> My Tasks
          </h3>
          <div className="space-y-3 flex-1">
            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="mt-1 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Grade Unit Test 1</p>
                <p className="text-xs text-slate-500 mt-0.5">Class 10-A Mathematics</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900 line-through text-slate-400 leading-tight">Submit Lesson Plan</p>
                <p className="text-xs text-slate-400 mt-0.5 line-through">Due Friday</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="mt-1 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Review Library Books</p>
                <p className="text-xs text-slate-500 mt-0.5">Approve new curriculum books</p>
              </div>
            </label>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-teal-700">33%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-slate-400" /> Today's Timetable</h3>
          <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-slate-100">
            {todaysSchedule.map((tt, idx) => (
              <div key={tt.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                <div className={`w-14 shrink-0 text-right text-xs font-bold pt-1 ${idx === 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                  {tt.start_time.split(' ')[0]}
                </div>
                <div className={`absolute left-[24px] w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? 'bg-teal-500 ring-4 ring-teal-50' : 'bg-slate-300'}`} />
                <div className={`flex-1 p-3 rounded-lg border ${idx === 0 ? 'bg-teal-50 border-teal-100' : 'bg-white border-slate-200'}`}>
                  <p className="font-bold text-sm text-slate-900">{tt.subject_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Class {tt.class_id.split('-')[1]}-{tt.section_id.slice(-1).toUpperCase()} • Room {tt.room_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400" /> Pending Grading</h3>
            <button onClick={() => onNavigate('examinations')} className="text-xs font-bold text-teal-600 hover:underline">Gradebook</button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-teal-300 transition-colors cursor-pointer" onClick={() => onNavigate('examinations')}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Unit Test 1 - Mathematics</h4>
                  <p className="text-xs text-slate-500">Class 10-A • 30 submissions</p>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">Draft</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">12/30 Graded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC<any> = ({ role, onNavigate }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="premium-card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, Isaac.</h1>
        <p className="text-sm text-slate-600 mt-1">Here is what's happening today at school.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-5">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> Today's Classes</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="w-12 text-center text-xs font-bold text-slate-500">08:30</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">Mathematics</p>
                <p className="text-xs text-slate-500">Dr. Vance • Room 301</p>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="w-12 text-center text-xs font-bold text-slate-500">09:20</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900">Physics</p>
                <p className="text-xs text-slate-500">Dr. E. Vance • Room 301</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400" /> Recent Assignments</h3>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="font-bold text-sm text-slate-900">Math Worksheet 4</p>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Overdue</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Due: Yesterday</p>
            </div>
          </div>
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-slate-400" /> Notices</h3>
            <div className="space-y-2">
              {mockNotices.slice(0,2).map(n => (
                <div key={n.id} className="text-sm py-2 border-b border-slate-50 last:border-0 last:pb-0">
                  <p className="font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.published_date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
