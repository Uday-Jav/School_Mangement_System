import { Exam, ExamSchedule } from '../types';
import { dataStore } from './dataStore';

export const examService = {
  async getExams(): Promise<Exam[]> {
    return Promise.resolve(dataStore.getCollection<Exam>('exams'));
  },

  async getExamSchedules(examId?: string): Promise<ExamSchedule[]> {
    const schedules = dataStore.getCollection<ExamSchedule>('examSchedules');
    if (!examId) return Promise.resolve(schedules);
    return Promise.resolve(schedules.filter(s => s.exam_id === examId));
  },

  async createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
    const exams = dataStore.getCollection<Exam>('exams');
    const newExam: Exam = { ...examData, id: `ex-${Date.now()}` };
    exams.push(newExam);
    dataStore.setCollection('exams', exams);
    return Promise.resolve(newExam);
  },

  async updateExam(id: string, examData: Partial<Exam>): Promise<Exam> {
    const exams = dataStore.getCollection<Exam>('exams');
    const index = exams.findIndex(e => e.id === id);
    if (index > -1) {
      exams[index] = { ...exams[index], ...examData };
      dataStore.setCollection('exams', exams);
      return Promise.resolve(exams[index]);
    }
    throw new Error('Exam not found');
  }
};
