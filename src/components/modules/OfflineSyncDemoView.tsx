import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { WifiOff, Wifi, AlertTriangle, CheckCircle2, RotateCcw, XCircle, ArrowRight } from 'lucide-react';

interface QueuedOperation {
  id: string;
  recordId: string;
  type: 'ATTENDANCE_UPDATE';
  studentName: string;
  localValue: string;
  serverValue?: string;
  status: 'PENDING' | 'CONFLICT' | 'RESOLVED' | 'FAILED';
  version: number;
}

export const OfflineSyncDemoView: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [queue, setQueue] = useState<QueuedOperation[]>([
    {
      id: 'op-101',
      recordId: 'att-551',
      type: 'ATTENDANCE_UPDATE',
      studentName: 'Isaac Ibrahim',
      localValue: 'Absent',
      status: 'PENDING',
      version: 1
    }
  ]);
  const [serverDemoVersion, setServerDemoVersion] = useState(2); // Simulated server version is ahead

  const handleToggleConnection = () => {
    setIsOnline(!isOnline);
  };

  const handleSync = () => {
    if (!isOnline) return;

    // Simulate Sync Process
    setQueue(prev => prev.map(op => {
      if (op.status === 'RESOLVED') return op;
      
      // Simulate version mismatch conflict
      if (op.version < serverDemoVersion) {
        return {
          ...op,
          status: 'CONFLICT',
          serverValue: 'Late (Excused)' // Simulated value on server
        };
      }
      
      return {
        ...op,
        status: 'RESOLVED',
        serverValue: op.localValue
      };
    }));
  };

  const handleDiscardLocal = (opId: string) => {
    setQueue(prev => prev.filter(op => op.id !== opId));
  };

  const handleResubmit = (opId: string) => {
    setQueue(prev => prev.map(op => {
      if (op.id === opId) {
        // We update our local version to match the server to resolve it, 
        // OR simulate a second conflict if we want
        return {
          ...op,
          status: 'PENDING',
          version: serverDemoVersion // Catching up to server version
        };
      }
      return op;
    }));
  };

  const handleSimulateSecondConflict = () => {
    // If the record changes again on the server before resubmitting
    setServerDemoVersion(v => v + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="OFFLINE SYNC DEMO"
        subtitle="Simulated demonstration of conflict resolution when syncing offline drafts."
        breadcrumbItems={[{ label: 'Sync Simulation' }]}
        primaryAction={{
          label: isOnline ? 'GO OFFLINE' : 'GO ONLINE',
          icon: isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />,
          onClick: handleToggleConnection
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Status Panel */}
        <div className="p-5 bg-white border-4 border-slate-900 brutal-shadow">
          <h3 className="text-sm font-black uppercase border-b-2 border-slate-900 pb-2 mb-4">Simulated Network</h3>
          <div className={`p-4 flex flex-col items-center justify-center gap-2 border-2 border-slate-900 ${isOnline ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
            {isOnline ? <Wifi className="w-8 h-8" /> : <WifiOff className="w-8 h-8" />}
            <span className="text-lg font-black uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-4 text-center">
            {isOnline ? 'Connected to simulated server. You can attempt a sync.' : 'Disconnected. Operations are queued locally in browser storage.'}
          </p>
          
          <button
            disabled={!isOnline || queue.length === 0}
            onClick={handleSync}
            className="w-full mt-4 py-3 bg-indigo-600 text-white font-black uppercase tracking-wider border-2 border-slate-900 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed brutal-shadow-sm"
          >
            START SYNC
          </button>
        </div>

        {/* Sync Queue Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2">
            <h3 className="text-sm font-black uppercase">Local Queue</h3>
            <button onClick={handleSimulateSecondConflict} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">
              Trigger Server Change (Version++)
            </button>
          </div>

          {queue.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 text-slate-500 font-bold uppercase tracking-wider">
              No pending operations
            </div>
          )}

          {queue.map(op => (
            <div key={op.id} className="bg-white border-2 border-slate-900 brutal-shadow-sm flex flex-col">
              <div className="p-3 border-b-2 border-slate-900 bg-slate-50 flex justify-between items-center">
                <div className="flex gap-2 items-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span className="bg-slate-200 px-2 py-1 border border-slate-900">OP: {op.id}</span>
                  <span>{op.type}</span>
                </div>
                <div className="flex gap-2 items-center text-[10px] font-black uppercase">
                  <span className="text-slate-500">Local V{op.version}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-indigo-600">Server V{serverDemoVersion}</span>
                </div>
              </div>

              <div className="p-4">
                <p className="font-bold text-slate-900 mb-4">Record: {op.studentName} ({op.recordId})</p>
                
                {op.status === 'PENDING' && (
                  <div className="flex gap-2 items-center text-amber-600 bg-amber-50 p-2 border border-amber-200 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Waiting to sync: "{op.localValue}"
                  </div>
                )}

                {op.status === 'RESOLVED' && (
                  <div className="flex gap-2 items-center text-emerald-700 bg-emerald-50 p-2 border border-emerald-200 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Successfully Synced
                  </div>
                )}

                {op.status === 'CONFLICT' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center text-rose-700 bg-rose-50 p-2 border border-rose-200 font-bold text-sm">
                      <XCircle className="w-4 h-4" />
                      VERSION CONFLICT DETECTED
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border-2 border-slate-900 bg-slate-50">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Your Local Draft (V{op.version})</span>
                        <span className="font-black text-rose-900">{op.localValue}</span>
                      </div>
                      <div className="p-3 border-2 border-indigo-900 bg-indigo-50">
                        <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-1">Latest Server Data (V{serverDemoVersion})</span>
                        <span className="font-black text-indigo-900">{op.serverValue}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => handleResubmit(op.id)}
                        className="flex-1 py-2 bg-amber-300 text-slate-900 font-black uppercase text-xs border-2 border-slate-900 hover:bg-amber-400 brutal-shadow-sm flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Update to V{serverDemoVersion} & Retry
                      </button>
                      <button 
                        onClick={() => handleDiscardLocal(op.id)}
                        className="px-4 py-2 bg-slate-100 text-slate-900 font-bold uppercase text-xs border-2 border-slate-900 hover:bg-slate-200"
                      >
                        Discard Local
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
