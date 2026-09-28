import React, { useState, useEffect } from 'react';
import { canMutateResults } from '../../utils/permissions';
import { PageHeader } from '../common/PageHeader';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { ExamResult, ReportCard, Student, Subject, Exam } from '../../types';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { resultService } from '../../services/resultService';
import { mockStudents } from '../../data/mockData';
import { Award, Save, Printer, GraduationCap, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ResultsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ onShowToast }) => {
  const [selectedExam, setSelectedExam] = useState('ex-1'); // Unit Test 1
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('sub-1'); // Math

  const [resultsList, setResultsList] = useState<ExamResult[]>([]);
  const [reportCardModal, setReportCardModal] = useState<ReportCard | null>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const subjectObj = subjects.find(s => s.id === selectedSubject) || subjects[0] || {} as Subject;
  const examObj = exams.find(e => e.id === selectedExam) || exams[0] || {} as Exam;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedExams = await examService.getExams();
    const loadedSubjects = await subjectService.getSubjects();
    setExams(loadedExams);
    setSubjects(loadedSubjects);
    if (loadedExams.length > 0) setSelectedExam(loadedExams[0].id);
    if (loadedSubjects.length > 0) setSelectedSubject(loadedSubjects[0].id);
  };

  useEffect(() => {
    if (exams.length > 0 && subjects.length > 0) {
      loadResults();
    }
  }, [selectedExam, selectedClass, selectedSection, selectedSubject, exams, subjects]);

  const loadResults = async () => {
    const data = await resultService.getResults(selectedExam, selectedClass, selectedSubject);
    
    // If empty for student list, generate default items
    const classStudents = mockStudents.filter(
      s => s.class_name === selectedClass && s.section_name === selectedSection
    );

    const merged: ExamResult[] = classStudents.map((std, idx) => {
      const found = data.find(d => d.student_id === std.id);
      if (found) return found;
      
      const defaultMarks = Math.floor((examObj.total_marks * 0.7) + (idx * 3) % (examObj.total_marks * 0.2));
      const pct = (defaultMarks / examObj.total_marks) * 100;
      return {
        id: `res-${std.id}-${selectedSubject}`,
        exam_id: selectedExam,
        exam_name: examObj.name || 'Unit Test 1',
        student_id: std.id,
        student_name: std.full_name,
        roll_no: std.roll_no,
        class_name: selectedClass,
        section_name: selectedSection,
        subject_id: selectedSubject,
        subject_name: subjectObj.name,
        marks_obtained: defaultMarks,
        max_marks: examObj.total_marks,
        grade: pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F',
        status: pct >= 40 ? 'Pass' : 'Fail',
        grading_state: 'Scored',
        remarks: pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs Work'
      };
    });

    setResultsList(merged);
  };

  const handleMarksChange = (studentId: string, marksStr: string) => {
    let marks = parseInt(marksStr, 10);
    if (isNaN(marks)) marks = 0;
    
    if (marks > examObj.total_marks) {
      onShowToast('Validation Error', `Marks cannot exceed maximum score of ${examObj.total_marks}`, 'error');
      marks = examObj.total_marks;
    } else if (marks < 0) {
      marks = 0;
    }

    setResultsList(resultsList.map(r => {
      if (r.student_id === studentId) {
        const pct = (marks / examObj.total_marks) * 100;
        let grade = 'F';
        if (pct >= 90) grade = 'A+';
        else if (pct >= 80) grade = 'A';
        else if (pct >= 70) grade = 'B';
        else if (pct >= 60) grade = 'C';
        else if (pct >= 50) grade = 'D';

        return {
          ...r,
          marks_obtained: marks,
          grade,
          status: pct >= 40 ? 'Pass' : 'Fail',
          grading_state: 'Scored',
          remarks: pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs Work'
        };
      }
      return r;
    }));
  };

  const handleSaveMarks = async () => {
    await resultService.saveResults(resultsList);
    onShowToast('Marks Recorded', 'Evaluated scores saved successfully', 'success');
  };

  const handleOpenReportCard = async (studentId: string) => {
    const card = await resultService.generateReportCard(studentId, selectedExam);
    if (card) {
      setReportCardModal(card);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="MARKS ENTRY & REPORT CARDS"
        subtitle="Grade entry portal, automated marks calculation, & printable student report cards."
        breadcrumbItems={[{ label: 'Results' }]}
        primaryAction={canMutateResults() ? {
          label: 'SAVE MARKS SHEET',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSaveMarks
        } : undefined}
      />

      {/* FILTER CONTROL BAR */}
      <div className="bg-amber-300 border-3 border-slate-900 brutal-shadow p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">EXAMINATION TERM</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">CLASS</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
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
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">SECTION</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-950 mb-1">SUBJECT</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="py-1.5 px-3 text-xs font-black bg-white border-2 border-slate-900"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} (Max {sub.max_marks})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-black text-slate-950 bg-white px-3 py-1.5 border-2 border-slate-900 brutal-shadow-sm flex items-center gap-2">
          <span>MAX MARKS: <span className="text-indigo-700 font-extrabold">{examObj.total_marks}</span></span>
          <span className="text-slate-300">|</span>
          <span>PASSING: <span className="text-emerald-700 font-extrabold">{Math.ceil(examObj.total_marks * 0.4)}</span></span>
        </div>
      </div>

      {/* MARKS ENTRY TABLE */}
      <div className="bg-white border-3 border-slate-900 brutal-shadow p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-900">
          <h3 className="font-black text-sm uppercase text-slate-900">
            MARKS SHEET: {selectedClass} - {selectedSection}
          </h3>
          <span className="text-xs font-bold text-slate-700">Enrolled: {resultsList.length} Students</span>
        </div>

        <div className="overflow-x-auto border-2 border-slate-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase border-b-2 border-slate-900">
                <th className="p-3">ROLL NO</th>
                <th className="p-3">STUDENT NAME</th>
                <th className="p-3 w-32">MARKS OBTAINED</th>
                <th className="p-3">PERCENTAGE</th>
                <th className="p-3">AUTO GRADE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 font-semibold">
              {resultsList.map((res) => {
                const pct = ((res.marks_obtained / res.max_marks) * 100).toFixed(1);
                return (
                  <tr key={res.student_id} className="hover:bg-amber-100/50">
                    <td className="p-3 font-mono font-bold text-indigo-700 text-sm">{res.roll_no}</td>
                    <td className="p-3 font-black text-slate-950">{res.student_name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={res.grading_state || 'Scored'}
                          onChange={(e) => {
                            const state = e.target.value as any;
                            setResultsList(resultsList.map(r2 => {
                              if(r2.student_id === res.student_id) {
                                let gState = state;
                                let newStatus = r2.status;
                                let newGrade = r2.grade;
                                
                                if (gState === 'Absent') {
                                  newStatus = 'Fail';
                                  newGrade = 'AB';
                                } else if (gState === 'Not Assessed') {
                                  newStatus = 'Pending';
                                  newGrade = '-';
                                } else if (gState === 'Exempt') {
                                  newStatus = 'Exempt';
                                  newGrade = 'EX';
                                } else {
                                  // Re-calculate based on marks if Scored
                                  const pct = (r2.marks_obtained / r2.max_marks) * 100;
                                  newStatus = pct >= 40 ? 'Pass' : 'Fail';
                                  if (pct >= 90) newGrade = 'A+';
                                  else if (pct >= 80) newGrade = 'A';
                                  else if (pct >= 70) newGrade = 'B';
                                  else if (pct >= 60) newGrade = 'C';
                                  else if (pct >= 50) newGrade = 'D';
                                  else newGrade = 'F';
                                }

                                return {
                                  ...r2,
                                  grading_state: state,
                                  status: newStatus as any,
                                  grade: newGrade
                                };
                              }
                              return r2;
                            }));
                          }}
                          className="w-24 px-2 py-1 border-2 font-black text-slate-950 text-xs focus:bg-white border-slate-900 bg-white"
                        >
                          <option value="Scored">Scored</option>
                          <option value="Absent">Absent</option>
                          <option value="Not Assessed">Not Assessed</option>
                          <option value="Exempt">Exempt</option>
                        </select>
                        
                        {(res.grading_state === 'Scored' || !res.grading_state) && (
                          <input
                            type="number"
                            max={examObj.total_marks}
                            min={0}
                            value={res.marks_obtained}
                            onChange={(e) => handleMarksChange(res.student_id, e.target.value)}
                            className={`w-20 px-2 py-1 border-2 font-black text-slate-950 text-sm focus:bg-white ${res.marks_obtained > examObj.total_marks ? 'border-rose-500 bg-rose-50' : 'border-slate-900 bg-amber-50'}`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-600">
                      {res.grading_state === 'Absent' ? '0%' : res.grading_state === 'Not Assessed' || res.grading_state === 'Exempt' ? '-' : `${pct}%`}
                    </td>
                    <td className="p-3 font-black text-indigo-900 text-sm">
                      {res.grade}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenReportCard(res.student_id)}
                        className="px-2.5 py-1 text-[11px] font-black bg-indigo-600 text-white border border-slate-900 brutal-shadow-sm hover:bg-indigo-700 flex items-center gap-1 ml-auto"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>SUMMARY</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE REPORT CARD UI MODAL */}
      {reportCardModal && (
        <Modal
          isOpen={!!reportCardModal}
          onClose={() => setReportCardModal(null)}
          title={`ACADEMIC REPORT CARD: ${reportCardModal.student.full_name}`}
          subtitle="Official Performance Transcript"
          maxWidth="2xl"
        >
          <div className="space-y-4 printable-area">
            {/* OFFICIAL SCHOOL HEADER */}
            <div className="p-6 bg-slate-900 text-white border-3 border-slate-900 brutal-shadow text-center relative overflow-hidden">
              <div className="absolute top-2 left-3 p-2 bg-amber-300 text-slate-950 border border-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-wide uppercase">METRO INTERNATIONAL ACADEMY</h1>
              <p className="text-xs font-semibold text-slate-300">AFFILIATED TO NATIONAL EDUCATION BOARD | ESTD. 1995</p>
              <div className="mt-2 text-xs font-black uppercase text-amber-300 bg-slate-800 py-1 border border-slate-700">
                OFFICIAL REPORT CARD & TRANSCRIPT ({reportCardModal.academic_year})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold border-3 border-slate-900 p-4 bg-slate-50">
              <div>
                <span className="text-slate-500 uppercase">Student Name:</span>
                <p className="text-sm font-black text-slate-950 uppercase">{reportCardModal.student.full_name}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Examination:</span>
                <p className="text-sm font-black text-slate-950 uppercase">{reportCardModal.exam_name}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Class & Section:</span>
                <p className="text-sm font-black text-slate-950 uppercase">{reportCardModal.student.class_name} - {reportCardModal.student.section_name}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase">Admission / Roll No:</span>
                <p className="text-sm font-black text-slate-950 uppercase">{reportCardModal.student.admission_no} / {reportCardModal.student.roll_no}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-3 border-slate-900 font-bold bg-white">
              <thead className="bg-slate-200 uppercase border-b-3 border-slate-900">
                <tr>
                  <th className="p-3 border-r-2 border-slate-900">Subject Details</th>
                  <th className="p-3 border-r-2 border-slate-900 text-center">Max Marks</th>
                  <th className="p-3 border-r-2 border-slate-900 text-center">Obtained</th>
                  <th className="p-3 border-r-2 border-slate-900 text-center">Grade</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900">
                {reportCardModal.subject_results.map((sub, i) => (
                  <tr key={i}>
                    <td className="p-3 border-r-2 border-slate-900 font-black">{sub.subject_name}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-center text-slate-600">{sub.max_marks}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-center text-indigo-700 font-black">{sub.marks_obtained !== null ? sub.marks_obtained : '-'}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-center">{sub.grade}</td>
                    <td className="p-3 text-slate-600 italic">{sub.remarks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-amber-100 border-t-3 border-slate-900 font-black uppercase">
                <tr>
                  <td className="p-3 border-r-2 border-slate-900">GRAND TOTAL</td>
                  <td className="p-3 border-r-2 border-slate-900 text-center">{reportCardModal.total_max}</td>
                  <td className="p-3 border-r-2 border-slate-900 text-center text-indigo-900">{reportCardModal.total_obtained}</td>
                  <td colSpan={2} className="p-3 text-center">
                    PERCENTAGE: <span className="text-indigo-900">{reportCardModal.percentage}%</span>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex gap-4 p-4 border-3 border-slate-900 bg-white items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white border-2 border-slate-900">
                  <ShieldCheck className="w-8 h-8 text-amber-300" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">Final Status</div>
                  <div className={`text-xl font-black uppercase ${reportCardModal.status === 'PROVISIONAL' ? 'text-amber-500' : reportCardModal.status.includes('PASSED') ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {reportCardModal.status}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase">Overall Grade</div>
                <div className="text-3xl font-black text-slate-900">{reportCardModal.grade}</div>
              </div>
            </div>

            {reportCardModal.is_provisional && (
              <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 flex items-center gap-2 text-amber-800 text-xs font-bold">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>This report card is provisional because one or more subjects are marked as "Not Assessed". Final publication and printing is disabled.</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-slate-200 mt-4 gap-3">
            <button 
              onClick={() => setReportCardModal(null)} 
              className="px-4 py-2 border-2 border-slate-900 bg-white font-bold text-sm brutal-shadow-sm hover:bg-slate-50"
            >
              CLOSE
            </button>
            <button 
              onClick={() => {
                onShowToast('Print Job Sent', 'Report card has been sent to the printer.', 'info');
              }}
              disabled={reportCardModal.is_provisional}
              className={`px-5 py-2 border-2 border-slate-900 font-black text-sm uppercase flex items-center gap-2 brutal-shadow-sm ${reportCardModal.is_provisional ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
            >
              <Printer className="w-4 h-4" />
              PRINT REPORT CARD
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
