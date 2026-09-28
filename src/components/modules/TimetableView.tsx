import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TimetablePeriod } from '../../types';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import { ClassEntity, Section, Teacher, Subject } from '../../types';
import { mockTeachers, mockSubjects } from '../../data/mockData';
import { Clock, Plus, Edit3, Trash2, Calendar, MapPin, User, AlertTriangle, UserPlus } from 'lucide-react';

interface TimetableViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

type ViewMode = 'Class' | 'Teacher';

export const TimetableView: React.FC<TimetableViewProps> = ({ onShowToast }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Class');
  const [selectedClass, setSelectedClass] = useState('cls-10');
  const [selectedSection, setSelectedSection] = useState('sec-10a');
  const [selectedTeacher, setSelectedTeacher] = useState(mockTeachers[0].full_name);

  const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
  const [allTimetable, setAllTimetable] = useState<TimetablePeriod[]>([]); // needed for conflict detection
  const [loading, setLoading] = useState(true);

  // Dynamic Data
  const [classesList, setClassesList] = useState<ClassEntity[]>([]);
  const [sectionsList, setSectionsList] = useState<Section[]>([]);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPeriodSlot, setSelectedPeriodSlot] = useState<TimetablePeriod | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday',
    period_number: 1,
    start_time: '08:30 AM',
    end_time: '09:20 AM',
    subject_name: 'Mathematics',
    teacher_name: 'Dr. Robert Vance',
    room_number: '301'
  });

  const [substituteTeacher, setSubstituteTeacher] = useState('');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    const cls = await classService.getClasses();
    const sec = await classService.getSections();
    const tch = await teacherService.getTeachers();
    const sub = await subjectService.getSubjects();
    
    setClassesList(cls);
    setSectionsList(sec);
    setTeachersList(tch);
    setSubjectsList(sub);

    if (cls.length > 0 && !selectedClass) setSelectedClass(cls[0].id);
    if (tch.length > 0 && !selectedTeacher) setSelectedTeacher(tch[0].full_name);
  };

  useEffect(() => {
    if (classesList.length > 0 && teachersList.length > 0) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection, selectedTeacher, viewMode, classesList, teachersList]);

  const loadTimetable = async () => {
    setLoading(true);
    const all = await timetableService.getTimetable();
    setAllTimetable(all);
    
    if (viewMode === 'Class') {
      const data = await timetableService.getTimetable(selectedClass, selectedSection);
      setTimetable(data);
    } else {
      const data = await timetableService.getTimetable(undefined, undefined, selectedTeacher);
      setTimetable(data);
    }
    setLoading(false);
  };

  const handleOpenAddSlot = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', pNum: number) => {
    setSelectedPeriodSlot(null);
    setConflictMsg(null);
    setFormData({
      day,
      period_number: pNum,
      start_time: pNum === 1 ? '08:30 AM' : pNum === 2 ? '09:20 AM' : pNum === 3 ? '10:20 AM' : '11:10 AM',
      end_time: pNum === 1 ? '09:20 AM' : pNum === 2 ? '10:10 AM' : pNum === 3 ? '11:10 AM' : '12:00 PM',
      subject_name: mockSubjects[0].name,
      teacher_name: viewMode === 'Teacher' ? selectedTeacher : mockTeachers[0].full_name,
      room_number: '301'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditSlot = (slot: TimetablePeriod) => {
    setSelectedPeriodSlot(slot);
    setConflictMsg(null);
    setFormData({
      day: slot.day,
      period_number: slot.period_number,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject_name: slot.subject_name,
      teacher_name: slot.teacher_name,
      room_number: slot.room_number
    });
    setIsModalOpen(true);
  };

  const checkConflicts = () => {
    const overlapping = allTimetable.filter(t => t.day === formData.day && t.period_number === formData.period_number && t.id !== selectedPeriodSlot?.id);
    
    // Check if Teacher is busy
    const teacherBusy = overlapping.find(t => t.teacher_name === formData.teacher_name);
    if (teacherBusy) {
      return `Conflict: Teacher ${teacherBusy.teacher_name} is already assigned to Class ${teacherBusy.class_id} in Room ${teacherBusy.room_number}.`;
    }
    
    // Check if Room is busy
    const roomBusy = overlapping.find(t => t.room_number === formData.room_number);
    if (roomBusy) {
      return `Conflict: Room ${roomBusy.room_number} is already occupied by Class ${roomBusy.class_id}.`;
    }

    // Check if Class is busy (Only if creating from Teacher view for a different class)
    if (viewMode === 'Teacher') {
      // In a real app we'd need a class selector in teacher mode. 
      // For demo, we just assign it to selectedClass default if not provided
      const classBusy = overlapping.find(t => t.class_id === selectedClass && t.section_id === selectedSection);
      if (classBusy) {
         return `Conflict: Class is already scheduled for ${classBusy.subject_name}.`;
      }
    }
    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflicts();
    if (conflict) {
      setConflictMsg(conflict);
      return;
    }

    const payload = {
      class_id: selectedClass,
      section_id: selectedSection,
      day: formData.day,
      period_number: formData.period_number,
      start_time: formData.start_time,
      end_time: formData.end_time,
      subject_name: formData.subject_name,
      teacher_name: formData.teacher_name,
      room_number: formData.room_number
    };

    if (selectedPeriodSlot) {
      await timetableService.updatePeriod(selectedPeriodSlot.id, payload);
      onShowToast('Schedule Updated', `Updated slot successfully.`, 'success');
    } else {
      await timetableService.addPeriod(payload);
      onShowToast('Schedule Slot Saved', `Added ${formData.subject_name} for ${formData.day}`, 'success');
    }
    setIsModalOpen(false);
    loadTimetable();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await timetableService.deletePeriod(deleteId);
    onShowToast('Slot Cleared', 'Removed period from timetable.', 'info');
    setDeleteId(null);
    loadTimetable();
  };

  const handleSubstitute = async () => {
    if (!selectedPeriodSlot || !substituteTeacher) return;
    await timetableService.updatePeriod(selectedPeriodSlot.id, {
      teacher_name: substituteTeacher,
      subject_name: selectedPeriodSlot.subject_name + ' (Sub)'
    });
    onShowToast('Substitute Assigned', `Assigned ${substituteTeacher} successfully.`, 'success');
    setIsSubModalOpen(false);
    loadTimetable();
  };

  const getCellPeriod = (day: string, pNum: number) => {
    return timetable.find(t => t.day === day && t.period_number === pNum);
  };

  const getAvailableTeachers = () => {
    if (!selectedPeriodSlot) return [];
    // available teachers are those not in allTimetable for the same day and period
    const busyTeachers = allTimetable
      .filter(t => t.day === selectedPeriodSlot.day && t.period_number === selectedPeriodSlot.period_number)
      .map(t => t.teacher_name);
    return teachersList.filter(t => !busyTeachers.includes(t.full_name));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="TIMETABLE & SCHEDULING"
        subtitle="Manage class schedules, teacher assignments, and substitute covers."
        breadcrumbItems={[{ label: 'Timetable' }]}
      />

      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'Class' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('Class')}
          >
            Class View
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${viewMode === 'Teacher' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('Teacher')}
          >
            Teacher View
          </button>
        </div>

        {viewMode === 'Class' ? (
          <div className="flex gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2 px-3 text-sm font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="py-2 px-3 text-sm font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              {sectionsList.filter(s => s.class_id === selectedClass).map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="py-2 px-3 text-sm font-bold bg-white border-2 border-slate-900 focus:outline-none"
          >
            {teachersList.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
          </select>
        )}
      </div>

      <div className="premium-card overflow-x-auto scrollbar-horizontal bg-white border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3 border-b-2 border-r-2 border-slate-900 bg-slate-100 sticky left-0 z-10 w-24">Day</th>
              {periods.map(p => (
                <th key={p} className="px-4 py-3 border-b-2 border-r border-slate-200 text-center min-w-[160px]">
                  Period {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-b border-slate-200">
                <td className="px-4 py-4 border-r-2 border-slate-900 font-bold bg-slate-50 sticky left-0 z-10 uppercase text-xs">
                  {day}
                </td>
                {periods.map(p => {
                  const slot = getCellPeriod(day, p);
                  return (
                    <td key={p} className="p-2 border-r border-slate-100 group relative">
                      {slot ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg relative hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-slate-900 text-xs mb-1 truncate">{slot.subject_name}</h4>
                          <div className="flex items-center text-[10px] text-slate-500 mb-0.5">
                            {viewMode === 'Class' ? (
                              <><User className="w-3 h-3 mr-1" /> <span className="truncate">{slot.teacher_name}</span></>
                            ) : (
                              <><MapPin className="w-3 h-3 mr-1" /> Class {slot.class_id.replace('cls-','')} ({slot.room_number})</>
                            )}
                          </div>
                          
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button 
                              onClick={() => { setSelectedPeriodSlot(slot); setIsSubModalOpen(true); }}
                              className="p-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded" title="Assign Substitute"
                            >
                              <UserPlus className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleOpenEditSlot(slot)} className="p-1 bg-white shadow hover:bg-slate-50 rounded" title="Edit">
                              <Edit3 className="w-3 h-3 text-slate-600" />
                            </button>
                            <button onClick={() => setDeleteId(slot.id)} className="p-1 bg-rose-100 hover:bg-rose-200 rounded" title="Delete">
                              <Trash2 className="w-3 h-3 text-rose-600" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[4rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenAddSlot(day, p)}
                            className="p-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-400 rounded-lg transition-colors border border-dashed border-slate-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPeriodSlot ? "EDIT PERIOD SLOT" : "ADD PERIOD SLOT"}
        subtitle={`Schedule a lesson on ${formData.day}, Period ${formData.period_number}.`}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm font-bold">
          {conflictMsg && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictMsg}</span>
            </div>
          )}
          <div>
            <label className="block text-slate-500 mb-1">Subject</label>
            <select className="w-full border-2 border-slate-900 p-2" value={formData.subject_name} onChange={e => setFormData({...formData, subject_name: e.target.value})}>
              {subjectsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Teacher</label>
            <select className="w-full border-2 border-slate-900 p-2" value={formData.teacher_name} onChange={e => setFormData({...formData, teacher_name: e.target.value})}>
              {teachersList.map(t => <option key={t.id} value={t.full_name}>{t.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1">Start Time</label>
              <input type="time" className="w-full border-2 border-slate-900 p-2" value={formData.start_time.replace(' AM','').replace(' PM','')} onChange={e => setFormData({...formData, start_time: e.target.value + ' AM'})} />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">End Time</label>
              <input type="time" className="w-full border-2 border-slate-900 p-2" value={formData.end_time.replace(' AM','').replace(' PM','')} onChange={e => setFormData({...formData, end_time: e.target.value + ' AM'})} />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Room Number</label>
            <input type="text" className="w-full border-2 border-slate-900 p-2" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border-2 border-slate-900 bg-slate-100 hover:bg-slate-200">CANCEL</button>
            <button type="submit" className="px-4 py-2 border-2 border-slate-900 bg-indigo-600 text-white hover:bg-indigo-700">SAVE SLOT</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="ASSIGN SUBSTITUTE TEACHER"
        subtitle={selectedPeriodSlot ? `For ${selectedPeriodSlot.subject_name}, Period ${selectedPeriodSlot.period_number}` : ''}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-slate-500 font-bold mb-2 text-sm">Available Teachers</label>
            <select 
              className="w-full border-2 border-slate-900 p-2 font-bold text-sm" 
              value={substituteTeacher} 
              onChange={e => setSubstituteTeacher(e.target.value)}
            >
              <option value="">Select Substitute...</option>
              {getAvailableTeachers().map(t => (
                <option key={t.id} value={t.full_name}>{t.full_name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2 italic">Shows teachers who do not have a class assigned during this period.</p>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setIsSubModalOpen(false)} className="px-4 py-2 border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 font-bold text-sm">CANCEL</button>
            <button onClick={handleSubstitute} disabled={!substituteTeacher} className="px-4 py-2 border-2 border-slate-900 bg-teal-600 text-white hover:bg-teal-700 font-bold text-sm disabled:opacity-50">ASSIGN</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="CLEAR PERIOD SLOT"
        message="Are you sure you want to remove this period? This action cannot be undone."
        confirmText="CLEAR"
      />
    </div>
  );
};
