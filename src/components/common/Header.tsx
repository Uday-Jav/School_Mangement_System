import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, LogOut, ShieldCheck, ChevronDown, Check, X, Sparkles, User, Users, FileText, CheckSquare, PlusCircle
} from 'lucide-react';
import { UserRole } from '../../types';
import { mockNotices, mockStudents, mockTeachers, mockClasses } from '../../data/mockData';

interface HeaderProps {
  currentTab: string;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (tab: string) => void;
  onPreviewStudent?: (id: string) => void;
  is3DMode: boolean;
  onToggle3DMode: (mode: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onRoleChange,
  onNavigate,
  onPreviewStudent,
  is3DMode,
  onToggle3DMode
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Administrator', desc: 'Full System Access' },
    { role: 'TEACHER', label: 'Teacher / Faculty', desc: 'Classes, Attendance & Marks' },
    { role: 'STUDENT', label: 'Student / Learner', desc: 'Personal Results & Schedule' },
    { role: 'PARENT', label: 'Parent / Guardian', desc: 'Notices & Children Stats' },
    { role: 'ACCOUNTANT', label: 'Accountant / Finance', desc: 'Fee Collections & Receipts' },
    { role: 'LIBRARIAN', label: 'Librarian', desc: 'Book Catalog & Returns' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearch(e.target.value);
    setShowSearchDropdown(true);
  };

  const query = globalSearch.toLowerCase();
  const searchStudents = query ? mockStudents.filter(s => s.full_name.toLowerCase().includes(query) || s.admission_no.toLowerCase().includes(query)).slice(0, 3) : [];
  const searchTeachers = query ? mockTeachers.filter(t => t.full_name.toLowerCase().includes(query)).slice(0, 2) : [];
  const searchClasses = query ? mockClasses.filter(c => c.name.toLowerCase().includes(query)).slice(0, 2) : [];

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    if (searchStudents.length > 0) onPreviewStudent?.(searchStudents[0].id);
    else if (searchTeachers.length > 0) onNavigate('teachers');
    else if (searchClasses.length > 0) onNavigate('classes');
    else onNavigate('dashboard');
    setShowSearchDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm hidden sm:block" ref={searchRef}>
        <form onSubmit={handleGlobalSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            value={globalSearch}
            onChange={handleGlobalSearchChange}
            onFocus={() => globalSearch && setShowSearchDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search students, teachers, classes..."
            className="w-full pl-9 pr-3 py-1.5 text-sm font-medium bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => { setGlobalSearch(''); setShowSearchDropdown(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-700 hover:text-slate-950"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {showSearchDropdown && globalSearch && (
          <div className="absolute top-full mt-2 w-full max-w-[400px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
            {searchStudents.length === 0 && searchTeachers.length === 0 && searchClasses.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No matching records found.
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Quick Actions</span>
                  <button onClick={() => onNavigate('attendance')} className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 text-left rounded">
                    <CheckSquare className="w-4 h-4 text-teal-600" /> Take Attendance
                  </button>
                  <button onClick={() => onNavigate('students')} className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 text-left rounded">
                    <PlusCircle className="w-4 h-4 text-indigo-600" /> Add Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto p-2 space-y-4">
                {searchStudents.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1">Students</h4>
                    {searchStudents.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => { onPreviewStudent?.(s.id); setShowSearchDropdown(false); }}
                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-semibold text-slate-900">{s.full_name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{s.class_name}-{s.section_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchTeachers.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1">Teachers</h4>
                    {searchTeachers.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => { onNavigate('teachers'); setShowSearchDropdown(false); }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-900">{t.full_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchClasses.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1">Classes</h4>
                    {searchClasses.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => { onNavigate('classes'); setShowSearchDropdown(false); }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <button className="sm:hidden p-2 text-slate-600 hover:text-slate-900"><Search className="w-5 h-5" /></button>

      {/* 3D Campus / Dashboard Switch */}
      <div className="flex-1 flex justify-center items-center">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onToggle3DMode(true)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              is3DMode ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D Campus
          </button>
          <button
            onClick={() => onToggle3DMode(false)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              !is3DMode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Right User Actions & Role Selector */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <div className="relative">
          <button
            onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowNotifDropdown(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg ${
              userRole === 'ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              userRole === 'TEACHER' ? 'bg-teal-50 text-teal-700 border-teal-200' :
              userRole === 'STUDENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              userRole === 'ACCOUNTANT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-purple-50 text-purple-700 border-purple-200'
            } transition-all`}
          >
            <ShieldCheck className="w-4 h-4 hidden sm:block" />
            <span className="uppercase">{userRole}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => { onRoleChange(r.role); setShowRoleDropdown(false); }}
                    className={`w-full text-left p-2.5 rounded-lg text-sm flex items-center justify-between font-medium transition-all ${
                      userRole === r.role ? 'bg-teal-50 text-teal-800' : 'bg-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{r.label}</div>
                      <div className={`text-[11px] ${userRole === r.role ? 'text-teal-600' : 'text-slate-500'}`}>{r.desc}</div>
                    </div>
                    {userRole === r.role && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowRoleDropdown(false); }}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors relative text-slate-600"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">4</span>
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs uppercase text-slate-700">System Notifications</h4>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-semibold text-[10px] rounded-full">4 New</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {mockNotices.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <p className="font-semibold text-sm text-slate-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{n.content}</p>
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mt-2">
                      <span>{n.published_date}</span>
                      <span className="text-teal-700">{n.created_by}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('notices')} className="w-full mt-3 py-2 text-center text-sm font-semibold bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">View All Notices</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 md:gap-3 md:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
            {userRole.substring(0, 2)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-900 leading-none mb-1">
              {userRole === 'ADMIN' ? 'Dr. Arthur Pendelton' : userRole === 'TEACHER' ? 'Dr. Robert Vance' : userRole === 'STUDENT' ? 'Isaac Ibrahim' : userRole === 'PARENT' ? 'Mrs. Ibrahim' : userRole === 'ACCOUNTANT' ? 'Mark Sterling' : 'Elena Rostova'}
            </div>
            <div className="text-[11px] text-slate-500 tracking-tight">Academic Year 2025-26</div>
          </div>
          <button onClick={() => onNavigate('settings')} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 md:ml-1 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
