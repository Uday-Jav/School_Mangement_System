import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { AppUser, UserRole, ParentLink } from '../../types';
import { userService } from '../../services/userService';
import { mockTeachers, mockStudents } from '../../data/mockData';
import { UserCog, ShieldCheck, Plus, Lock, PowerOff } from 'lucide-react';

interface UsersViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onRoleChange: (role: UserRole) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onShowToast, onRoleChange }) => {
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('TEACHER');
  
  // Linking
  const [linkedProfileId, setLinkedProfileId] = useState('');
  const [parentLinks, setParentLinks] = useState<ParentLink[]>([]);
  const [parentLinkStudent, setParentLinkStudent] = useState('');
  const [parentLinkRel, setParentLinkRel] = useState('Parent');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await userService.getUsers();
    setUsersList(data);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) return;

    try {
      await userService.createUser({
        username,
        full_name: username,
        email,
        role,
        status: 'Active',
        created_date: new Date().toISOString().split('T')[0],
        linked_profile_id: role === 'TEACHER' || role === 'STUDENT' ? linkedProfileId : undefined,
        parent_links: role === 'PARENT' ? parentLinks : []
      });
      onShowToast('Account Created', `Created credentials for ${username} (${role})`, 'success');
      setIsAddUserOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      onShowToast('Error', err.message, 'error');
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setRole('TEACHER');
    setLinkedProfileId('');
    setParentLinks([]);
  };

  const handleAddParentLink = () => {
    if (!parentLinkStudent || !parentLinkRel) return;
    // prevent duplicate link for same student
    if (parentLinks.find(l => l.student_id === parentLinkStudent)) {
      onShowToast('Error', 'Student is already linked to this parent profile.', 'error');
      return;
    }
    setParentLinks([...parentLinks, { student_id: parentLinkStudent, relationship: parentLinkRel }]);
  };

  const removeParentLink = (studentId: string) => {
    setParentLinks(parentLinks.filter(l => l.student_id !== studentId));
  };

  const handleDeactivate = async (id: string) => {
    await userService.deactivateUser(id);
    onShowToast('User Deactivated', 'The user session has been revoked.', 'info');
    loadUsers();
  };

  const filteredUsers = usersList.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<AppUser>[] = [
    { header: 'Username', accessorKey: 'username', cell: (row) => <span className="font-mono font-black text-slate-950">{row.username}</span> },
    { header: 'Email Address', accessorKey: 'email', cell: (row) => <span className="font-semibold">{row.email}</span> },
    {
      header: 'System Role',
      accessorKey: 'role',
      cell: (row) => (
        <span className={`px-2 py-0.5 border border-slate-900 font-black text-[10px] uppercase ${
          row.role === 'ADMIN' ? 'bg-rose-400 text-slate-950' :
          row.role === 'TEACHER' ? 'bg-indigo-400 text-slate-950' :
          row.role === 'STUDENT' ? 'bg-emerald-400 text-slate-950' :
          row.role === 'PARENT' ? 'bg-orange-400 text-slate-950' :
          row.role === 'ACCOUNTANT' ? 'bg-amber-400 text-slate-950' : 'bg-purple-400 text-slate-950'
        }`}>
          {row.role}
        </span>
      )
    },
    { header: 'Linked Profile', cell: (row) => {
        if (row.role === 'TEACHER') {
          const t = mockTeachers.find(t => t.id === row.linked_profile_id);
          return <span className="text-xs">{t ? `Teacher: ${t.full_name}` : 'None'}</span>;
        }
        if (row.role === 'STUDENT') {
          const s = mockStudents.find(s => s.id === row.linked_profile_id);
          return <span className="text-xs">{s ? `Student: ${s.full_name}` : 'None'}</span>;
        }
        if (row.role === 'PARENT') {
          return <span className="text-xs">{row.parent_links?.length || 0} Linked Students</span>;
        }
        return <span className="text-xs text-slate-400">N/A</span>;
    } },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
    { header: 'Created Date', accessorKey: 'created_date' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="USER ACCOUNTS & ACCESS CONTROL"
        subtitle="Manage authentication accounts, role permissions (RBAC), and active sessions."
        breadcrumbItems={[{ label: 'Users' }]}
        primaryAction={{
          label: 'CREATE USER ACCOUNT',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => { resetForm(); setIsAddUserOpen(true); }
        }}
      />

      <div className="p-3 bg-blue-50 border-2 border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <span>ACCOUNT MANAGEMENT IS EXPLICITLY SIMULATED FOR THIS DEMO. NO REAL PASSWORDS ARE COLLECTED OR TOKENS ISSUED.</span>
      </div>

      {/* QUICK ROLE SWITCHER PROMPT */}
      <div className="p-4 bg-amber-300 border-3 border-slate-900 brutal-shadow flex items-center justify-between">
        <div>
          <h4 className="font-black text-sm uppercase text-slate-950">SWITCH CURRENT ACTIVE ROLE SESSION</h4>
          <p className="text-xs font-semibold text-slate-800">Test how the UI renders for different staff and student roles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => {
                onRoleChange(r);
                onShowToast('Switched Role', `Current session set to ${r}`, 'info');
              }}
              className="px-2.5 py-1 text-xs font-black bg-white border-2 border-slate-900 brutal-shadow-sm hover:bg-slate-100 uppercase"
            >
              SWITCH TO {r}
            </button>
          ))}
        </div>
      </div>

      <DataTable<AppUser>
        data={filteredUsers}
        columns={columns}
        searchPlaceholder="Search system accounts..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        actions={(row) => (
          row.status === 'Active' ? (
            <button 
              onClick={() => handleDeactivate(row.id)}
              className="p-1.5 bg-rose-200 border border-slate-900 font-extrabold text-[10px] flex items-center gap-1 uppercase"
            >
              <PowerOff className="w-3 h-3" /> Deactivate
            </button>
          ) : null
        )}
        filters={
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TEACHER">TEACHER</option>
              <option value="STUDENT">STUDENT</option>
              <option value="PARENT">PARENT</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        }
      />

      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="CREATE DEMO USER ACCOUNT">
        <form onSubmit={handleAddUser} className="space-y-4 text-xs font-bold max-h-[70vh] overflow-y-auto p-1">
          <div>
            <label className="block text-slate-700 mb-1">USERNAME *</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border-2 border-slate-900 font-mono" />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">EMAIL ADDRESS *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">ASSIGNED SYSTEM ROLE</label>
            <select value={role} onChange={(e) => { setRole(e.target.value as UserRole); setLinkedProfileId(''); setParentLinks([]); }} className="w-full p-2 border-2 border-slate-900 font-bold">
              <option value="ADMIN">ADMIN (Full Access)</option>
              <option value="TEACHER">TEACHER (Faculty)</option>
              <option value="STUDENT">STUDENT (Learner)</option>
              <option value="PARENT">PARENT (Guardian)</option>
              <option value="ACCOUNTANT">ACCOUNTANT (Finance)</option>
            </select>
          </div>

          {role === 'TEACHER' && (
            <div className="pt-2 border-t-2 border-slate-200">
               <label className="block text-slate-700 mb-1">LINK TEACHER PROFILE</label>
               <select value={linkedProfileId} onChange={(e) => setLinkedProfileId(e.target.value)} className="w-full p-2 border-2 border-slate-900">
                 <option value="">-- No Profile Linked --</option>
                 {mockTeachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.employee_no})</option>)}
               </select>
            </div>
          )}

          {role === 'STUDENT' && (
            <div className="pt-2 border-t-2 border-slate-200">
               <label className="block text-slate-700 mb-1">LINK STUDENT PROFILE</label>
               <select value={linkedProfileId} onChange={(e) => setLinkedProfileId(e.target.value)} className="w-full p-2 border-2 border-slate-900">
                 <option value="">-- No Profile Linked --</option>
                 {mockStudents.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>)}
               </select>
            </div>
          )}

          {role === 'PARENT' && (
            <div className="pt-2 border-t-2 border-slate-200">
               <label className="block text-slate-700 mb-1">LINKED STUDENTS</label>
               
               {parentLinks.map((pl, idx) => {
                 const st = mockStudents.find(s => s.id === pl.student_id);
                 return (
                   <div key={idx} className="flex justify-between items-center bg-slate-100 p-2 border-2 border-slate-900 mb-2">
                     <span>{st ? st.full_name : 'Unknown'} ({pl.relationship})</span>
                     <button type="button" onClick={() => removeParentLink(pl.student_id)} className="text-rose-600 underline">Remove</button>
                   </div>
                 )
               })}

               <div className="flex gap-2 items-end mt-2">
                 <div className="flex-1">
                   <select value={parentLinkStudent} onChange={(e) => setParentLinkStudent(e.target.value)} className="w-full p-2 border-2 border-slate-900 text-[10px]">
                     <option value="">-- Select Student --</option>
                     {mockStudents.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                   </select>
                 </div>
                 <div className="w-1/3">
                   <input type="text" placeholder="Relationship" value={parentLinkRel} onChange={(e) => setParentLinkRel(e.target.value)} className="w-full p-2 border-2 border-slate-900 text-[10px]" />
                 </div>
                 <button type="button" onClick={handleAddParentLink} className="px-3 py-2 bg-slate-900 text-white font-bold border-2 border-slate-900">ADD</button>
               </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900 mt-4">
            <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">CREATE ACCOUNT</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
