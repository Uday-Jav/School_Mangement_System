import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Teacher } from '../../types';
import { teacherService } from '../../services/teacherService';
import { mockDepartments } from '../../data/mockData';
import { Eye, Edit3, Trash2, UserCheck, BookOpen, Clock, Mail, Phone, Calendar } from 'lucide-react';

interface TeachersViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  openAddModalInitially?: boolean;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onShowToast, openAddModalInitially = false }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Profile
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [profileTeacher, setProfileTeacher] = useState<Teacher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(openAddModalInitially);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    department_id: 'dept-1',
    department_name: 'Mathematics',
    designation: 'Senior Teacher',
    qualification: 'M.Sc. Mathematics',
    phone: '+1 555-0188',
    email: '',
    joining_date: '2022-08-15',
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave',
    subjects_taught: 'Mathematics, Algebra',
    assigned_classes: 'Class 10-A, Class 12-A'
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    const data = await teacherService.getTeachers();
    setTeachers(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedTeacher(null);
    setFormData({
      first_name: '',
      last_name: '',
      gender: 'Male',
      department_id: 'dept-1',
      department_name: 'Mathematics',
      designation: 'Senior Teacher',
      qualification: 'M.Sc. Mathematics',
      phone: '+1 555-0188',
      email: '',
      joining_date: '2022-08-15',
      status: 'Active',
      subjects_taught: 'Mathematics, Algebra',
      assigned_classes: 'Class 10-A, Class 12-A'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setIsEditMode(true);
    setSelectedTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      gender: teacher.gender,
      department_id: teacher.department_id,
      department_name: teacher.department_name,
      designation: teacher.designation,
      qualification: teacher.qualification,
      phone: teacher.phone,
      email: teacher.email,
      joining_date: teacher.joining_date,
      status: teacher.status,
      subjects_taught: teacher.subjects_taught.join(', '),
      assigned_classes: teacher.assigned_classes.join(', ')
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      onShowToast('Validation Error', 'Please enter teacher first and last name', 'warning');
      return;
    }

    const subjectsArr = formData.subjects_taught.split(',').map(s => s.trim()).filter(Boolean);
    const classesArr = formData.assigned_classes.split(',').map(c => c.trim()).filter(Boolean);

    if (isEditMode && selectedTeacher) {
      await teacherService.updateTeacher(selectedTeacher.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.gender === 'Female' ? 'Mrs.' : 'Mr.'} ${formData.first_name} ${formData.last_name}`,
        gender: formData.gender,
        department_name: formData.department_name,
        designation: formData.designation,
        qualification: formData.qualification,
        phone: formData.phone,
        email: formData.email,
        joining_date: formData.joining_date,
        status: formData.status,
        subjects_taught: subjectsArr,
        assigned_classes: classesArr
      });
      onShowToast('Faculty Record Updated', `Successfully updated record for ${formData.first_name}`, 'success');
    } else {
      await teacherService.createTeacher({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.gender === 'Female' ? 'Mrs.' : 'Dr.'} ${formData.first_name} ${formData.last_name}`,
        gender: formData.gender,
        department_id: formData.department_id,
        department_name: formData.department_name,
        designation: formData.designation,
        qualification: formData.qualification,
        phone: formData.phone,
        email: formData.email || `${formData.first_name[0].toLowerCase()}.${formData.last_name.toLowerCase()}@school.edu`,
        joining_date: formData.joining_date,
        status: formData.status,
        subjects_taught: subjectsArr,
        assigned_classes: classesArr
      });
      onShowToast('Faculty Recruited', `Registered new faculty ${formData.first_name} ${formData.last_name}`, 'success');
    }

    setIsFormOpen(false);
    loadTeachers();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await teacherService.deleteTeacher(deleteId);
    onShowToast('Teacher Deleted', 'The faculty record has been removed.', 'info');
    setDeleteId(null);
    loadTeachers();
  };

  const filteredTeachers = teachers.filter(t => {
    if (departmentFilter && t.department_name !== departmentFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<Teacher>[] = [
    {
      header: 'Employee No',
      accessorKey: 'employee_no',
      sortable: true,
      cell: (row) => <span className="font-mono text-emerald-800 font-extrabold">{row.employee_no}</span>
    },
    {
      header: 'Teacher Name',
      accessorKey: 'full_name',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-black text-slate-900">{row.full_name}</span>
          <span className="block text-[10px] text-slate-500 font-semibold">{row.email}</span>
        </div>
      )
    },
    { header: 'Department', accessorKey: 'department_name', sortable: true },
    { header: 'Designation', accessorKey: 'designation', sortable: true },
    { header: 'Qualification', accessorKey: 'qualification' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Joining Date', accessorKey: 'joining_date', sortable: true },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="TEACHER MANAGEMENT"
        subtitle="Faculty roster, qualifications, departments, and class responsibilities."
        breadcrumbItems={[{ label: 'Teachers' }]}
        primaryAction={{
          label: 'ADD NEW TEACHER',
          onClick: handleOpenAdd
        }}
        exportAction={() => onShowToast('Export CSV', 'Exporting teacher roster CSV report...', 'info')}
      />

      <DataTable<Teacher>
        data={filteredTeachers}
        columns={columns}
        searchPlaceholder="Search teacher by name, EMP no, department, phone..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        onRowClick={(row) => setProfileTeacher(row)}
        filters={
          <>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filter by Department"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Departments</option>
              {mockDepartments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </>
        }
        actions={(row) => (
          <>
            <button
              onClick={() => setProfileTeacher(row)}
              className="p-1.5 bg-amber-300 border border-slate-900 hover:bg-amber-400 font-bold"
              title="View Teacher Profile"
            >
              <Eye className="w-3.5 h-3.5 text-slate-950" />
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 bg-indigo-100 border border-slate-900 hover:bg-indigo-200 font-bold"
              title="Edit Faculty Record"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-900" />
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="p-1.5 bg-rose-200 border border-slate-900 hover:bg-rose-300 font-bold"
              title="Delete Record"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-900" />
            </button>
          </>
        )}
      />

      {/* FORM MODAL (ADD / EDIT) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'EDIT FACULTY RECORD' : 'NEW TEACHER RECRUITMENT'}
        subtitle="Enter teacher details, qualification, department and subject assignment."
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">FIRST NAME *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900 focus:bg-amber-50"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">LAST NAME *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900 focus:bg-amber-50"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">DEPARTMENT</label>
              <select
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                {mockDepartments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">DESIGNATION</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">QUALIFICATION</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">PHONE NUMBER</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@school.edu"
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">STATUS</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">SUBJECTS TAUGHT (Comma Separated)</label>
            <input
              type="text"
              value={formData.subjects_taught}
              onChange={(e) => setFormData({ ...formData, subjects_taught: e.target.value })}
              className="w-full p-2 bg-white border-2 border-slate-900"
            />
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-200 border-2 border-slate-900 brutal-shadow-sm font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white border-2 border-slate-900 brutal-shadow-emerald font-black uppercase"
            >
              {isEditMode ? 'SAVE CHANGES' : 'RECRUIT FACULTY'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PROFILE DETAIL MODAL */}
      {profileTeacher && (
        <Modal
          isOpen={!!profileTeacher}
          onClose={() => setProfileTeacher(null)}
          title={`FACULTY PROFILE: ${profileTeacher.full_name}`}
          subtitle={`Employee ID: ${profileTeacher.employee_no} | Department: ${profileTeacher.department_name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-bold">
            <div className="p-4 bg-emerald-100 border-2 border-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950 uppercase">{profileTeacher.full_name}</h3>
                <p className="text-xs font-extrabold text-slate-800">{profileTeacher.designation} ({profileTeacher.qualification})</p>
              </div>
              <StatusBadge status={profileTeacher.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-2 border-slate-900 p-3 bg-slate-50">
              <div><span className="text-slate-500">Employee No:</span> {profileTeacher.employee_no}</div>
              <div><span className="text-slate-500">Department:</span> {profileTeacher.department_name}</div>
              <div><span className="text-slate-500">Email:</span> {profileTeacher.email}</div>
              <div><span className="text-slate-500">Phone:</span> {profileTeacher.phone}</div>
              <div><span className="text-slate-500">Joining Date:</span> {profileTeacher.joining_date}</div>
              <div><span className="text-slate-500">Gender:</span> {profileTeacher.gender}</div>
            </div>

            <div className="border-2 border-slate-900 p-3 bg-amber-50 space-y-2">
              <h4 className="font-black text-xs uppercase text-slate-950 border-b border-slate-900 pb-1">SUBJECTS & CLASS RESPONSIBILITIES</h4>
              <div><span className="text-slate-700">Subjects Taught:</span> {profileTeacher.subjects_taught.join(', ') || 'None'}</div>
              <div><span className="text-slate-700">Classes Assigned:</span> {profileTeacher.assigned_classes.join(', ') || 'None'}</div>
              <div><span className="text-slate-700">Class Teacher Duty:</span> Class 10 - Section A</div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE FACULTY RECORD"
        message="Are you sure you want to remove this teacher record?"
      />
    </div>
  );
};
