import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Notice } from '../../types';
import { noticeService } from '../../services/noticeService';
import { Bell, Plus, Eye, CheckCircle2 } from 'lucide-react';

interface NoticesViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  openCreateNoticeInitially?: boolean;
}

export const NoticesView: React.FC<NoticesViewProps> = ({ onShowToast, openCreateNoticeInitially = false }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(openCreateNoticeInitially);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'All' | 'Teachers' | 'Students' | 'Parents'>('All');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    const data = await noticeService.getNotices();
    setNotices(data);
    setLoading(false);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    await noticeService.createNotice({
      title,
      content,
      published_date: new Date().toISOString().split('T')[0],
      target_audience: targetAudience,
      created_by: 'Principal Office',
      status: 'Published',
      priority: 'Medium',
      expiry_date: '2026-12-31'
    });
    
    onShowToast('Notice Published', `Broadcasted "${title}" to ${targetAudience}`, 'success');
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    loadNotices();
  };

  const columns: Column<Notice>[] = [
    { header: 'Title', accessorKey: 'title', cell: (row) => <span className="font-black text-slate-950">{row.title}</span> },
    { header: 'Target Audience', accessorKey: 'target_audience', cell: (row) => <span className="px-2 py-0.5 bg-amber-300 border border-slate-900 font-extrabold text-[10px] uppercase">{row.target_audience}</span> },
    { header: 'Published Date', accessorKey: 'published_date' },
    { header: 'Issued By', accessorKey: 'created_by', cell: (row) => <span className="font-bold text-indigo-900 uppercase">{row.created_by}</span> },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} size="sm" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="NOTICES & CIRCULARS"
        subtitle="School bulletin board, broadcast circulars, and target audience notifications."
        breadcrumbItems={[{ label: 'Notices' }]}
        primaryAction={{
          label: 'CREATE NOTICE',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsModalOpen(true)
        }}
      />

      <DataTable<Notice>
        data={notices}
        columns={columns}
        searchPlaceholder="Search notices by title or content..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        onRowClick={(row) => setSelectedNotice(row)}
        actions={(row) => (
          <button
            onClick={() => setSelectedNotice(row)}
            className="p-1.5 bg-amber-300 border border-slate-900 font-bold text-[10px] flex items-center gap-1 uppercase hover:bg-amber-400"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>READ</span>
          </button>
        )}
      />

      {/* CREATE NOTICE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="CREATE NEW NOTICE" subtitle="Publish a new circular to the school board.">
        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">NOTICE TITLE</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-slate-50 border-2 border-slate-900" placeholder="e.g. Annual Sports Meet 2025" />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">TARGET AUDIENCE</label>
            <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)} className="w-full p-2 bg-slate-50 border-2 border-slate-900">
              <option value="All">All School (Public)</option>
              <option value="Teachers">Teachers & Faculty Only</option>
              <option value="Students">Students Only</option>
              <option value="Parents">Parents & Guardians</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">NOTICE CONTENT</label>
            <textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 bg-slate-50 border-2 border-slate-900 leading-relaxed" placeholder="Type notice content here..." />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase flex items-center gap-2 hover:bg-indigo-700 brutal-shadow-sm">
              <Bell className="w-4 h-4" />
              PUBLISH NOTICE
            </button>
          </div>
        </form>
      </Modal>

      {/* READ NOTICE MODAL */}
      {selectedNotice && (
        <Modal isOpen={!!selectedNotice} onClose={() => setSelectedNotice(null)} title={selectedNotice.title}>
          <div className="space-y-3 text-xs font-bold">
            <div className="flex justify-between border-b-2 border-slate-900 pb-2">
              <span>Audience: <strong className="uppercase text-indigo-900">{selectedNotice.target_audience}</strong></span>
              <span>Issued Date: {selectedNotice.published_date}</span>
            </div>
            <div className="p-4 bg-amber-50 border-2 border-slate-900 font-medium text-sm leading-relaxed text-slate-900">
              {selectedNotice.content}
            </div>
            <div className="text-right text-slate-600 font-extrabold uppercase">
              Issued By: {selectedNotice.created_by}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
