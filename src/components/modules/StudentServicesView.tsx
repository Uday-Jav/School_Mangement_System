import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Users, Calendar, Award, User, CreditCard, Clock } from 'lucide-react';
import { ClassesView } from './ClassesView';
import { StudentsView } from './StudentsView';
import { AttendanceView } from './AttendanceView';
import { ResultsView } from './ResultsView';
import { TimetableView } from './TimetableView';
import { FeesView } from './FeesView';
import { UserRole } from '../../types';

interface StudentServicesViewProps {
  userRole: UserRole;
  onNavigateToCampus: () => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onPreviewStudent?: (id: string) => void;
}

export const StudentServicesView: React.FC<StudentServicesViewProps> = ({ 
  userRole, 
  onNavigateToCampus,
  onShowToast,
  onPreviewStudent
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(
    userRole === 'TEACHER' ? 'classes' : userRole === 'STUDENT' ? 'profile' : 'students'
  );

  const teacherTabs = [
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'students', label: 'Assigned Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'results', label: 'Gradebook', icon: Award },
  ];

  const studentTabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'fees', label: 'Fees & Receipts', icon: CreditCard },
  ];

  const adminTabs = [
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'results', label: 'Gradebook', icon: Award },
  ];

  const tabs = userRole === 'TEACHER' ? teacherTabs : userRole === 'STUDENT' ? studentTabs : adminTabs;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateToCampus}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus
          </button>
          <h1 className="text-xl font-bold text-slate-900">Student Services</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeSubTab === tab.id ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {activeSubTab === 'classes' && <ClassesView onShowToast={onShowToast} onNavigateToStudents={() => setActiveSubTab('students')} />}
          {activeSubTab === 'students' && <StudentsView onShowToast={onShowToast} onPreviewStudent={onPreviewStudent} />}
          {activeSubTab === 'attendance' && <AttendanceView onShowToast={onShowToast} />}
          {activeSubTab === 'results' && <ResultsView onShowToast={onShowToast} />}
          {activeSubTab === 'timetable' && <TimetableView onShowToast={onShowToast} />}
          {activeSubTab === 'fees' && <FeesView onShowToast={onShowToast} />}
          {activeSubTab === 'profile' && (
            <div className="h-full flex flex-col items-center justify-center">
               <p className="text-slate-500 mb-4">Click below to view your full profile and records.</p>
               <button 
                 onClick={() => {
                    const studentId = localStorage.getItem('auth_linked_student_id');
                    if (studentId && onPreviewStudent) onPreviewStudent(studentId);
                 }}
                 className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md transition-all"
               >
                 Open My Profile
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
