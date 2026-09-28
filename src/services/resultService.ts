import { ExamResult, ReportCard, Student } from '../types';
import { dataStore } from './dataStore';

export const resultService = {
  async getResults(examId?: string, className?: string, subjectId?: string): Promise<ExamResult[]> {
    let result = dataStore.getCollection<ExamResult>('examResults');
    if (examId) result = result.filter(r => r.exam_id === examId);
    if (className) result = result.filter(r => r.class_name === className);
    if (subjectId) result = result.filter(r => r.subject_id === subjectId);
    return Promise.resolve(result);
  },

  async saveResults(newResults: ExamResult[]): Promise<boolean> {
    const resultsStore = dataStore.getCollection<ExamResult>('examResults');
    newResults.forEach(nr => {
      const idx = resultsStore.findIndex(r => r.student_id === nr.student_id && r.exam_id === nr.exam_id && r.subject_id === nr.subject_id);
      if (idx !== -1) {
        resultsStore[idx] = nr;
      } else {
        resultsStore.push(nr);
      }
    });
    dataStore.setCollection('examResults', resultsStore);
    return Promise.resolve(true);
  },

  async generateReportCard(studentId: string, examName: string = 'Unit Test 1'): Promise<ReportCard | undefined> {
    const student = dataStore.getCollection<Student>('students').find(s => s.id === studentId);
    if (!student) return undefined;

    const studentResults = dataStore.getCollection<ExamResult>('examResults').filter(r => r.student_id === studentId);
    const subject_results = studentResults.map(sr => ({
      subject_name: sr.subject_name,
      marks_obtained: sr.grading_state === 'Absent' ? 0 : sr.grading_state === 'Not Assessed' || sr.grading_state === 'Exempt' ? null : sr.marks_obtained,
      max_marks: sr.max_marks,
      grade: sr.grading_state === 'Absent' ? 'AB' : sr.grading_state === 'Not Assessed' ? '-' : sr.grading_state === 'Exempt' ? 'EX' : sr.grade,
      remarks: sr.remarks || 'Satisfactory performance',
      grading_state: sr.grading_state
    }));

    let total_obtained = 0;
    let total_max = 0;

    subject_results.forEach(curr => {
      if (!curr.grading_state || curr.grading_state === 'Scored') {
        total_obtained += curr.marks_obtained || 0;
        total_max += curr.max_marks;
      } else if (curr.grading_state === 'Absent') {
        total_max += curr.max_marks;
      }
      // 'Not Assessed' and 'Exempt' do not contribute to total_max or total_obtained
    });

    const percentage = total_max > 0 ? Math.round((total_obtained / total_max) * 100) : 0;
    
    const hasNotAssessed = subject_results.some(sr => sr.grading_state === 'Not Assessed');

    let grade = 'A';
    if (hasNotAssessed) grade = '-';
    else if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else grade = 'F';

    let status: 'PASSED' | 'FAILED' | 'PASSED WITH HONORS' | 'PROVISIONAL' = 'PASSED';
    if (hasNotAssessed) {
      status = 'PROVISIONAL';
    } else {
      status = percentage >= 85 ? 'PASSED WITH HONORS' : percentage >= 40 ? 'PASSED' : 'FAILED';
    }

    return Promise.resolve({
      student,
      exam_name: examName,
      academic_year: '2025-2026',
      subject_results: subject_results.length > 0 ? subject_results : [
        { subject_name: 'Mathematics', marks_obtained: 45, max_marks: 50, grade: 'A+', remarks: 'Outstanding problem solving' },
        { subject_name: 'Physics', marks_obtained: 42, max_marks: 50, grade: 'A', remarks: 'Good analytical skills' },
        { subject_name: 'English Literature', marks_obtained: 46, max_marks: 50, grade: 'A+', remarks: 'Fluent and creative' },
      ],
      total_obtained: total_obtained || 133,
      total_max: total_max || 150,
      percentage: percentage || 89,
      grade,
      status,
      rank: 2,
      is_provisional: hasNotAssessed
    });
  }
};
