import React, { useState, useEffect } from 'react';
import { canMutateAttendance } from '../../utils/permissions';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { AttendanceRecord, Student } from '../../types';
import { attendanceService } from '../../services/attendanceService';
import { mockStudents } from '../../data/mockData';
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  BarChart2,
  Wifi,
  WifiOff,
  CloudOff,
  CloudRain,
  RefreshCw
} from 'lucide-react';

interface AttendanceViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onShowToast }) => {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState('2026-08-31');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline_draft' | 'failed' | 'conflict'>('synced');
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedSection, selectedDate]);

  const loadAttendance = async () => {
    const existing = await attendanceService.getAttendanceRecords(selectedClass, selectedSection, selectedDate);
    
    // If no existing record for date, initialize from mock students of that class/section
    const targetStudents = mockStudents.filter(
      s => s.class_name === selectedClass && s.section_name === selectedSection
    );

    const merged: AttendanceRecord[] = targetStudents.map(student => {
      const found = existing.find(e => e.student_id === student.id);
      if (found) return found;
      return {
        id: `att-${student.id}-${selectedDate}`,
        student_id: student.id,
        student_name: student.full_name,
        roll_no: student.roll_no,
        class_name: selectedClass,
        section_name: selectedSection,
        date: selectedDate,
        status: 'Present',
        remarks: 'On Time'
      };
    });

    setRecords(merged);
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setRecords(records.map(r => r.student_id === studentId ? { ...r, status } : r));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRecords(records.map(r => r.student_id === studentId ? { ...r, remarks } : r));
  };

  const handleMarkAllPresent = () => {
    setRecords(records.map(r => ({ ...r, status: 'Present', remarks: 'On Time' })));
    onShowToast('Marked All Present', `Set all ${records.length} students to Present`, 'info');
  };

  const handleSaveAttendance = async () => {
    setSyncStatus('pending');
    
    // In a real app, this would save to IndexedDB. We simulate local persistence.
    // await attendanceService.saveDraftLocal(records);

    if (isSimulatingOffline) {
      setTimeout(async () => {
        await attendanceService.saveAttendance(records);
        setSyncStatus('offline_draft');
        onShowToast(
          'Saved on this device',
          `Draft saved locally for ${selectedClass}-${selectedSection}. (No backend connection)`,
          'info'
        );
      }, 500);
      return;
    }

    setTimeout(async () => {
      try {
        await attendanceService.saveAttendance(records);
        setSyncStatus('synced');
        onShowToast(
          'Attendance Saved (Simulated Sync)',
          `Successfully registered roll call for ${selectedClass}-${selectedSection}`,
          'success'
        );
      } catch (err) {
        setSyncStatus('failed');
        onShowToast(
          'Sync Failed',
          `Could not reach server. Saved as local draft.`,
          'error'
        );
      }
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  // Analytics
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const leaveCount = records.filter(r => r.status === 'Leave').length;

  const attendancePercentage = records.length > 0 
    ? Math.round(((presentCount + lateCount) / records.length) * 100)
    : 100;

  const lowAttendanceStudents = mockStudents.filter(s => s.attendance_percentage < 75);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATTENDANCE MANAGEMENT"
        subtitle="Daily roll call marking, absence tracking, leave approval & threshold alerts."
        breadcrumbItems={[{ label: 'Attendance' }]}
        primaryAction={canMutateAttendance() ? {
          label: syncStatus === 'pending' ? 'Saving...' : 'Save Roll Call',
          icon: syncStatus === 'pending' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />,
          onClick: handleSaveAttendance
        } : undefined}
        secondaryAction={canMutateAttendance() ? {
          label: 'Mark All Present',
          icon: <CheckCircle2 className="w-4 h-4" />,
          onClick: handleMarkAllPresent
        } : undefined}
        printAction={handlePrint}
      />

      {/* SYNC SIMULATION TOGGLE */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulatingOffline(!isSimulatingOffline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isSimulatingOffline ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isSimulatingOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isSimulatingOffline ? 'Network: Offline (Simulated)' : 'Network: Online'}</span>
          </button>
          
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            {syncStatus === 'synced' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span>Synced to demo backend</span></>}
            {syncStatus === 'pending' && <><RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" /> <span>Syncing...</span></>}
            {syncStatus === 'offline_draft' && <><CloudOff className="w-3.5 h-3.5 text-slate-500" /> <span>Saved on this device (Draft)</span></>}
            {syncStatus === 'failed' && <><CloudRain className="w-3.5 h-3.5 text-rose-500" /> <span>Sync failed. Local draft active.</span></>}
          </div>
        </div>
        <p className="text-[10px] text-slate-400">Toggle offline mode to test draft saving behavior.</p>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="premium-card p-4 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="premium-input w-32"
            >
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="premium-input w-28"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="premium-input w-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 font-medium text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            Present: <span className="font-bold">{presentCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            Absent: <span className="font-bold">{absentCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
            Late: <span className="font-bold">{lateCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
            Leave: <span className="font-bold">{leaveCount}</span>
          </div>
        </div>
      </div>

      {/* ANALYTICS BANNER & LOW ATTENDANCE ALERT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-5 flex items-center justify-between border-l-4 border-l-teal-500">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Daily Class Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{attendancePercentage}%</h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Monthly Average Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">94.8%</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="premium-card p-5 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Critical Alerts (&lt;75%)</p>
            <h3 className="text-2xl font-bold text-rose-700 tracking-tight">{lowAttendanceStudents.length} Students</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ROLL CALL TABLE */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            Roll Call Sheet: {selectedClass} - {selectedSection} ({selectedDate})
          </h3>
          <span className="text-sm font-medium text-slate-500">Total Roster: {records.length} Students</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Quick Actions</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((rec) => (
                <tr key={rec.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-medium text-slate-500">{rec.roll_no}</td>
                  <td className="p-3 font-semibold text-slate-900">{rec.student_name}</td>
                  <td className="p-3">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
{!canMutateAttendance() && <span className="font-semibold text-slate-700">{rec.status}</span>}
{canMutateAttendance() && (<>
                      <button
                        onClick={() => handleStatusChange(rec.student_id, 'Present')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          rec.status === 'Present' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(rec.student_id, 'Absent')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          rec.status === 'Absent' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(rec.student_id, 'Late')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          rec.status === 'Late' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => handleStatusChange(rec.student_id, 'Leave')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          rec.status === 'Leave' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        Leave
                      </button>
                    </>)}
</div>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={rec.remarks || ''}
                      onChange={(e) => handleRemarksChange(rec.student_id, e.target.value)}
                      placeholder="Add note..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
