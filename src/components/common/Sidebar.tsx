import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  School, 
  BookOpen, 
  CalendarCheck, 
  Clock, 
  FileText, 
  Award, 
  CreditCard, 
  Library, 
  Bus, 
  Bell, 
  Calendar, 
  UserCog, 
  BarChart3, 
  Settings, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight,
  Map as MapIcon
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN'] },
    { id: 'student_services', label: 'Student Services', icon: UserCheck, badge: null, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'admissions', label: 'Admissions', icon: UserCheck, badge: null, roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'students', label: 'Students', icon: Users, badge: '50', roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
    { id: 'teachers', label: 'Teachers', icon: UserCheck, badge: '20', roles: ['ADMIN', 'TEACHER'] },
    { id: 'classes', label: 'Classes & Sections', icon: School, badge: '7', roles: ['ADMIN', 'TEACHER'] },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: '17', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, badge: '96%', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'campus', label: 'Campus Map', icon: MapIcon, badge: null, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN'] },
    { id: 'timetable', label: 'Timetable', icon: Clock, badge: null, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'examinations', label: 'Examinations', icon: FileText, badge: '3', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'results', label: 'Results', icon: Award, badge: null, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard, badge: '$', roles: ['ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'] },
    { id: 'library', label: 'Library', icon: Library, badge: '7', roles: ['ADMIN', 'LIBRARIAN', 'TEACHER', 'STUDENT'] },
    { id: 'transport', label: 'Transport', icon: Bus, badge: '4', roles: ['ADMIN', 'STUDENT'] },
    { id: 'notices', label: 'Notices', icon: Bell, badge: '4', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN'] },
    { id: 'events', label: 'Events', icon: Calendar, badge: '3', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'users', label: 'Users', icon: UserCog, badge: '5', roles: ['ADMIN'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, badge: null, roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] },
    { id: 'offline', label: 'Offline Sync Demo', icon: Settings, badge: 'Demo', roles: ['ADMIN', 'TEACHER'] },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside 
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-200 z-30 shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-teal-700 text-white rounded-lg shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">Schooldesk</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Academic SIS</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto p-2 bg-teal-700 text-white rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between p-2.5 text-sm transition-all rounded-lg mb-0.5 ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              } ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {userRole}
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-slate-500 ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-slate-900" /> : <ChevronLeft className="w-4 h-4 text-slate-900" />}
        </button>
      </div>
    </aside>
  );
};
