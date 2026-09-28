import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Exam, ExamSchedule } from '../../types';
import { examService } from '../../services/examService';
import { FileText, Calendar, Clock, Plus, Eye, Edit3 } from 'lucide-react';

interface ExaminationsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ExaminationsView: React.FC<ExaminationsViewProps> = ({ onShowToast }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newStartDate, setNewStartDate] = useState('2026-11-10');
  const [newEndDate, setNewEndDate] = useState('2026-11-20');
  const [newTotalMarks, setNewTotalMarks] = useState(100);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedExams = await examService.getExams();
    const loadedSchedules = await examService.getExamSchedules();
    setExams(loadedExams);
    setSchedules(loadedSchedules);
    if (loadedExams.length > 0 && !selectedExam) {
      setSelectedExam(loadedExams[0]);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName) return;
    
    await examService.createExam({
      name: newExamName,
      academic_year: '2025-2026',
      start_date: newStartDate,
      end_date: newEndDate,
      status: 'Upcoming',
      total_marks: newTotalMarks
    });
    
    onShowToast('Exam Created', `Scheduled new assessment ${newExamName}`, 'success');
    setIsAddExamOpen(false);
    setNewExamName('');
    loadData();
  };

  const columns: Column<Exam>[] = [
    {
      header: 'Exam Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-black text-slate-950">{row.name}</span>
    },
    { header: 'Academic Year', accessorKey: 'academic_year', sortable: true },
    { header: 'Start Date', accessorKey: 'start_date', sortable: true },
    { header: 'End Date', accessorKey: 'end_date', sortable: true },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  const filteredSchedules = selectedExam 
    ? schedules.filter(s => s.exam_id === selectedExam.id)
    : schedules;

  return (
    <div className="space-y-6">
      <PageHeader
        title="EXAMINATION MANAGEMENT"
        subtitle="Schedule term evaluations, paper schedules, exam centers, and pass marks."
        breadcrumbItems={[{ label: 'Examinations' }]}
        primaryAction={{
          label: 'CREATE NEW EXAM',
          onClick: () => setIsAddExamOpen(true)
        }}
      />

      {/* EXAM LIST TABLE */}
      <DataTable<Exam>
        data={exams}
        columns={columns}
        searchPlaceholder="Search examination term..."
        keyExtractor={(item) => item.id}
        pageSize={5}
        onRowClick={(row) => setSelectedExam(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedExam(row)}
            className="p-1.5 bg-amber-300 border border-slate-900 font-extrabold text-[10px] flex items-center gap-1 uppercase"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW DATES</span>
          </button>
        )}
      />

      {/* DETAILED SCHEDULE TIMETABLE FOR SELECTED EXAM */}
      {selectedExam && (
        <div className="bg-white border-3 border-slate-900 brutal-shadow p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-900">
            <div>
              <h3 className="text-lg font-black text-slate-950 uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>EXAM SCHEDULE: {selectedExam.name.toUpperCase()}</span>
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Term: {selectedExam.academic_year} | Duration: {selectedExam.start_date} to {selectedExam.end_date}
              </p>
            </div>
            <StatusBadge status={selectedExam.status} />
          </div>

          <div className="overflow-x-auto border-2 border-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase">
                  <th className="p-3">SUBJECT</th>
                  <th className="p-3">TARGET CLASS</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3">TIME SLOT</th>
                  <th className="p-3">VENUE / ROOM</th>
                  <th className="p-3">MAX / PASS MARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 font-semibold">
                {filteredSchedules.map((sc) => (
                  <tr key={sc.id} className="hover:bg-amber-100/50">
                    <td className="p-3 font-extrabold text-indigo-900">{sc.subject_name}</td>
                    <td className="p-3 font-bold">{sc.class_name}</td>
                    <td className="p-3 font-mono">{sc.date}</td>
                    <td className="p-3">{sc.start_time} - {sc.end_time}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-200 border border-slate-900 font-black">{sc.room_number}</span></td>
                    <td className="p-3">{sc.max_marks} / <strong className="text-emerald-700">{sc.pass_marks}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="CREATE ASSESSMENT TERM"
        subtitle="Specify examination term details and dates."
      >
        <form onSubmit={handleAddExam} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">EXAM NAME (e.g. Unit Test 2, Mid Term)</label>
            <input
              type="text"
              required
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">START DATE</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">END DATE</label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">TOTAL MAXIMUM MARKS</label>
            <input
              type="number"
              required
              min={1}
              value={newTotalMarks}
              onChange={(e) => setNewTotalMarks(Number(e.target.value))}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsAddExamOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase"
            >
              CREATE EXAM
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
