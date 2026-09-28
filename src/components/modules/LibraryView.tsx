import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Book, BookIssue } from '../../types';
import { libraryService } from '../../services/libraryService';
import { mockBooks, mockBookIssues, mockStudents } from '../../data/mockData';
import { Book as BookIcon, Library as LibraryIcon, Plus, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, DollarSign } from 'lucide-react';

interface LibraryViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onShowToast }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'issues'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [returnIssue, setReturnIssue] = useState<BookIssue | null>(null);

  // Forms
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('978-013');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newCopies, setNewCopies] = useState(10);

  // Issue Form
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(mockStudents[0].id);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    setLoading(true);
    const bData = await libraryService.getBooks();
    const iData = await libraryService.getActiveIssues();
    setBooks(bData);
    setBookIssues(iData);
    if (bData.length > 0) setSelectedBookId(bData[0].id);
    setLoading(false);
  };

  const loadCopiesAndIssues = async (bookId: string) => {
    // optional helper to load copies for a selected book
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) return;
    const newBook = await libraryService.addBook({
      isbn: newIsbn,
      title: newTitle,
      author: newAuthor,
      category: newCategory,
      publisher: 'Academic Press',
      edition: '1st Edition',
      shelf_location: 'Rack CS-05'
    });
    // Add copies
    const copiesCount = Number(newCopies);
    for (let i = 0; i < copiesCount; i++) {
      await libraryService.addCopy(newBook.id, 'New');
    }
    onShowToast('Book Added', `Cataloged "${newTitle}" with ${newCopies} copies`, 'success');
    setIsAddBookOpen(false);
    loadLibraryData();
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // We need to fetch copies to find an available one
    const allCopies = await libraryService.getBookCopies(selectedBookId);
    const availableCopy = allCopies.find(c => c.status === 'Available');

    if (!availableCopy) {
      onShowToast('Issue Unavailable', 'No available copies left for this book', 'warning');
      return;
    }

    const student = mockStudents.find(s => s.id === selectedStudentId);
    if (!student) return;

    try {
      await libraryService.issueBook(
        availableCopy.id,
        student.id,
        student.full_name,
        student.class_name,
        '2026-09-14' // Dummy due date
      );
      onShowToast('Book Issued', `Issued copy ${availableCopy.id} of "${student.full_name}"`, 'success');
      setIsIssueBookOpen(false);
      loadLibraryData();
    } catch (err: any) {
      onShowToast('Error', err.message, 'error');
    }
  };

  const handleReturnConfirm = async () => {
    if (!returnIssue) return;
    try {
      await libraryService.returnBook(returnIssue.id);
      onShowToast('Book Returned', `Processed return for "${returnIssue.book_title}"`, 'success');
      setReturnIssue(null);
      loadLibraryData();
    } catch (err: any) {
      onShowToast('Error', err.message, 'error');
    }
  };

  const filteredBooks = books.filter(b => categoryFilter ? b.category === categoryFilter : true);

  const bookColumns: Column<Book>[] = [
    { header: 'ISBN', accessorKey: 'isbn', cell: (row) => <span className="font-mono text-indigo-700 font-extrabold">{row.isbn}</span> },
    { header: 'Title', accessorKey: 'title', cell: (row) => <span className="font-black text-slate-950">{row.title}</span> },
    { header: 'Author', accessorKey: 'author' },
    { header: 'Category', accessorKey: 'category', cell: (row) => <span className="px-2 py-0.5 bg-amber-200 border border-slate-900 font-extrabold text-[10px] uppercase">{row.category}</span> },
    { header: 'Shelf Location', accessorKey: 'shelf_location' }
  ];

  const issueColumns: Column<BookIssue>[] = [
    { header: 'Book Title', accessorKey: 'book_title', cell: (row) => <span className="font-black text-slate-950">{row.book_title}</span> },
    { header: 'Student Name', accessorKey: 'student_name', cell: (row) => <span className="font-bold">{row.student_name} ({row.class_name})</span> },
    { header: 'Issue Date', accessorKey: 'issue_date' },
    { header: 'Due Date', accessorKey: 'due_date', cell: (row) => <span className="font-mono text-rose-800 font-bold">{row.due_date}</span> },
    { header: 'Fine ($)', accessorKey: 'fine_amount', cell: (row) => <span className="font-black text-rose-700">${row.fine_amount}</span> },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="LIBRARY MANAGEMENT"
        subtitle="Book cataloging, student lending, due date tracking, & fine processing."
        breadcrumbItems={[{ label: 'Library' }]}
        primaryAction={{
          label: 'ISSUE BOOK',
          icon: <ArrowUpRight className="w-4 h-4" />,
          onClick: () => setIsIssueBookOpen(true)
        }}
        secondaryAction={{
          label: 'ADD NEW BOOK',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsAddBookOpen(true)
        }}
      />

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={books.length} subtitle="Titles in Catalog" icon={BookIcon} color="indigo" />
        <StatCard title="Issued Books" value={bookIssues.filter(i => i.status === 'Issued' || i.status === 'Overdue').length} subtitle="Currently Out" icon={LibraryIcon} color="blue" />
        <StatCard title="Overdue Books" value={bookIssues.filter(i => i.status === 'Overdue').length} subtitle="Past Due Date" icon={AlertCircle} color="rose" />
        <StatCard title="Total Fines" value="$0" subtitle="Collected" icon={DollarSign} color="amber" />
      </div>

      {/* SUB TABS */}
      <div className="flex border-b-3 border-slate-900 gap-2">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
            activeSubTab === 'catalog' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
          }`}
        >
          Book Catalog
        </button>
        <button
          onClick={() => setActiveSubTab('issues')}
          className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
            activeSubTab === 'issues' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
          }`}
        >
          Issued Books & Returns
        </button>
      </div>

      {activeSubTab === 'catalog' && (
        <DataTable<Book>
          data={filteredBooks}
          columns={bookColumns}
          searchPlaceholder="Search catalog by title, author, ISBN..."
          keyExtractor={(item) => item.id}
          pageSize={10}
          actions={(row) => (
            <button
               onClick={async () => {
                 await libraryService.archiveBook(row.id);
                 onShowToast('Archived', 'Book archived successfully', 'info');
                 loadLibraryData();
               }}
               className="p-1.5 bg-rose-200 border border-slate-900 font-extrabold text-[10px] uppercase"
            >
               ARCHIVE
            </button>
          )}
          filters={
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900"
            >
              <option value="">All Categories</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Literature">Literature</option>
              <option value="Science">Science</option>
            </select>
          }
        />
      )}

      {activeSubTab === 'issues' && (
        <DataTable<BookIssue>
          data={bookIssues}
          columns={issueColumns}
          searchPlaceholder="Search issue record by book title or student..."
          keyExtractor={(item) => item.id}
          pageSize={10}
          actions={(row) => (
            row.status === 'Issued' || row.status === 'Overdue' ? (
              <button
                onClick={() => setReturnIssue(row)}
                className="p-1.5 bg-emerald-300 border border-slate-900 font-extrabold text-[10px] flex items-center gap-1 uppercase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETURN</span>
              </button>
            ) : null
          )}
        />
      )}

      {/* ADD BOOK MODAL */}
      <Modal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} title="CATALOG NEW BOOK">
        <form onSubmit={handleAddBook} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">BOOK TITLE *</label>
            <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">AUTHOR *</label>
            <input type="text" required value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">ISBN</label>
              <input type="text" value={newIsbn} onChange={(e) => setNewIsbn(e.target.value)} className="w-full p-2 border-2 border-slate-900 font-mono" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">COPIES</label>
              <input type="number" min="1" value={newCopies} onChange={(e) => setNewCopies(Number(e.target.value))} className="w-full p-2 border-2 border-slate-900" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button type="button" onClick={() => setIsAddBookOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">ADD TO CATALOG</button>
          </div>
        </form>
      </Modal>

      {/* ISSUE BOOK MODAL */}
      <Modal isOpen={isIssueBookOpen} onClose={() => setIsIssueBookOpen(false)} title="ISSUE BOOK TO STUDENT">
        <form onSubmit={handleIssueBook} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">SELECT BOOK TITLE</label>
            <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)} className="w-full p-2 border-2 border-slate-900">
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">An available copy will be automatically selected for this title.</p>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">SELECT STUDENT</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-2 border-2 border-slate-900">
              {mockStudents.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.class_name}-{s.section_name})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button type="button" onClick={() => setIsIssueBookOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">CONFIRM ISSUE</button>
          </div>
        </form>
      </Modal>

      {/* RETURN CONFIRM MODAL */}
      {returnIssue && (
        <Modal isOpen={!!returnIssue} onClose={() => setReturnIssue(null)} title="PROCESS BOOK RETURN">
          <div className="space-y-4 text-xs font-bold">
            <p>Confirm return of "<strong>{returnIssue.book_title}</strong>" issued to <strong>{returnIssue.student_name}</strong>.</p>
            {returnIssue.fine_amount > 0 && (
              <div className="p-3 bg-rose-100 border-2 border-slate-900 text-rose-900 font-black">
                OVERDUE FINE APPLIED: ${returnIssue.fine_amount}.00
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
              <button onClick={() => setReturnIssue(null)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
              <button onClick={handleReturnConfirm} className="px-5 py-2 bg-emerald-600 text-white border-2 border-slate-900 font-black uppercase">PROCESS RETURN</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};



