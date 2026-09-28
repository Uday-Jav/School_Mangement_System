import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Vehicle, Route, StudentTransport } from '../../types';
import { transportService } from '../../services/transportService';
import { mockStudents } from '../../data/mockData';
import { Plus, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TransportViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const TransportView: React.FC<TransportViewProps> = ({ onShowToast }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<StudentTransport[]>([]);
  
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'vehicles' | 'assignments'>('routes');

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);

  // Vehicle Form
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState<'Bus' | 'Mini Bus' | 'Van'>('Bus');
  const [capacity, setCapacity] = useState(40);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // Route Form
  const [routeName, setRouteName] = useState('');
  const [routeAssignedVehicle, setRouteAssignedVehicle] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(120);
  const [routeStops, setRouteStops] = useState('');

  // Assignment Form
  const [selectedStudentId, setSelectedStudentId] = useState(mockStudents[0].id);
  const [selectedRouteName, setSelectedRouteName] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const v = await transportService.getVehicles();
    const r = await transportService.getRoutes();
    const a = await transportService.getAssignments();
    setVehicles(v);
    setRoutes(r);
    setAssignments(a);
    if (r.length > 0) setSelectedRouteName(r[0].route_name);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo || !driverName) return;
    await transportService.addVehicle({
      vehicle_number: vehicleNo,
      type: vehicleType,
      capacity: Number(capacity),
      driver_name: driverName,
      driver_phone: driverPhone,
      status: 'Active'
    });
    onShowToast('Vehicle Added', `Added vehicle ${vehicleNo}`, 'success');
    setIsAddVehicleOpen(false);
    loadData();
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName) return;
    await transportService.addRoute({
      route_name: routeName,
      assigned_vehicle: routeAssignedVehicle,
      monthly_fee: Number(monthlyFee),
      stops: routeStops.split(',').map(s => s.trim()).filter(s => s)
    });
    onShowToast('Route Created', `Added bus route "${routeName}"`, 'success');
    setIsAddRouteOpen(false);
    loadData();
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = mockStudents.find(s => s.id === selectedStudentId);
    if (!student || !selectedRouteName) return;

    try {
      await transportService.assignStudent({
        student_id: student.id,
        student_name: student.full_name,
        class_name: `${student.class_name}-${student.section_name}`,
        route_name: selectedRouteName,
        vehicle_number: '', // will be mapped by service if needed or left blank
        pickup_point: pickupPoint,
        start_date: new Date().toISOString().split('T')[0],
        monthly_fee: routes.find(r => r.route_name === selectedRouteName)?.monthly_fee || 0,
        status: 'Active'
      });
      onShowToast('Student Assigned', `Assigned ${student.full_name} to route`, 'success');
      setIsAssignStudentOpen(false);
      loadData();
    } catch (error: any) {
      onShowToast('Assignment Failed', error.message, 'error');
    }
  };

  const vehicleColumns: Column<Vehicle>[] = [
    { header: 'Vehicle No', accessorKey: 'vehicle_number', cell: (row) => <span className="font-mono bg-amber-200 px-2 py-0.5 border border-slate-900 font-extrabold">{row.vehicle_number}</span> },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Capacity', accessorKey: 'capacity', cell: (row) => <span className="font-black">{row.capacity}</span> },
    { header: 'Driver Name', accessorKey: 'driver_name', cell: (row) => <span className="font-bold">{row.driver_name}</span> },
    { header: 'Phone', accessorKey: 'driver_phone' },
    { header: 'Status', accessorKey: 'status' }
  ];

  const routeColumns: Column<Route>[] = [
    { header: 'Route Name', accessorKey: 'route_name', cell: (row) => <span className="font-black text-slate-950">{row.route_name}</span> },
    { header: 'Vehicle', accessorKey: 'assigned_vehicle', cell: (row) => {
        const v = vehicles.find(vh => vh.id === row.assigned_vehicle);
        return <span className="font-mono bg-indigo-100 px-2 py-0.5 border border-slate-900 font-bold">{v ? v.vehicle_number : 'Unassigned'}</span>;
    } },
    { header: 'Monthly Fee', accessorKey: 'monthly_fee', cell: (row) => <span className="font-black text-emerald-800">${row.monthly_fee}</span> },
    { header: 'Students', accessorKey: 'route_name', cell: (row) => {
        const count = assignments.filter(a => a.route_name === row.route_name && a.status === 'Active').length;
        const v = vehicles.find(vh => vh.id === row.assigned_vehicle);
        const capacity = v ? v.capacity : 0;
        const isFull = capacity > 0 && count >= capacity;
        return <span className={`font-black ${isFull ? 'text-rose-600' : 'text-indigo-700'}`}>{count} / {capacity || '?'}</span>;
    } },
    { header: 'Stops', accessorKey: 'stops', cell: (row) => (
      <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] block">
        {row.stops && row.stops.length > 0 ? row.stops.join(' → ') : 'None'}
      </span>
    ) }
  ];

  const assignmentColumns: Column<StudentTransport>[] = [
    { header: 'Student', accessorKey: 'student_name', cell: (row) => <span className="font-bold">{row.student_name} ({row.class_name})</span> },
    { header: 'Route', accessorKey: 'route_name', cell: (row) => <span className="font-black text-slate-950">{row.route_name}</span> },
    { header: 'Pickup Point', accessorKey: 'pickup_point' },
    { header: 'Status', accessorKey: 'status' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="TRANSPORT MANAGEMENT"
        subtitle="School bus fleet, driver contact roster, route maps, and student transport assignments."
        breadcrumbItems={[{ label: 'Transport' }]}
        primaryAction={{
          label: 'ASSIGN STUDENT',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsAssignStudentOpen(true)
        }}
        secondaryAction={{
          label: 'ADD ROUTE',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsAddRouteOpen(true)
        }}
      />

      <div className="flex justify-between items-center border-b-3 border-slate-900 gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
              activeSubTab === 'routes' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => setActiveSubTab('vehicles')}
            className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
              activeSubTab === 'vehicles' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-4 py-2 font-black text-xs border-t-2 border-x-2 border-slate-900 uppercase ${
              activeSubTab === 'assignments' ? 'bg-indigo-600 text-white -mb-[2px]' : 'bg-white text-slate-900 hover:bg-amber-100'
            }`}
          >
            Student Assignments
          </button>
        </div>
        
        {activeSubTab === 'vehicles' && (
           <button onClick={() => setIsAddVehicleOpen(true)} className="px-3 py-1 bg-amber-300 border-2 border-slate-900 text-xs font-black uppercase mb-1">
             + ADD VEHICLE
           </button>
        )}
      </div>

      {activeSubTab === 'routes' && (
        <DataTable<Route>
          data={routes}
          columns={routeColumns}
          searchPlaceholder="Search routes..."
          keyExtractor={(item) => item.id}
          pageSize={10}
        />
      )}

      {activeSubTab === 'vehicles' && (
        <DataTable<Vehicle>
          data={vehicles}
          columns={vehicleColumns}
          searchPlaceholder="Search vehicles..."
          keyExtractor={(item) => item.id}
          pageSize={10}
        />
      )}

      {activeSubTab === 'assignments' && (
        <DataTable<StudentTransport>
          data={assignments}
          columns={assignmentColumns}
          searchPlaceholder="Search student assignments..."
          keyExtractor={(item) => item.id}
          pageSize={10}
        />
      )}

      {/* ADD ROUTE MODAL */}
      <Modal isOpen={isAddRouteOpen} onClose={() => setIsAddRouteOpen(false)} title="REGISTER BUS ROUTE">
        <form onSubmit={handleAddRoute} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">ROUTE NAME *</label>
            <input type="text" required value={routeName} onChange={(e) => setRouteName(e.target.value)} placeholder="e.g. Route 5 - East Extension" className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">ASSIGN VEHICLE</label>
              <select value={routeAssignedVehicle} onChange={(e) => setRouteAssignedVehicle(e.target.value)} className="w-full p-2 border-2 border-slate-900 font-mono">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} (Cap: {v.capacity})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">MONTHLY FEE ($)</label>
              <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} className="w-full p-2 border-2 border-slate-900" />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">ORDERED STOPS (Comma separated)</label>
            <input type="text" value={routeStops} onChange={(e) => setRouteStops(e.target.value)} placeholder="e.g. North Gate, Main St, Central Plaza" className="w-full p-2 border-2 border-slate-900" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button type="button" onClick={() => setIsAddRouteOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">CREATE ROUTE</button>
          </div>
        </form>
      </Modal>

      {/* ADD VEHICLE MODAL */}
      <Modal isOpen={isAddVehicleOpen} onClose={() => setIsAddVehicleOpen(false)} title="REGISTER VEHICLE">
        <form onSubmit={handleAddVehicle} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">VEHICLE NO *</label>
              <input type="text" required value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="e.g. BUS-01" className="w-full p-2 border-2 border-slate-900" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">TYPE</label>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as any)} className="w-full p-2 border-2 border-slate-900">
                <option value="Bus">Bus</option>
                <option value="Mini Bus">Mini Bus</option>
                <option value="Van">Van</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">DRIVER NAME *</label>
              <input type="text" required value={driverName} onChange={(e) => setDriverName(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">CAPACITY</label>
              <input type="number" required value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full p-2 border-2 border-slate-900" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button type="button" onClick={() => setIsAddVehicleOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">REGISTER</button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN STUDENT MODAL */}
      <Modal isOpen={isAssignStudentOpen} onClose={() => setIsAssignStudentOpen(false)} title="ASSIGN STUDENT TO ROUTE">
        <form onSubmit={handleAssignStudent} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">SELECT STUDENT *</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full p-2 border-2 border-slate-900">
              {mockStudents.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">SELECT ROUTE *</label>
            <select value={selectedRouteName} onChange={(e) => {
              setSelectedRouteName(e.target.value);
              const r = routes.find(rt => rt.route_name === e.target.value);
              if (r && r.stops && r.stops.length > 0) {
                setPickupPoint(r.stops[0]);
              } else {
                setPickupPoint('');
              }
            }} className="w-full p-2 border-2 border-slate-900">
              {routes.map(r => <option key={r.id} value={r.route_name}>{r.route_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 mb-1">PICKUP POINT</label>
            {routes.find(r => r.route_name === selectedRouteName)?.stops?.length ? (
              <select value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className="w-full p-2 border-2 border-slate-900">
                {routes.find(r => r.route_name === selectedRouteName)!.stops!.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input type="text" required value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className="w-full p-2 border-2 border-slate-900" />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button type="button" onClick={() => setIsAssignStudentOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 font-black uppercase">ASSIGN</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
