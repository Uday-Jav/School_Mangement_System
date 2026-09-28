const fs = require('fs');
const path = require('path');

const applyPermissions = (file, mutateFn, actionsRegex, headerRegexes) => {
  const p = path.join('c:/Users/udaym/Desktop/School Mangement/src/components/modules', file);
  if (!fs.existsSync(p)) return;
  let code = fs.readFileSync(p, 'utf-8');

  if (!code.includes(mutateFn)) {
    code = code.replace(/import React[^;]+;/, match => `${match}\nimport { ${mutateFn} } from '../../utils/permissions';`);
  }

  if (headerRegexes) {
    headerRegexes.forEach(h => {
      code = code.replace(h.search, h.replace);
    });
  }

  if (actionsRegex) {
    code = code.replace(actionsRegex.search, actionsRegex.replace);
  }

  fs.writeFileSync(p, code);
};

// 1. AttendanceView
applyPermissions('AttendanceView.tsx', 'canMutateAttendance', {
  search: /<div className="flex items-center justify-center gap-1.5">([\s\S]*?)<\/div>/,
  replace: `<div className="flex items-center justify-center gap-1.5">\n{!canMutateAttendance() && <span className="font-semibold text-slate-700">{rec.status}</span>}\n{canMutateAttendance() && (<>$1</>)}\n</div>`
}, [
  { search: /primaryAction={{([\s\S]*?onClick: handleSaveAttendance\s*})}/, replace: `primaryAction={canMutateAttendance() ? {$1} : undefined}` },
  { search: /secondaryAction={{([\s\S]*?onClick: handleMarkAllPresent\s*})}/, replace: `secondaryAction={canMutateAttendance() ? {$1} : undefined}` }
]);

// 2. ResultsView
applyPermissions('ResultsView.tsx', 'canMutateResults', {
  search: /actions={\(row\) => \(([\s\S]*?)\)}/,
  replace: `actions={(row) => canMutateResults() ? ($1) : null}`
}, [
  { search: /primaryAction={{([\s\S]*?label: 'ADD RESULT'[\s\S]*?onClick: handleOpenAdd\s*})}/, replace: `primaryAction={canMutateResults() ? {$1} : undefined}` }
]);

// 3. StudentsView
applyPermissions('StudentsView.tsx', 'canMutateStudents', {
  search: /<button\s+onClick={\(\) => handleOpenEdit\(row\)}[\s\S]*?<\/button>[\s\S]*?<button\s+onClick={\(\) => setDeleteId\(row\.id\)}[\s\S]*?<\/button>/g,
  replace: `{canMutateStudents() && (<><button onClick={() => handleOpenEdit(row)} className="p-1.5 bg-indigo-100 border border-slate-900 hover:bg-indigo-200 font-bold"><Edit3 className="w-3.5 h-3.5 text-indigo-900" /></button><button onClick={() => setDeleteId(row.id)} className="p-1.5 bg-rose-200 border border-slate-900 hover:bg-rose-300 font-bold"><Trash2 className="w-3.5 h-3.5 text-rose-900" /></button></>)}`
}, [
  { search: /primaryAction={{([\s\S]*?onClick: handleOpenAdd\s*})}/, replace: `primaryAction={canMutateStudents() ? {$1} : undefined}` }
]);

// 4. FeesView
applyPermissions('FeesView.tsx', 'canMutateFees', {
  search: /actions={\(row\) => \(([\s\S]*?)\)}/,
  replace: `actions={(row) => canMutateFees() ? ($1) : null}`
}, [
  { search: /primaryAction={{([\s\S]*?label: 'RECORD PAYMENT'[\s\S]*?onClick: handleOpenAdd\s*})}/, replace: `primaryAction={canMutateFees() ? {$1} : undefined}` }
]);

console.log("Patched views");
