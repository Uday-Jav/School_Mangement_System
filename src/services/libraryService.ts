import { Book, BookCopy, BookIssue } from '../types';
import { dataStore } from './dataStore';

export const libraryService = {
  // Books (Titles)
  async getBooks(): Promise<Book[]> {
    const books = dataStore.getCollection<Book>('books');
    return Promise.resolve(books.filter(b => !b.is_archived));
  },

  async addBook(bookData: Omit<Book, 'id'>): Promise<Book> {
    const books = dataStore.getCollection<Book>('books');
    const newBook: Book = {
      ...bookData,
      id: `bk-${Date.now()}`,
      is_archived: false
    };
    books.push(newBook);
    dataStore.setCollection('books', books);
    return Promise.resolve(newBook);
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const books = dataStore.getCollection<Book>('books');
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    books[index] = { ...books[index], ...updates };
    dataStore.setCollection('books', books);
    return Promise.resolve(books[index]);
  },

  async archiveBook(id: string): Promise<void> {
    const books = dataStore.getCollection<Book>('books');
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return;
    books[index].is_archived = true;
    dataStore.setCollection('books', books);
    return Promise.resolve();
  },

  // Book Copies
  async getBookCopies(bookId: string): Promise<BookCopy[]> {
    const copies = dataStore.getCollection<BookCopy>('bookCopies');
    return Promise.resolve(copies.filter(c => c.book_id === bookId && c.status !== 'Archived'));
  },

  async addCopy(bookId: string, condition: 'New' | 'Good' | 'Fair' | 'Poor'): Promise<BookCopy> {
    const copies = dataStore.getCollection<BookCopy>('bookCopies');
    const newCopy: BookCopy = {
      id: `cpy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      book_id: bookId,
      condition,
      status: 'Available'
    };
    copies.push(newCopy);
    dataStore.setCollection('bookCopies', copies);
    return Promise.resolve(newCopy);
  },

  async archiveCopy(copyId: string): Promise<void> {
    const copies = dataStore.getCollection<BookCopy>('bookCopies');
    const index = copies.findIndex(c => c.id === copyId);
    if (index !== -1) {
      copies[index].status = 'Archived';
      dataStore.setCollection('bookCopies', copies);
    }
    return Promise.resolve();
  },

  async getActiveIssues(): Promise<BookIssue[]> {
    const issues = dataStore.getCollection<BookIssue>('bookIssues');
    // Mark overdue if due date is passed and calculate deterministic simulated fine ($1 per day overdue)
    const now = new Date();
    let changed = false;
    issues.forEach(i => {
      if (i.status === 'Issued' || i.status === 'Overdue') {
        const dueDate = new Date(i.due_date);
        if (dueDate < now) {
          i.status = 'Overdue';
          const diffTime = Math.abs(now.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const simulatedFine = diffDays * 1; // $1 per day
          if (i.fine_amount !== simulatedFine) {
            i.fine_amount = simulatedFine;
            changed = true;
          }
        }
      }
    });
    if (changed) dataStore.setCollection('bookIssues', issues);
    
    return Promise.resolve(issues.filter(i => i.status === 'Issued' || i.status === 'Overdue'));
  },

  async getStudentHistory(studentId: string): Promise<BookIssue[]> {
    const issues = dataStore.getCollection<BookIssue>('bookIssues');
    return Promise.resolve(issues.filter(i => i.student_id === studentId));
  },

  async issueBook(copyId: string, studentId: string, studentName: string, className: string, dueDate: string): Promise<BookIssue> {
    const copies = dataStore.getCollection<BookCopy>('bookCopies');
    const copyIndex = copies.findIndex(c => c.id === copyId);
    if (copyIndex === -1) throw new Error('Copy not found');
    if (copies[copyIndex].status !== 'Available') throw new Error('Copy is not available');

    const books = dataStore.getCollection<Book>('books');
    const book = books.find(b => b.id === copies[copyIndex].book_id);
    if (!book) throw new Error('Book not found');

    const issues = dataStore.getCollection<BookIssue>('bookIssues');
    // check if student already has this exact copy issued?
    const hasSameCopy = issues.find(i => i.copy_id === copyId && (i.status === 'Issued' || i.status === 'Overdue'));
    if (hasSameCopy) throw new Error('Copy is already issued');

    const newIssue: BookIssue = {
      id: `iss-${Date.now()}`,
      copy_id: copyId,
      book_id: book.id,
      book_title: book.title,
      student_id: studentId,
      student_name: studentName,
      class_name: className,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      fine_amount: 0,
      status: 'Issued'
    };

    issues.push(newIssue);
    dataStore.setCollection('bookIssues', issues);

    copies[copyIndex].status = 'Issued';
    dataStore.setCollection('bookCopies', copies);

    return Promise.resolve(newIssue);
  },

  async returnBook(issueId: string): Promise<void> {
    const issues = dataStore.getCollection<BookIssue>('bookIssues');
    const issueIndex = issues.findIndex(i => i.id === issueId);
    if (issueIndex === -1) throw new Error('Issue record not found');
    if (issues[issueIndex].status === 'Returned' || issues[issueIndex].status === 'Lost') {
      throw new Error('Already returned or marked lost');
    }

    issues[issueIndex].status = 'Returned';
    issues[issueIndex].return_date = new Date().toISOString().split('T')[0];
    dataStore.setCollection('bookIssues', issues);

    const copies = dataStore.getCollection<BookCopy>('bookCopies');
    const copyIndex = copies.findIndex(c => c.id === issues[issueIndex].copy_id);
    if (copyIndex !== -1) {
      copies[copyIndex].status = 'Available';
      dataStore.setCollection('bookCopies', copies);
    }

    return Promise.resolve();
  }
};
