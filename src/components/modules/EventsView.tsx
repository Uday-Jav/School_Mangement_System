import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Event } from '../../types';
import { eventsService } from '../../services/eventsService';
import { Calendar, Plus, MapPin, Users, Edit } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface EventsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onShowToast }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'Academic' | 'Sports' | 'Cultural' | 'Other'>('Sports');
  const [date, setDate] = useState('2026-09-15');
  const [venue, setVenue] = useState('Main Sports Stadium');
  const [organizer, setOrganizer] = useState('Sports & Cultural Committee');
  const [targetAudience, setTargetAudience] = useState<'All' | 'Teachers' | 'Students' | 'Parents'>('All');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await eventsService.getEvents();
    setEvents(data);
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditId(event.id);
      setTitle(event.title);
      setEventType(event.event_type as any);
      setDate(event.date);
      setVenue(event.venue);
      setOrganizer(event.organizer);
      setTargetAudience(event.target_audience || 'All');
    } else {
      setEditId(null);
      setTitle('');
      setEventType('Sports');
      setDate(new Date().toISOString().split('T')[0]);
      setVenue('');
      setOrganizer('');
      setTargetAudience('All');
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    if (editId) {
      await eventsService.updateEvent(editId, {
        title,
        event_type: eventType,
        date,
        venue,
        organizer,
        target_audience: targetAudience
      });
      onShowToast('Event Updated', `Updated "${title}"`, 'success');
    } else {
      await eventsService.addEvent({
        title,
        event_type: eventType,
        date,
        venue,
        description: 'Scheduled campus event.',
        organizer,
        target_audience: targetAudience,
        status: 'Scheduled'
      });
      onShowToast('Event Scheduled', `Added "${title}" to school calendar`, 'success');
    }
    setIsEventModalOpen(false);
    loadEvents();
  };

  const handleCancelEvent = async () => {
    if (!editId) return;
    await eventsService.cancelEvent(editId);
    onShowToast('Event Cancelled', 'The event has been cancelled.', 'info');
    setIsEventModalOpen(false);
    loadEvents();
  };

  const filteredEvents = events.filter(e => {
    if (typeFilter && e.event_type !== typeFilter) return false;
    if (audienceFilter && e.target_audience && e.target_audience !== 'All' && e.target_audience !== audienceFilter) return false;
    return true;
  });

  const columns: Column<Event>[] = [
    { header: 'Event Title', accessorKey: 'title', cell: (row) => <span className="font-black text-slate-950">{row.title}</span> },
    { header: 'Type', accessorKey: 'event_type', cell: (row) => <span className="px-2 py-0.5 bg-amber-300 border border-slate-900 font-extrabold text-[10px] uppercase">{row.event_type}</span> },
    { header: 'Audience', accessorKey: 'target_audience', cell: (row) => <span className="text-xs font-bold text-slate-600">{row.target_audience || 'All'}</span> },
    { header: 'Date', accessorKey: 'date', cell: (row) => <span className="font-mono text-indigo-900 font-bold">{row.date}</span> },
    { header: 'Venue', accessorKey: 'venue' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status || 'Scheduled'} size="sm" /> },
    { header: 'Action', accessorKey: 'id', cell: (row) => (
      <button onClick={() => handleOpenModal(row)} className="text-indigo-600 hover:text-indigo-800">
        <Edit className="w-4 h-4" />
      </button>
    ) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CAMPUS EVENTS CALENDAR"
        subtitle="Sports meets, academic symposiums, cultural festivals, and school holidays."
        breadcrumbItems={[{ label: 'Events' }]}
        primaryAction={{
          label: 'SCHEDULE EVENT',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => handleOpenModal()
        }}
      />

      <DataTable<Event>
        data={filteredEvents}
        columns={columns}
        searchPlaceholder="Search event title or venue..."
        keyExtractor={(item) => item.id}
        pageSize={10}
        filters={
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900"
            >
              <option value="">All Types</option>
              <option value="Sports">Sports</option>
              <option value="Academic">Academic</option>
              <option value="Cultural">Cultural</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold bg-white border-2 border-slate-900"
            >
              <option value="">All Audiences</option>
              <option value="Teachers">Teachers</option>
              <option value="Students">Students</option>
              <option value="Parents">Parents</option>
            </select>
          </div>
        }
      />

      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={editId ? "EDIT EVENT" : "SCHEDULE CAMPUS EVENT"}>
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">EVENT TITLE *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">EVENT TYPE</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value as any)} className="w-full p-2 border-2 border-slate-900">
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">DATE</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">VENUE / LOCATION</label>
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">TARGET AUDIENCE</label>
              <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)} className="w-full p-2 border-2 border-slate-900">
                <option value="All">All</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">ORGANIZER</label>
            <input type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-slate-900">
            {editId ? (
              <button type="button" onClick={handleCancelEvent} className="px-4 py-2 bg-rose-600 text-white border-2 border-slate-900 font-bold uppercase">CANCEL EVENT</button>
            ) : <div></div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">DISMISS</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">SAVE EVENT</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
