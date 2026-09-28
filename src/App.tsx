import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { StudentPreviewPanel } from './components/common/StudentPreviewPanel';
import { UserRole } from './types';

// Lazy-loaded Module Views
const DashboardView = lazy(() => import('./components/modules/DashboardView').then(m => ({ default: m.DashboardView })));
const AdmissionsView = lazy(() => import('./components/modules/AdmissionsView').then(m => ({ default: m.AdmissionsView })));
const ParentDashboardView = lazy(() => import('./components/modules/ParentDashboardView').then(m => ({ default: m.ParentDashboardView })));
const StudentsView = lazy(() => import('./components/modules/StudentsView').then(m => ({ default: m.StudentsView })));
// const CampusView = lazy(() => import('./components/modules/CampusView').then(m => ({ default: m.CampusView })));
const TimetableView = lazy(() => import('./components/modules/TimetableView').then(m => ({ default: m.TimetableView })));
const ResultsView = lazy(() => import('./components/modules/ResultsView').then(m => ({ default: m.ResultsView })));
const FeesView = lazy(() => import('./components/modules/FeesView').then(m => ({ default: m.FeesView })));
const NoticesView = lazy(() => import('./components/modules/NoticesView').then(m => ({ default: m.NoticesView })));
const ReportsView = lazy(() => import('./components/modules/ReportsView').then(m => ({ default: m.ReportsView })));
const OfflineSyncDemoView = lazy(() => import('./components/modules/OfflineSyncDemoView').then(m => ({ default: m.OfflineSyncDemoView })));
const NotFoundView = lazy(() => import('./components/modules/NotFoundView').then(m => ({ default: m.NotFoundView })));

// Restored & Coming Soon
const TeachersView = lazy(() => import('./components/modules/TeachersView').then(m => ({ default: m.TeachersView })));
const ClassesView = lazy(() => import('./components/modules/ClassesView').then(m => ({ default: m.ClassesView })));
const AttendanceView = lazy(() => import('./components/modules/AttendanceView').then(m => ({ default: m.AttendanceView })));
const SubjectsView = lazy(() => import('./components/modules/SubjectsView').then(m => ({ default: m.SubjectsView })));
const ExaminationsView = lazy(() => import('./components/modules/ExaminationsView').then(m => ({ default: m.ExaminationsView })));
const LibraryView = lazy(() => import('./components/modules/LibraryView').then(m => ({ default: m.LibraryView })));
const TransportView = lazy(() => import('./components/modules/TransportView').then(m => ({ default: m.TransportView })));
const EventsView = lazy(() => import('./components/modules/EventsView').then(m => ({ default: m.EventsView })));
const UsersView = lazy(() => import('./components/modules/UsersView').then(m => ({ default: m.UsersView })));
const SettingsView = lazy(() => import('./components/modules/SettingsView').then(m => ({ default: m.SettingsView })));
const ComingSoonView = lazy(() => import('./components/modules/ComingSoonView').then(m => ({ default: m.ComingSoonView })));

import { Campus3DView } from './components/modules/Campus3DView';
import { StudentServicesView } from './components/modules/StudentServicesView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AssistantWidget } from './components/common/AssistantWidget';

