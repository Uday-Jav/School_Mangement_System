import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Subject } from '../../types';
import { subjectService } from '../../services/subjectService';
import { BookOpen, Edit3, Trash2, CheckCircle2, Users } from 'lucide-react';

interface SubjectsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onShowToast }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: 'MATH-102',
    name: 'Discrete Mathematics',
    type: 'Theory' as 'Theory' | 'Practical' | 'Both',
    max_marks: 100,
    pass_marks: 35,
    assigned_classes: 'Class 10, Class 11',
    assigned_teachers: 'Dr. Robert Vance'
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const data = await subjectService.getSubjects();
    setSubjects(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedSubject(null);
    setFormData({
      code: `SUB-${subjects.length + 101}`,
      name: '',
      type: 'Theory',
      max_marks: 100,
      pass_marks: 35,
      assigned_classes: 'Class 9, Class 10',
      assigned_teachers: 'Dr. Robert Vance'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setIsEditMode(true);
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      type: subject.type,
      max_marks: subject.max_marks,
      pass_marks: subject.pass_marks,
      assigned_classes: subject.assigned_classes.join(', '),
      assigned_teachers: subject.assigned_teachers.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const classesArr = formData.assigned_classes.split(',').map(c => c.trim()).filter(Boolean);
    const teachersArr = formData.assigned_teachers.split(',').map(t => t.trim()).filter(Boolean);

    if (isEditMode && selectedSubject) {
      await subjectService.updateSubject(selectedSubject.id, {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        max_marks: Number(formData.max_marks),
        pass_marks: Number(formData.pass_marks),
        assigned_classes: classesArr,
        assigned_teachers: teachersArr
      });
      onShowToast('Subject Updated', `Updated catalog details for ${formData.name}`, 'success');
    } else {
      await subjectService.createSubject({
        code: formData.code,
        name: formData.name,
        type: formData.type,
        max_marks: Number(formData.max_marks),
        pass_marks: Number(formData.pass_marks),
        assigned_classes: classesArr,
        assigned_teachers: teachersArr
      });
      onShowToast('Subject Added', `Created new subject ${formData.name} (${formData.code})`, 'success');
    }

    setIsModalOpen(false);
    loadSubjects();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await subjectService.deleteSubject(deleteId);
    onShowToast('Subject Removed', 'The subject has been deleted from curriculum.', 'info');
    setDeleteId(null);
    loadSubjects();
  };

  const columns: Column<Subject>[] = [
    {
      header: 'Subject Code',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => <span className="font-mono font-black text-indigo-700">{row.code}</span>
    },
    {
      header: 'Subject Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-extrabold text-slate-950">{row.name}</span>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row) => (
        <span className="px-2 py-0.5 bg-amber-200 border border-slate-900 font-extrabold text-[10px] uppercase">
          {row.type}
        </span>
      )
    },
    {
      header: 'Max / Pass Marks',
      cell: (row) => <span>{row.max_marks} / <strong className="text-emerald-700">{row.pass_marks}</strong></span>
    },
    {
      header: 'Assigned Classes',
      cell: (row) => <span className="text-slate-800 font-bold">{row.assigned_classes.join(', ')}</span>
    },
    {
      header: 'Assigned Faculty',
      cell: (row) => <span className="text-indigo-800 font-semibold">{row.assigned_teachers.join(', ')}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SUBJECT MANAGEMENT"
        subtitle="Academic curriculum, passing grade criteria, theory/lab types, and faculty assignments."
        breadcrumbItems={[{ label: 'Subjects' }]}
        primaryAction={{
          label: 'ADD NEW SUBJECT',
          onClick: handleOpenAdd
        }}
      />

      <DataTable<Subject>
        data={subjects}
        columns={columns}
        searchPlaceholder="Search by subject code, title, teacher..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 bg-indigo-100 border border-slate-900 hover:bg-indigo-200 font-bold"
              title="Edit Subject"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-900" />
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="p-1.5 bg-rose-200 border border-slate-900 hover:bg-rose-300 font-bold"
              title="Delete Subject"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-900" />
            </button>
          </>
        )}
      />

      {/* FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'EDIT SUBJECT CATALOG' : 'NEW SUBJECT CURRICULUM'}
        subtitle="Configure evaluation marks and class allocations."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">SUBJECT CODE *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">SUBJECT NAME *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">TYPE</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical / Lab</option>
                <option value="Both">Both (Theory + Lab)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">MAXIMUM MARKS</label>
              <input
                type="number"
                value={formData.max_marks}
                onChange={(e) => setFormData({ ...formData, max_marks: Number(e.target.value) })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">PASSING MARKS</label>
              <input
                type="number"
                value={formData.pass_marks}
                onChange={(e) => setFormData({ ...formData, pass_marks: Number(e.target.value) })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">ASSIGNED CLASSES (Comma Separated)</label>
            <input
              type="text"
              value={formData.assigned_classes}
              onChange={(e) => setFormData({ ...formData, assigned_classes: e.target.value })}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">ASSIGNED TEACHERS (Comma Separated)</label>
            <input
              type="text"
              value={formData.assigned_teachers}
              onChange={(e) => setFormData({ ...formData, assigned_teachers: e.target.value })}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase"
            >
              {isEditMode ? 'SAVE CHANGES' : 'CREATE SUBJECT'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE SUBJECT"
        message="Are you sure you want to remove this subject from the active curriculum?"
      />
    </div>
  );
};
