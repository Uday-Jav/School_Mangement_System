export const getRole = () => localStorage.getItem('current_role') || 'ADMIN';

export const canMutateAttendance = () => {
  const role = getRole();
  return role === 'ADMIN' || role === 'TEACHER';
};

export const canMutateResults = () => {
  const role = getRole();
  return role === 'ADMIN' || role === 'TEACHER';
};

export const canMutateStudents = () => {
  const role = getRole();
  return role === 'ADMIN'; // Teachers can't create students
};

export const canMutateFees = () => {
  const role = getRole();
  return role === 'ADMIN' || role === 'ACCOUNTANT';
};

export const canMutateEventsNotices = () => {
  const role = getRole();
  return role === 'ADMIN';
};
