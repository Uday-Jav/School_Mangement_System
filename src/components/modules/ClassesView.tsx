import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { Modal } from '../common/Modal';
import { mockTeachers } from '../../data/mockData';
import { ClassEntity, Section } from '../../types';
import { classService } from '../../services/classService';
import { School, Users, UserCheck, Plus, Eye, Edit3 } from 'lucide-react';

interface ClassesViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onNavigateToStudents: (className: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onShowToast, onNavigateToStudents }) => {
  const [classesList, setClassesList] = useState<ClassEntity[]>([]);
  const [sectionsList, setSectionsList] = useState<Section[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [assignTeacherSection, setAssignTeacherSection] = useState<Section | null>(null);

  // New Class Form
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(1);

  // New Section Form
  const [newSecName, setNewSecName] = useState('C');
  const [newSecTeacher, setNewSecTeacher] = useState(mockTeachers[0].full_name);
  const [newSecRoom, setNewSecRoom] = useState('501');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedClasses = await classService.getClasses();
    const loadedSections = await classService.getSections();
    setClassesList(loadedClasses);
    setSectionsList(loadedSections);
    if (loadedClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(loadedClasses[0].id);
    }
  };

  const selectedClass = classesList.find(c => c.id === selectedClassId) || classesList[0] || {} as ClassEntity;
  const currentSections = sectionsList.filter(s => s.class_id === selectedClass.id);

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    
    await classService.createClass({
      name: newClassName,
      numeric_grade: Number(newClassGrade),
      capacity: 60
    });
    
