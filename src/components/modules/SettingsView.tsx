import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { School, User, Lock, Palette, Save, AlertTriangle, Database } from 'lucide-react';
import { settingsService, SchoolSettings } from '../../services/settingsService';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'school' | 'appearance' | 'data'>('school');
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    setSettings(settingsService.getSettings());
  }, []);

  const handleChange = (key: keyof SchoolSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await settingsService.saveSettings(settings);
      onShowToast('Settings Saved', 'Configuration updated successfully', 'success');
      // trigger page reload to propagate settings across memory if needed, or simply let react handle it if we used context
      // for now, we just update local state
    } catch (err: any) {
      onShowToast('Save Failed', err.message, 'error');
    }
  };

  const handleResetData = async () => {
    try {
      await settingsService.resetDemoData();
      onShowToast('Data Reset', 'All demo data has been restored to factory defaults.', 'success');
      setIsResetModalOpen(false);
      window.location.reload(); // Force full reload to reset all memory stores
    } catch (err: any) {
      onShowToast('Reset Failed', err.message, 'error');
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SYSTEM SETTINGS & CONFIGURATION"
        subtitle="Manage school institutional profile, academic session calendar, display preferences, and demo data."
        breadcrumbItems={[{ label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SETTINGS NAV SIDEBAR */}
        <div className="bg-white border-3 border-slate-900 brutal-shadow p-3 space-y-1 h-fit">
          {[
            { id: 'school', label: 'School Profile', icon: School },
            { id: 'appearance', label: 'Preferences', icon: Palette },
            { id: 'data', label: 'Data Management', icon: Database },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-3 p-2.5 text-xs font-black uppercase border-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-slate-900 brutal-shadow-sm'
                    : 'bg-white text-slate-900 border-transparent hover:border-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* SETTINGS PANEL CONTENT */}
        <div className="md:col-span-3 bg-white border-3 border-slate-900 brutal-shadow p-6">
          {activeTab === 'school' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
              <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2">
                INSTITUTIONAL PROFILE & CALENDAR
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">SCHOOL NAME *</label>
                  <input
                    type="text"
                    required
                    value={settings.school_name}
                    onChange={(e) => handleChange('school_name', e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">ACADEMIC YEAR</label>
                  <input
                    type="text"
                    required
                    value={settings.academic_year}
                    onChange={(e) => handleChange('academic_year', e.target.value)}
                    placeholder="e.g. 2026-2027"
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">YEAR START DATE</label>
                  <input
                    type="date"
                    required
                    value={settings.academic_year_start}
                    onChange={(e) => handleChange('academic_year_start', e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">YEAR END DATE</label>
                  <input
                    type="date"
                    required
                    value={settings.academic_year_end}
                    onChange={(e) => handleChange('academic_year_end', e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">OFFICIAL EMAIL</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full p-2 bg-white border-2 border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">CAMPUS ADDRESS</label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-2 bg-white border-2 border-slate-900 font-medium"
                />
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 brutal-shadow-indigo font-black flex items-center gap-2 uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE CONFIGURATION</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
              <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2">
                DISPLAY PREFERENCES
              </h3>
              <div>
                <label className="block text-slate-700 mb-1">DATA TABLE DENSITY</label>
                <select
                  value={settings.display_density}
                  onChange={(e) => handleChange('display_density', e.target.value)}
                  className="w-full p-2 bg-white border-2 border-slate-900"
                >
                  <option value="Comfortable">Comfortable (More Padding)</option>
                  <option value="Compact">Compact (Fit More Data)</option>
                </select>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white border-2 border-slate-900 brutal-shadow-indigo font-black flex items-center gap-2 uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE PREFERENCES</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4 text-xs font-bold">
              <h3 className="text-base font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                DANGER ZONE: DATA MANAGEMENT
              </h3>
              <p className="text-slate-600">
                This action will wipe all custom entries (students, attendance, grades, events, library issues) stored in your local browser storage and revert the application strictly to its original mock demo data. 
              </p>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-5 py-2 bg-rose-600 text-white border-2 border-slate-900 brutal-shadow-sm font-black uppercase"
              >
                RESET DEMO DATA TO FACTORY DEFAULTS
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="CONFIRM DATA RESET">
        <div className="space-y-4 text-xs font-bold p-1">
          <div className="p-4 bg-rose-100 border-2 border-rose-900 text-rose-900 flex gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>
              Are you absolutely sure you want to reset all data? 
              This will permanently delete all records you have created locally during this session.
              This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t-2 border-slate-900 mt-4">
            <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-4 py-2 bg-slate-200 border-2 border-slate-900 font-bold">CANCEL</button>
            <button type="button" onClick={handleResetData} className="px-5 py-2 bg-rose-600 text-white border-2 border-slate-900 font-black uppercase">YES, RESET ALL DATA</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
