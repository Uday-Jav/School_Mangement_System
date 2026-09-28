import { apiFetch } from './apiClient';

export const authService = {
  async login(role: string) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      if (data.linkedStudentId) localStorage.setItem('auth_linked_student_id', data.linkedStudentId);
      else localStorage.removeItem('auth_linked_student_id');
      
      if (data.linkedTeacherId) localStorage.setItem('auth_linked_teacher_id', data.linkedTeacherId);
      else localStorage.removeItem('auth_linked_teacher_id');
      
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  
  logout() {
    localStorage.removeItem('auth_token');
  }
};
