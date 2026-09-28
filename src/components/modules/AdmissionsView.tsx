import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { AdmissionApplication } from '../../types';
import { admissionService } from '../../services/admissionService';
import { studentService } from '../../services/studentService';
import { FileText, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdmissionsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onPreviewStudent?: (id: string) => void;
}

export const AdmissionsView: React.FC<AdmissionsViewProps> = ({ onShowToast, onPreviewStudent }) => {
  const [apps, setApps] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  const [formData, setFormData] = useState<Partial<AdmissionApplication>>({
    status: 'Draft',
    gender: 'Male',
    documents: []
  });

  const loadApps = async () => {
    setLoading(true);
    const data = await admissionService.getApplications();
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      applicant_name: '',
      dob: '',
      gender: 'Male',
      class_applied: 'Class 6',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      previous_school: '',
      status: 'Draft',
      documents: []
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent, status: AdmissionApplication['status']) => {
    e.preventDefault();
    await admissionService.saveApplication({
      ...(formData as any),
      status,
      application_date: new Date().toISOString().split('T')[0]
    });
    onShowToast('Application Saved', `Application has been saved as ${status}.`, 'success');
    setIsFormOpen(false);
    loadApps();
  };

  const handleEnrol = async (app: AdmissionApplication) => {
    // Check for duplicates
    const students = await studentService.getStudents();
    const isDuplicate = students.some(s => s.first_name + ' ' + s.last_name === app.applicant_name && s.dob === app.dob);
    
    if (isDuplicate) {
      onShowToast('Duplicate Detected', 'A student with this name and DOB already exists.', 'error');
      return;
    }

    const [first, ...rest] = app.applicant_name.split(' ');
    
    const newStudent = await studentService.createStudent({
      first_name: first,
      last_name: rest.join(' ') || ' ',
      full_name: app.applicant_name,
      gender: app.gender,
      dob: app.dob,
      blood_group: 'Unknown',
      phone: app.guardian_phone,
      email: app.guardian_email,
      address: 'On file',
      class_id: `cls-${app.class_applied.replace('Class ', '')}`,
      class_name: app.class_applied,
      section_id: 'sec-A',
      section_name: 'A',
      roll_no: `R-${Math.floor(Math.random() * 100)}`,
      academic_year: '2025-2026',
      admission_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      attendance_percentage: 100,
      fee_status: 'Pending',
      guardian: {
        id: `grd-${Date.now()}`,
        name: app.guardian_name,
        relationship: 'Guardian',
        phone: app.guardian_phone,
        email: app.guardian_email,
        occupation: 'Employed',
        address: 'On file'
      }
    });

    await admissionService.updateApplicationStatus(app.id, 'Enrolled');
    setSelectedApp(null);
    onShowToast('Enrolment Successful', `${app.applicant_name} is now enrolled.`, 'success');
    loadApps();
    
    if (onPreviewStudent) {
      onPreviewStudent(newStudent.id);
    }
  };

  const columns: Column<AdmissionApplication>[] = [
    { header: 'Date', accessorKey: 'application_date', sortable: true },
    { header: 'Applicant', accessorKey: 'applicant_name', sortable: true, cell: row => <span className="font-bold text-slate-900">{row.applicant_name}</span> },
    { header: 'Class Applied', accessorKey: 'class_applied', sortable: true },
    { header: 'Guardian', accessorKey: 'guardian_name' },
    { header: 'Status', accessorKey: 'status', cell: row => <StatusBadge status={row.status as any} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ADMISSIONS"
        subtitle="Manage applications and enrol new students."
        breadcrumbItems={[{ label: 'Admissions' }]}
        primaryAction={{
          label: 'NEW APPLICATION',
          onClick: handleOpenAdd
        }}
      />

      <DataTable<AdmissionApplication>
        data={apps}
        columns={columns}
        searchPlaceholder="Search applications..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        onRowClick={(row) => setSelectedApp(row)}
        emptyStateMessage="No applications yet. Click 'NEW APPLICATION' in the top right to create your first admission application."
      />

      {/* NEW APP MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="NEW ADMISSION APPLICATION"
        subtitle="Fill out the application details."
        maxWidth="2xl"
      >
        <form className="space-y-4 text-sm font-bold">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-slate-500 mb-1">Applicant Name</label>
              <input required type="text" className="w-full border-2 border-slate-900 p-2" value={formData.applicant_name} onChange={e => setFormData({...formData, applicant_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Date of Birth</label>
              <input required type="date" className="w-full border-2 border-slate-900 p-2" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Gender</label>
              <select className="w-full border-2 border-slate-900 p-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Class Applied For</label>
              <select className="w-full border-2 border-slate-900 p-2" value={formData.class_applied} onChange={e => setFormData({...formData, class_applied: e.target.value})}>
                <option>Class 6</option>
                <option>Class 7</option>
                <option>Class 8</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Guardian Name</label>
              <input required type="text" className="w-full border-2 border-slate-900 p-2" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Guardian Phone</label>
              <input required type="text" className="w-full border-2 border-slate-900 p-2" value={formData.guardian_phone} onChange={e => setFormData({...formData, guardian_phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Guardian Email</label>
              <input type="email" className="w-full border-2 border-slate-900 p-2" value={formData.guardian_email} onChange={e => setFormData({...formData, guardian_email: e.target.value})} />
            </div>
            
            <div className="col-span-2 bg-slate-50 p-4 border-2 border-slate-900 border-dashed">
              <label className="block text-slate-500 mb-1">Upload Documents</label>
              <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Local Demonstration Only. Max size 2MB.
              </p>
              <input type="file" multiple className="text-xs" accept=".pdf,.png,.jpg" onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const docs = files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + ' KB', type: f.type }));
                setFormData({...formData, documents: docs});
              }} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={(e) => handleSaveForm(e, 'Draft')} className="px-4 py-2 border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 brutal-shadow-sm">Save Draft</button>
            <button type="button" onClick={(e) => handleSaveForm(e, 'Submitted')} className="px-4 py-2 border-2 border-slate-900 bg-teal-600 text-white brutal-shadow-sm hover:bg-teal-700">Submit Application</button>
          </div>
        </form>
      </Modal>

      {/* REVIEW MODAL */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`APPLICATION: ${selectedApp.applicant_name}`}
          subtitle={`Status: ${selectedApp.status}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 p-4 border-2 border-slate-900 text-sm font-bold">
              <p className="mb-2"><span className="text-slate-500">Applicant:</span> {selectedApp.applicant_name}</p>
              <p className="mb-2"><span className="text-slate-500">DOB:</span> {selectedApp.dob}</p>
              <p className="mb-2"><span className="text-slate-500">Class:</span> {selectedApp.class_applied}</p>
              <p className="mb-2"><span className="text-slate-500">Guardian:</span> {selectedApp.guardian_name} ({selectedApp.guardian_phone})</p>
              <div className="mt-4">
                <span className="text-slate-500">Documents:</span>
                {selectedApp.documents?.length ? (
                  <ul className="mt-2 space-y-2">
                    {selectedApp.documents.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 bg-white border border-slate-200">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>{d.name} <span className="text-slate-400 text-xs">({d.size})</span></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">No documents uploaded.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
              <button 
                className="px-4 py-2 bg-slate-100 border-2 border-slate-900 font-bold brutal-shadow-sm"
                onClick={() => setSelectedApp(null)}
              >
                CLOSE
              </button>
              {selectedApp.status !== 'Enrolled' && (
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-bold brutal-shadow-sm hover:bg-indigo-700 flex items-center gap-2"
                  onClick={() => handleEnrol(selectedApp)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ENROL STUDENT
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