import { authService } from './services/authService';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>((localStorage.getItem('current_role') as UserRole) || 'ADMIN');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Perform login whenever role changes to get the correct token
    authService.login(userRole).then(user => setCurrentUser(user)).catch(e => console.error('Login failed', e));
  }, [userRole]);

  // Action states for opening specific modals directly when switching tabs
  const [triggerAddStudent, setTriggerAddStudent] = useState(false);
  const [triggerAddTeacher, setTriggerAddTeacher] = useState(false);
  const [triggerRecordPayment, setTriggerRecordPayment] = useState(false);
  const [triggerCreateNotice, setTriggerCreateNotice] = useState(false);
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'campus') {
      setIs3DMode(true);
    } else if (tab !== 'dashboard') {
      setIs3DMode(false);
    }
    setTriggerAddStudent(false);
    setTriggerAddTeacher(false);
    setTriggerRecordPayment(false);
    setTriggerCreateNotice(false);
  };

  const handleQuickAddStudent = () => {
    setTriggerAddStudent(true);
    setActiveTab('students');
  };

  const handleQuickAddTeacher = () => {
    setTriggerAddTeacher(true);
    setActiveTab('teachers');
  };

  const handleQuickRecordPayment = () => {
    setTriggerRecordPayment(true);
    setActiveTab('fees');
  };

  const handleQuickCreateNotice = () => {
    setTriggerCreateNotice(true);
    setActiveTab('notices');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-900">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={userRole}
      />

      {/* Main Right Content Layout */}
      <div className="relative flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={activeTab}
          userRole={userRole}
          onRoleChange={(newRole) => {
            localStorage.setItem('current_role', newRole);
            authService.logout();
            setUserRole(newRole);
            showToast('Role Changed', `System mode set to ${newRole}`, 'info');
            // Force reload to clear all in-memory service caches and re-fetch with new token
            setTimeout(() => window.location.reload(), 500);
          }}
          onNavigate={handleNavigate}
          onPreviewStudent={setPreviewStudentId}
          is3DMode={is3DMode}
          onToggle3DMode={setIs3DMode}
        />

        {/* Scrollable Viewport */}
        <main className={`flex-1 overflow-y-auto ${is3DMode ? 'overflow-hidden' : 'p-4 md:p-6 lg:p-8'}`}>
          <div className={`w-full h-full ${is3DMode ? 'block' : 'hidden'}`}>
            <ErrorBoundary fallback={
              <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-slate-900 text-white p-8">
                <h1 className="text-2xl font-bold mb-4">3D Campus failed to load</h1>
                <p className="text-slate-400 mb-8 max-w-md text-center">
                  There was a problem loading the 3D environment or its assets. You can still access all features through the normal dashboard.
                </p>
                <button
                  onClick={() => {
                    setIs3DMode(false);
                    setActiveTab('dashboard');
                  }}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-bold transition-all shadow-lg"
                >
                  Open Normal Dashboard
                </button>
              </div>
            }>
              <Campus3DView userRole={userRole} userId={currentUser?.id} onNavigate={handleNavigate} isActive={is3DMode} />
            </ErrorBoundary>
          </div>

          <div className={`max-w-7xl mx-auto ${is3DMode ? 'hidden' : 'block'}`}>
            <Suspense fallback={
              <div className="h-full flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Module...</p>
                </div>
              </div>
            }>
              {activeTab === 'dashboard' && userRole === 'PARENT' && (
                <ParentDashboardView
                  onShowToast={showToast}
                  onPreviewStudent={setPreviewStudentId}
                />
              )}

              {activeTab === 'dashboard' && userRole !== 'PARENT' && (
                <DashboardView
                  userRole={userRole}
                  onNavigate={handleNavigate}
                  onOpenAddStudent={handleQuickAddStudent}
                  onOpenAddTeacher={handleQuickAddTeacher}
                  onOpenRecordPayment={handleQuickRecordPayment}
                  onOpenCreateNotice={handleQuickCreateNotice}
                  onPreviewStudent={setPreviewStudentId}
                />
              )}

              {activeTab === 'admissions' && (
                <AdmissionsView
                  onShowToast={showToast}
                  onPreviewStudent={setPreviewStudentId}
                />
              )}

              {activeTab === 'student_services' && (
                <StudentServicesView
                  userRole={userRole}
                  onNavigateToCampus={() => handleNavigate('campus')}
                  onShowToast={showToast}
                  onPreviewStudent={setPreviewStudentId}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  onShowToast={showToast}
                  openAddModalInitially={triggerAddStudent}
                  onPreviewStudent={setPreviewStudentId}
                />
              )}

              {activeTab === 'timetable' && (
                <TimetableView onShowToast={showToast} />
              )}

              {activeTab === 'results' && (
                <ResultsView onShowToast={showToast} />
              )}

              {activeTab === 'fees' && (
                <FeesView
                  onShowToast={showToast}
                  openRecordPaymentInitially={triggerRecordPayment}
                />
              )}

              {activeTab === 'notices' && (
                <NoticesView
                  onShowToast={showToast}
                  openCreateNoticeInitially={triggerCreateNotice}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView onShowToast={showToast} />
              )}

              {activeTab === 'offline' && (
                <OfflineSyncDemoView />
              )}

              {activeTab === 'teachers' && (
                <TeachersView
                  onShowToast={showToast}
                  openAddModalInitially={triggerAddTeacher}
                />
              )}

              {activeTab === 'classes' && (
                <ClassesView
                  onShowToast={showToast}
                  onNavigateToStudents={() => setActiveTab('students')}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView onShowToast={showToast} />
              )}

              {activeTab === 'subjects' && (
                <SubjectsView onShowToast={showToast} />
              )}

              {activeTab === 'examinations' && (
                <ExaminationsView onShowToast={showToast} />
              )}

              {activeTab === 'library' && (
                <LibraryView onShowToast={showToast} />
              )}

              {activeTab === 'transport' && (
                <TransportView onShowToast={showToast} />
              )}

              {activeTab === 'events' && (
                <EventsView onShowToast={showToast} />
              )}

              {activeTab === 'users' && (
                <UsersView onShowToast={showToast} onRoleChange={setUserRole} />
              )}

              {activeTab === 'settings' && (
                <SettingsView onShowToast={showToast} />
              )}
            </Suspense>
          </div>
        </main>
      </div>
      
      {/* Global Modals & Panels */}
      <StudentPreviewPanel 
        studentId={previewStudentId} 
        onClose={() => setPreviewStudentId(null)}
        onNavigateToFullProfile={() => {
          setActiveTab('students');
        }}
      />
      
      <AssistantWidget userRole={userRole} userId={currentUser?.id} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
