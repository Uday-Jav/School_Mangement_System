import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { 
  BarChart3, 
  Printer, 
  CalendarCheck, 
  DollarSign, 
  Award, 
  Library, 
  Bus,
  FileSpreadsheet
} from 'lucide-react';
import { mockClasses, mockStudents, mockPayments } from '../../data/mockData';

interface ReportsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onShowToast }) => {
  const [reportTab, setReportTab] = useState<'academic' | 'attendance' | 'finance'>('academic');
  const [startDate, setStartDate] = useState('2025-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [selectedClass, setSelectedClass] = useState('All Classes');

  const handleExportCSV = () => {
    onShowToast('CSV Report Downloaded', `Generated ${reportTab.toUpperCase()} report in CSV format`, 'success');
  };

  const handleExportPDF = () => {
    onShowToast('PDF Report Generated', `Compiled official PDF document for ${reportTab.toUpperCase()}`, 'info');
    window.print();
  };

  const filteredClasses = selectedClass === 'All Classes' ? mockClasses : mockClasses.filter(c => c.name === selectedClass);

  return (
    <div className="space-y-6">
      <PageHeader
        title="REPORTS & SYSTEM ANALYTICS"
        subtitle="Institutional data aggregation, academic statistics, financial audits, & exportable reports."
        breadcrumbItems={[{ label: 'Reports' }]}
        primaryAction={{
          label: 'EXPORT CSV',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          onClick: handleExportCSV
        }}
        secondaryAction={{
          label: 'PRINT PDF',
          icon: <Printer className="w-4 h-4" />,
          onClick: handleExportPDF
        }}
      />

      {/* FILTER CONTROL BAR */}
      <div className="bg-amber-300 border-3 border-slate-900 brutal-shadow p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">DATE FROM</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">DATE TO</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">FILTER CLASS</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            >
              <option value="All Classes">All Classes</option>
              {mockClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={() => onShowToast('Filter Applied', 'Refreshed report aggregation parameters', 'info')}
          className="px-4 py-2 text-xs font-black bg-indigo-600 text-white border-2 border-slate-900 brutal-shadow-sm uppercase"
        >
          GENERATE REPORT
        </button>
      </div>

      {/* REPORT DOMAIN NAVIGATION TABS */}
      <div className="flex border-b-3 border-slate-900 gap-1 overflow-x-auto">
        {[
          { id: 'academic', label: 'Academic Performance', icon: Award },
          { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
          { id: 'finance', label: 'Fee & Financial Audit', icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = reportTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setReportTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black border-t-2 border-x-2 border-slate-900 uppercase ${
                isActive ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT PANEL */}
      <div className="bg-white border-3 border-slate-900 brutal-shadow p-5 printable-area">
        {reportTab === 'academic' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2">
              ACADEMIC MARKS SUMMARY & GRADE DISTRIBUTION
            </h3>
            
            <table className="w-full text-left text-xs border-2 border-slate-900">
              <thead className="bg-slate-900 text-white font-black uppercase">
                <tr>
                  <th className="p-2.5">CLASS</th>
                  <th className="p-2.5">ENROLLED</th>
                  <th className="p-2.5">EXAM TAKEN</th>
                  <th className="p-2.5">PASSED</th>
                  <th className="p-2.5">FAILED</th>
                  <th className="p-2.5">AVG SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-bold">
                {filteredClasses.map((cls, i) => {
                  const enrolled = mockStudents.filter(s => s.class_name === cls.name).length;
                  const taken = enrolled;
                  const passed = enrolled > 0 ? enrolled - (i === 4 ? 1 : 0) : 0;
                  const failed = taken - passed;
                  const avg = 82 + (i * 2) % 10;
                  return (
                    <tr key={cls.id} className="hover:bg-amber-50">
                      <td className="p-2.5 font-black text-indigo-950">{cls.name}</td>
                      <td className="p-2.5">{enrolled}</td>
                      <td className="p-2.5">{taken}</td>
                      <td className="p-2.5 text-emerald-700 font-black">{passed}</td>
                      <td className="p-2.5 text-rose-700 font-black">{failed}</td>
                      <td className="p-2.5 font-mono">{avg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2">
              CLASS-WISE ATTENDANCE SUMMARY
            </h3>
            <table className="w-full text-left text-xs border-2 border-slate-900">
              <thead className="bg-slate-900 text-white font-black uppercase">
                <tr>
                  <th className="p-2.5">CLASS</th>
                  <th className="p-2.5">TOTAL STUDENTS</th>
                  <th className="p-2.5">AVG. ATTENDANCE (%)</th>
                  <th className="p-2.5">LOW ATTENDANCE (&lt;75%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-bold">
                {filteredClasses.map((cls) => {
                  const students = mockStudents.filter(s => s.class_name === cls.name);
                  const count = students.length;
                  const totalAtt = students.reduce((sum, s) => sum + s.attendance_percentage, 0);
                  const avgAtt = count ? (totalAtt / count).toFixed(1) : '0.0';
                  const lowAtt = students.filter(s => s.attendance_percentage < 75).length;
                  return (
                    <tr key={cls.id} className="hover:bg-amber-50">
                      <td className="p-2.5 font-black text-indigo-950">{cls.name}</td>
                      <td className="p-2.5">{count}</td>
                      <td className="p-2.5 font-mono text-emerald-700">{avgAtt}%</td>
                      <td className="p-2.5 font-mono text-rose-700">{lowAtt} Students</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportTab === 'finance' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2">
              CLASS-WISE FEE COLLECTION SUMMARY
            </h3>
            <table className="w-full text-left text-xs border-2 border-slate-900">
              <thead className="bg-slate-900 text-white font-black uppercase">
                <tr>
                  <th className="p-2.5">CLASS</th>
                  <th className="p-2.5">TOTAL STUDENTS</th>
                  <th className="p-2.5">FULLY PAID</th>
                  <th className="p-2.5">PENDING/OVERDUE</th>
                  <th className="p-2.5">COLLECTION RATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-bold">
                {filteredClasses.map((cls) => {
                  const students = mockStudents.filter(s => s.class_name === cls.name);
                  const count = students.length;
                  const paid = students.filter(s => s.fee_status === 'Paid').length;
                  const pending = count - paid;
                  const rate = count ? ((paid / count) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={cls.id} className="hover:bg-amber-50">
                      <td className="p-2.5 font-black text-indigo-950">{cls.name}</td>
                      <td className="p-2.5">{count}</td>
                      <td className="p-2.5 font-mono text-emerald-700">{paid}</td>
                      <td className="p-2.5 font-mono text-rose-700">{pending}</td>
                      <td className="p-2.5 font-mono">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
