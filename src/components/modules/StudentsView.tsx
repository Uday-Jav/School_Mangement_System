import React, { useState, useEffect } from 'react';
import { canMutateStudents } from '../../utils/permissions';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Student } from '../../types';
import { studentService } from '../../services/studentService';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  UserCheck, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  Library, 
  Bus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield 
} from 'lucide-react';

interface StudentsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  openAddModalInitially?: boolean;
  onPreviewStudent?: (id: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onShowToast, openAddModalInitially = false, onPreviewStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(openAddModalInitially);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '2012-05-14',
    blood_group: 'O+',
    phone: '+1 555-0199',
    email: '',
    address: '101 Main Street, Metro City',
    class_id: 'cls-10',
    class_name: 'Class 10',
    section_id: 'sec-10a',
    section_name: 'A',
    roll_no: '15',
    academic_year: '2025-2026',
    admission_date: '2024-08-01',
    status: 'Active' as 'Active' | 'Inactive',
    guardian_name: 'John Doe',
    guardian_relationship: 'Father',
    guardian_phone: '+1 555-0999',
    guardian_email: 'guardian@gmail.com',
    guardian_occupation: 'Engineer'
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const data = await studentService.getStudents();
    setStudents(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setFormData({
      first_name: '',
      last_name: '',
      gender: 'Male',
      dob: '2012-05-14',
      blood_group: 'O+',
      phone: '+1 555-0199',
      email: '',
      address: '101 Main Street, Metro City',
      class_id: 'cls-10',
      class_name: 'Class 10',
      section_id: 'sec-10a',
      section_name: 'A',
      roll_no: '15',
      academic_year: '2025-2026',
      admission_date: '2024-08-01',
      status: 'Active',
      guardian_name: '',
      guardian_relationship: 'Father',
      guardian_phone: '',
      guardian_email: '',
      guardian_occupation: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setIsEditMode(true);
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      dob: student.dob,
      blood_group: student.blood_group,
      phone: student.phone,
      email: student.email,
      address: student.address,
      class_id: student.class_id,
      class_name: student.class_name,
      section_id: student.section_id,
      section_name: student.section_name,
      roll_no: student.roll_no,
      academic_year: student.academic_year,
      admission_date: student.admission_date,
      status: student.status as 'Active' | 'Inactive',
      guardian_name: student.guardian.name,
      guardian_relationship: student.guardian.relationship,
      guardian_phone: student.guardian.phone,
      guardian_email: student.guardian.email,
      guardian_occupation: student.guardian.occupation
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      onShowToast('Validation Error', 'Please enter student first and last name', 'warning');
      return;
    }

    if (isEditMode && selectedStudent) {
      await studentService.updateStudent(selectedStudent.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        gender: formData.gender,
        dob: formData.dob,
        blood_group: formData.blood_group,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        class_name: formData.class_name,
        section_name: formData.section_name,
        roll_no: formData.roll_no,
        status: formData.status,
        guardian: {
          ...selectedStudent.guardian,
          name: formData.guardian_name,
          relationship: formData.guardian_relationship,
          phone: formData.guardian_phone,
          email: formData.guardian_email,
          occupation: formData.guardian_occupation
        }
      });
      onShowToast('Student Updated', `Successfully updated profile for ${formData.first_name}`, 'success');
    } else {
      await studentService.createStudent({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        gender: formData.gender,
        dob: formData.dob,
        blood_group: formData.blood_group,
        phone: formData.phone,
        email: formData.email || `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}@student.school.edu`,
        address: formData.address,
        class_id: formData.class_id,
        class_name: formData.class_name,
        section_id: formData.section_id,
        section_name: formData.section_name,
        roll_no: formData.roll_no,
        academic_year: formData.academic_year,
        admission_date: formData.admission_date,
        status: formData.status,
        attendance_percentage: 95,
        fee_status: 'Paid',
        guardian: {
          id: `grd-${Date.now()}`,
          name: formData.guardian_name || 'Guardian Name',
          relationship: formData.guardian_relationship,
          phone: formData.guardian_phone || '+1 555-0000',
          email: formData.guardian_email || 'guardian@gmail.com',
          occupation: formData.guardian_occupation || 'Employed',
          address: formData.address
        }
      });
      onShowToast('Student Admitted', `Registered new student ${formData.first_name} ${formData.last_name}`, 'success');
    }

    setIsFormOpen(false);
    loadStudents();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await studentService.deleteStudent(deleteId);
    onShowToast('Student Deleted', 'The student record has been permanently removed.', 'info');
    setDeleteId(null);
    loadStudents();
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    if (classFilter && s.class_name !== classFilter) return false;
    if (sectionFilter && s.section_name !== sectionFilter) return false;
    if (genderFilter && s.gender !== genderFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<Student>[] = [
    {
      header: 'Admission No',
      accessorKey: 'admission_no',
      sortable: true,
      cell: (row) => <span className="font-mono text-indigo-700 font-extrabold">{row.admission_no}</span>
    },
    {
      header: 'Student Name',
      accessorKey: 'full_name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-200 border border-slate-900 flex items-center justify-center font-black text-slate-900 text-xs">
            {row.first_name[0]}
          </div>
          <div>
            <span className="font-black text-slate-900">{row.full_name}</span>
            <span className="block text-[10px] text-slate-500 font-semibold">{row.email}</span>
          </div>
        </div>
      )
    },
    { header: 'Gender', accessorKey: 'gender', sortable: true },
    { 
      header: 'Class & Section', 
      cell: (row) => <span className="font-bold">{row.class_name} - {row.section_name}</span> 
    },
    { header: 'Roll No', accessorKey: 'roll_no', sortable: true },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="STUDENT MANAGEMENT"
        subtitle="Manage student admissions, profiles, academic records, and status."
        breadcrumbItems={[{ label: 'Students' }]}
        primaryAction={canMutateStudents() ? {
          label: 'ADD NEW STUDENT',
          onClick: handleOpenAdd
        } : undefined}
        exportAction={() => onShowToast('Export CSV', 'Exporting student directory CSV report...', 'info')}
      />

      {/* FILTER BAR */}
      <DataTable<Student>
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Search student by name, admission no, roll, phone..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        onRowClick={(row) => onPreviewStudent && onPreviewStudent(row.id)}
        filters={
          <>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              aria-label="Filter by Class"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              aria-label="Filter by Section"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              aria-label="Filter by Gender"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </>
        }
        actions={(row) => (
          <>
            <button
              onClick={() => onPreviewStudent?.(row.id)}
              className="p-1.5 bg-amber-300 border border-slate-900 hover:bg-amber-400 font-bold"
              title="View Profile"
            >
              <Eye className="w-3.5 h-3.5 text-slate-950" />
            </button>
            {canMutateStudents() && (<><button onClick={() => handleOpenEdit(row)} className="p-1.5 bg-indigo-100 border border-slate-900 hover:bg-indigo-200 font-bold"><Edit3 className="w-3.5 h-3.5 text-indigo-900" /></button><button onClick={() => setDeleteId(row.id)} className="p-1.5 bg-rose-200 border border-slate-900 hover:bg-rose-300 font-bold"><Trash2 className="w-3.5 h-3.5 text-rose-900" /></button></>)}
          </>
        )}
      />

      {/* STUDENT FORM MODAL (ADD / EDIT) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'EDIT STUDENT RECORD' : 'NEW STUDENT ADMISSION'}
        subtitle="Complete student personal, academic & guardian details."
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold">
          <div className="bg-slate-100 p-3 border-2 border-slate-900 uppercase">
            Personal Information
          </div>

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
              <label className="block text-slate-700 mb-1">GENDER</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">DATE OF BIRTH</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">BLOOD GROUP</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
              </select>
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
          </div>

          <div className="bg-slate-100 p-3 border-2 border-slate-900 uppercase">
            Academic Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">CLASS</label>
              <select
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
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
              <label className="block text-slate-700 mb-1">SECTION</label>
              <select
                value={formData.section_name}
                onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">ROLL NUMBER</label>
              <input
                type="text"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
          </div>

          <div className="bg-slate-100 p-3 border-2 border-slate-900 uppercase">
            Guardian Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">GUARDIAN NAME</label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">RELATIONSHIP</label>
              <select
                value={formData.guardian_relationship}
                onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">GUARDIAN PHONE</label>
              <input
                type="text"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">GUARDIAN OCCUPATION</label>
              <input
                type="text"
                value={formData.guardian_occupation}
                onChange={(e) => setFormData({ ...formData, guardian_occupation: e.target.value })}
                className="w-full p-2 bg-white border-2 border-slate-900"
              />
            </div>
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
              className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 brutal-shadow-indigo font-black uppercase"
            >
              {isEditMode ? 'SAVE CHANGES' : 'CREATE ADMISSION'}
            </button>
          </div>
        </form>
      </Modal>



      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE STUDENT RECORD"
        message="Are you sure you want to permanently remove this student from the database?"
        confirmText="DELETE PERMANENTLY"
      />
    </div>
  );
};
