import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { Notice, Student } from '../../types';
import { noticeService } from '../../services/noticeService';
import { mockStudents } from '../../data/mockData';
import { Bell, GraduationCap, Calendar, CheckCircle2, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface ParentDashboardViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onPreviewStudent?: (id: string) => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({ onShowToast, onPreviewStudent }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // For demo, we assume the logged in parent is the guardian of the first two students in mock data
  const children: Student[] = mockStudents.slice(0, 2);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    const data = await noticeService.getNotices();
    // Parents only see 'All' or 'Parents' notices
    setNotices(data.filter(n => n.target_audience === 'All' || n.target_audience === 'Parents'));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PARENT DASHBOARD"
        subtitle={`Welcome back, ${children[0]?.guardian.name || 'Guardian'}! Here is an overview of your children's progress.`}
        breadcrumbItems={[{ label: 'Parent Dashboard' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHILDREN STATS */}
        {children.map((child) => (
          <div key={child.id} className="bg-white border-3 border-slate-900 brutal-shadow p-5 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            
            <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-4">
              <div className="w-16 h-16 bg-indigo-100 border-2 border-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-black text-indigo-700">{child.first_name[0]}{child.last_name[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-950 uppercase">{child.full_name}</h3>
                <div className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {child.class_name} - Section {child.section_name} (Roll: {child.roll_no})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-emerald-50 border-2 border-slate-900 flex flex-col justify-center items-center text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-2xl font-black text-emerald-800">{child.attendance_percentage}%</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Attendance</span>
              </div>
              
              <div className={`p-3 border-2 border-slate-900 flex flex-col justify-center items-center text-center ${child.fee_status === 'Paid' ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                {child.fee_status === 'Paid' ? (
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 mb-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 mb-1" />
                )}
                <span className={`text-xl font-black uppercase ${child.fee_status === 'Paid' ? 'text-indigo-800' : 'text-rose-800'}`}>{child.fee_status}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Fee Status</span>
              </div>
            </div>

            <div className="mt-2 text-right">
              <button 
                onClick={() => onPreviewStudent?.(child.id)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase hover:bg-slate-800 w-full"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NOTICES SECTION */}
      <div className="bg-white border-3 border-slate-900 brutal-shadow p-5">
        <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-3 mb-4">
          <Bell className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-black text-slate-950 uppercase">School Notices & Circulars</h3>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-bold">No new notices for you at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <div key={n.id} className="p-4 bg-amber-50 border-2 border-slate-900 relative">
                <div className="absolute top-0 right-0 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase">
                  {n.published_date}
                </div>
                <h4 className="font-black text-slate-900 mt-2 mb-1">{n.title}</h4>
                <p className="text-sm font-medium text-slate-700 line-clamp-3">{n.content}</p>
                <div className="mt-3 text-[10px] font-black text-slate-500 uppercase">
                  Issued By: {n.created_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
