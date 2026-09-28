import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { Map, Layers, ZoomIn, ZoomOut, RotateCcw, List, Calendar as CalendarIcon, Users } from 'lucide-react';
import { mockTimetable } from '../../data/mockData';

interface CampusViewProps {
  onShowToast: (title: string, message: string, type?: 'success'|'error'|'info'|'warning') => void;
}

const buildings = [
  { id: 'b1', name: 'Main Academic Block', type: 'Academic', color: 'bg-indigo-500', rooms: ['101', '102', '103', '104'] },
  { id: 'b2', name: 'Science Wing', type: 'Lab', color: 'bg-emerald-500', rooms: ['Bio Lab', 'Chem Lab', 'Physics Lab', 'CS Lab 1'] },
  { id: 'b3', name: 'Library & Admin', type: 'Admin', color: 'bg-amber-500', rooms: ['Library', 'Staff Room', 'Principal Office'] },
  { id: 'b4', name: 'Sports Complex', type: 'Sports', color: 'bg-rose-500', rooms: ['Ground', 'Gym', 'Pool'] },
  { id: 'b5', name: 'Arts Center', type: 'Arts', color: 'bg-purple-500', rooms: ['Art Room', 'Auditorium', 'Music Room'] },
];

export const CampusView: React.FC<CampusViewProps> = ({ onShowToast }) => {
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const activeBuilding = buildings.find(b => b.id === selectedBuilding);

  // Extract timetable for the selected room
  const roomTimetable = selectedRoom 
    ? mockTimetable.filter(t => t.room_number === selectedRoom && t.day === 'Monday') 
    : [];

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 1.6));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.6));
  const handleReset = () => {
    setZoom(1);
    setSelectedBuilding(null);
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Campus Map"
        subtitle="Interactive view of school buildings and room schedules."
        breadcrumbItems={[{ label: 'Campus' }]}
        primaryAction={{
          label: viewMode === '3d' ? 'Switch to List View' : 'Switch to 3D View',
          icon: viewMode === '3d' ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />,
          onClick: () => setViewMode(viewMode === '3d' ? 'list' : '3d')
        }}
      />

      {viewMode === '3d' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Interactive CSS 3D Campus */}
          <div className="lg:col-span-2 premium-card relative overflow-hidden bg-slate-50 flex items-center justify-center border-slate-200">
            {/* Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-slate-200">
              <button onClick={handleZoomIn} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
              <button onClick={handleZoomOut} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
              <div className="h-px w-full bg-slate-200 my-1"></div>
              <button onClick={handleReset} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg" title="Reset View"><RotateCcw className="w-5 h-5" /></button>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm border border-slate-200">
              Interactive 3D Demo
            </div>

            <div 
              className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* The "Map" plane */}
              <div 
                className="relative w-96 h-96 transition-transform duration-700 ease-out preserve-3d"
                style={{
                  transform: 'rotateX(60deg) rotateZ(-45deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Grass Base */}
                <div className="absolute inset-0 bg-emerald-100/50 rounded-3xl border-4 border-emerald-200/50 shadow-inner"></div>

                {/* Buildings */}
                <div className="absolute inset-0">
                  {buildings.map((b, idx) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBuilding(b.id);
                        setSelectedRoom(null);
                      }}
                      className={`absolute transition-all duration-300 transform preserve-3d group ${
                        selectedBuilding === b.id ? '-translate-z-4' : 'hover:-translate-z-2'
                      }`}
                      style={{
                        top: `${10 + (idx * 15)}%`,
                        left: `${10 + ((idx % 2) * 40)}%`,
                        width: '30%',
                        height: '25%',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* 3D Cube faces for building */}
                      <div className={`absolute inset-0 ${b.color} opacity-90 rounded-md shadow-[20px_20px_40px_rgba(0,0,0,0.2)] border border-white/20 flex items-center justify-center transform translate-z-10 group-hover:bg-opacity-100`}>
                        <div className="text-white font-bold text-xs transform -rotate-z-45">{b.name}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 w-full h-4 ${b.color} brightness-75 transform origin-bottom rotate-x-90`}></div>
                      <div className={`absolute top-0 right-0 w-4 h-full ${b.color} brightness-50 transform origin-right -rotate-y-90`}></div>
                      
                      {selectedBuilding === b.id && (
                        <div className="absolute -inset-2 border-2 border-white/50 rounded-lg animate-pulse transform translate-z-10"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel for Selection Details */}
          <div className="premium-card bg-white p-5 flex flex-col h-full overflow-y-auto border-slate-200">
            {activeBuilding ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-start gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${activeBuilding.color} text-white`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{activeBuilding.name}</h2>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                      {activeBuilding.type} Zone
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Rooms in Building</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {activeBuilding.rooms.map(room => (
                    <button
                      key={room}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3 text-sm font-semibold rounded-lg border text-left transition-all ${
                        selectedRoom === room 
                          ? 'bg-teal-50 border-teal-200 text-teal-800 ring-1 ring-teal-500' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>

                {selectedRoom && (
                  <div className="animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> Room {selectedRoom} Timetable (Today)
                    </h3>
                    
                    {roomTimetable.length > 0 ? (
                      <div className="space-y-2">
                        {roomTimetable.map(tt => (
                          <div key={tt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                            <div className="w-16 shrink-0 text-[10px] font-bold text-slate-500 pt-0.5">
                              {tt.start_time}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-900 leading-tight">{tt.subject_name}</p>
                              <p className="text-xs text-slate-500 mt-1">Class {tt.class_id.split('-')[1]}-{tt.section_id.slice(-1).toUpperCase()} • {tt.teacher_name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center text-sm text-slate-500 font-medium">
                        No classes scheduled for today.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <Map className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-sm font-medium">Select a building on the map to view its details and rooms.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* List View */}
          {buildings.map(b => (
            <div key={b.id} className="premium-card p-5 bg-white border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${b.color}`} />
                <h3 className="text-lg font-bold text-slate-900">{b.name}</h3>
              </div>
              <div className="space-y-2">
                {b.rooms.map(room => (
                  <div key={room} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{room}</span>
                    <button 
                      onClick={() => {
                        setSelectedBuilding(b.id);
                        setSelectedRoom(room);
                        setViewMode('3d');
                      }}
                      className="text-[10px] font-bold text-teal-600 uppercase hover:underline"
                    >
                      View Timetable
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