    onShowToast('Class Created', `Added ${newClassName} to institutional structure`, 'success');
    setIsAddClassOpen(false);
    setNewClassName('');
    loadData();
  };

  const handleAddSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await classService.createSection({
      class_id: selectedClass.id,
      class_name: selectedClass.name,
      name: newSecName,
      class_teacher_id: 'tch-1',
      class_teacher_name: newSecTeacher,
      capacity: 30,
      room_number: newSecRoom
    });

    onShowToast('Section Created', `Added Section ${newSecName} to ${selectedClass.name}`, 'success');
    setIsAddSectionOpen(false);
    loadData();
  };

  const handleAssignTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherSection) return;
    // In a full implementation, we'd have classService.updateSection(...)
    // For now, we simulate update:
    const updatedSections = sectionsList.map(s => s.id === assignTeacherSection.id ? { ...s, class_teacher_name: newSecTeacher } : s);
    setSectionsList(updatedSections);
    // Persist this manually for now since updateSection is not in classService
    const { dataStore } = await import('../../services/dataStore');
    dataStore.setCollection('sections', updatedSections);

    onShowToast('Class Teacher Assigned', `Assigned ${newSecTeacher} to Section ${assignTeacherSection.name}`, 'success');
    setAssignTeacherSection(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CLASSES & SECTIONS"
        subtitle="Manage academic grades, classroom capacities, sections, and assigned class teachers."
        breadcrumbItems={[{ label: 'Classes & Sections' }]}
        primaryAction={{
          label: 'ADD NEW CLASS',
          onClick: () => setIsAddClassOpen(true)
        }}
        secondaryAction={{
          label: 'ADD SECTION',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsAddSectionOpen(true)
        }}
      />

      {/* CLASS SELECTION CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {classesList.map((cls) => {
          const isSelected = cls.id === selectedClass.id;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-3 border-3 text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-slate-900 brutal-shadow-indigo font-black translate-y-[-2px]'
                  : 'bg-white text-slate-900 border-slate-900 brutal-shadow-sm hover:bg-amber-100 font-bold'
              }`}
            >
              <div className="text-xs uppercase tracking-tight font-black">{cls.name}</div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-indigo-200' : 'text-slate-600'}`}>
                {cls.sections_count} Sections
              </div>
              <div className={`text-[10px] font-extrabold mt-0.5 ${isSelected ? 'text-amber-300' : 'text-indigo-700'}`}>
                {cls.total_students} Students
              </div>
            </button>
          );
        })}
      </div>

      {/* SECTION DETAILS FOR SELECTED CLASS */}
      <div className="bg-white border-3 border-slate-900 brutal-shadow p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-slate-900">
          <div>
            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600" />
              <span>{selectedClass.name || 'Loading...'} - SECTIONS DIRECTORY</span>
            </h3>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Grade {selectedClass.numeric_grade} | Total Capacity: {selectedClass.capacity} | Enrolled: {selectedClass.total_students}
            </p>
          </div>

          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="px-3 py-1.5 text-xs font-black bg-amber-300 text-slate-950 border-2 border-slate-900 brutal-shadow-sm hover:bg-amber-400 uppercase"
          >
            + ADD SECTION TO {(selectedClass.name || '').toUpperCase()}
          </button>
        </div>

        {/* SECTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentSections.map((sec) => (
            <div key={sec.id} className="bg-slate-50 border-2 border-slate-900 brutal-shadow p-4 relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-900">
                <span className="font-black text-lg text-indigo-900 uppercase">SECTION {sec.name}</span>
                <span className="px-2 py-0.5 bg-amber-200 border border-slate-900 font-extrabold text-[10px] uppercase">
                  ROOM {sec.room_number}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-bold mb-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Class Teacher: <strong className="text-slate-950">{sec.class_teacher_name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Enrolled: {sec.current_students} / {sec.capacity} Capacity</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 border border-slate-900 h-3">
                  <div 
                    className="bg-indigo-600 h-full border-r border-slate-900" 
                    style={{ width: `${Math.round((sec.current_students / sec.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 gap-2">
                <button
                  onClick={() => setAssignTeacherSection(sec)}
                  className="px-2.5 py-1 text-[11px] font-extrabold bg-white border border-slate-900 hover:bg-slate-100 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3 text-indigo-700" />
                  <span>ASSIGN TEACHER</span>
                </button>
                <button
                  onClick={() => onNavigateToStudents(selectedClass.name)}
                  className="px-2.5 py-1 text-[11px] font-black bg-indigo-600 text-white border border-slate-900 hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>VIEW STUDENTS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CLASS MODAL */}
      <Modal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title="CREATE ACADEMIC CLASS"
        subtitle="Add a new grade level to the school system."
      >
        <form onSubmit={handleAddClassSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">CLASS NAME (e.g. Class 13 / Nursery)</label>
            <input
              type="text"
              required
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">NUMERIC GRADE LEVEL</label>
            <input
              type="number"
              value={newClassGrade}
              onChange={(e) => setNewClassGrade(Number(e.target.value))}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase"
            >
              CREATE CLASS
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD SECTION MODAL */}
      <Modal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        title={`ADD SECTION TO ${(selectedClass.name || '').toUpperCase()}`}
        subtitle="Specify section identifier, class teacher, and room allocation."
      >
        <form onSubmit={handleAddSectionSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">SECTION NAME (e.g. C, D)</label>
            <input
              type="text"
              required
              value={newSecName}
              onChange={(e) => setNewSecName(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">CLASS TEACHER</label>
            <select
              value={newSecTeacher}
              onChange={(e) => setNewSecTeacher(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            >
              {mockTeachers.map(t => (
                <option key={t.id} value={t.full_name}>{t.full_name} ({t.department_name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">ROOM NUMBER</label>
            <input
              type="text"
              value={newSecRoom}
              onChange={(e) => setNewSecRoom(e.target.value)}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsAddSectionOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 text-slate-950 border-2 border-slate-900 font-black uppercase"
            >
              CREATE SECTION
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TEACHER MODAL */}
      {assignTeacherSection && (
        <Modal
          isOpen={!!assignTeacherSection}
          onClose={() => setAssignTeacherSection(null)}
          title={`ASSIGN CLASS TEACHER FOR SECTION ${assignTeacherSection.name}`}
          subtitle={`Current Teacher: ${assignTeacherSection.class_teacher_name}`}
        >
          <form onSubmit={handleAssignTeacherSubmit} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">SELECT FACULTY MEMBER</label>
              <select
                value={newSecTeacher}
                onChange={(e) => setNewSecTeacher(e.target.value)}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                {mockTeachers.map(t => (
                  <option key={t.id} value={t.full_name}>{t.full_name} - {t.department_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
              <button
                type="button"
                onClick={() => setAssignTeacherSection(null)}
                className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase"
              >
                SAVE ASSIGNMENT
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
