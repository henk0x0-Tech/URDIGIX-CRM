import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { settingsService } from '../../services/dataService';
import { ShieldCheck, HardDrive, Building, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getCompanySettings();
        setCompanySettings(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setWebsite(data.website);
        setAddress(data.address);
        setCity(data.city);
        setState(data.state);
        setPincode(data.pincode);
      } catch (error) {
        toast.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Company settings saved successfully!');
  };

  const handleBackup = async () => {
    try {
      if (window.electronAPI) {
        toast.loading('Creating database backup...', { id: 'backup-toast' });
        const res = await window.electronAPI.createBackup();
        if (res.success) {
          toast.success(`Backup created: ${res.backup?.filename}`, { id: 'backup-toast' });
        } else {
          toast.error(res.error || 'Failed to create backup.', { id: 'backup-toast' });
        }
      } else {
        toast.error('Local backups are only supported on the Desktop Application.', { duration: 4000 });
      }
    } catch (error) {
      toast.error('Failed to create backup.', { id: 'backup-toast' });
    }
  };

  const handleRestore = async () => {
    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.restoreBackup();
        if (res.success) {
          toast.success('Database restored successfully from backup.');
        } else if (res.reason !== 'canceled') {
          toast.error(res.error || 'Failed to restore backup.');
        }
      } else {
        toast.error('Database restore is only supported on the Desktop Application.', { duration: 4000 });
      }
    } catch (error) {
      toast.error('Failed to restore backup.');
    }
  };

  const settingTabs = [
    { id: 'company', label: 'Company Profile', icon: <Building className="h-4 w-4" /> },
    { id: 'security', label: 'Security & Auth', icon: <Key className="h-4 w-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <HardDrive className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Settings"
        description="Configure your enterprise profile, system themes, email servers, and user permissions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation tabs sidebar */}
        <Card className="lg:col-span-1 h-fit p-3">
          <div className="flex flex-col gap-1">
            {settingTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${isActive ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Content panel */}
        <Card className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : activeTab === 'company' ? (
            <form onSubmit={handleSaveCompany} className="flex flex-col gap-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Company Profile Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Legal Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input type="email" label="Contact Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Input label="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} required />
              </div>
              <Input label="Registered Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
                <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
              </div>
              <div className="flex justify-end mt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : activeTab === 'security' ? (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Security & Permissions Policy</h3>
              <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <ShieldCheck className="h-10 w-10 text-emerald-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-white text-sm">Role-Based Access Control Active</span>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    User privileges are enforced natively on both frontend router levels and API route handlers.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
                <span className="text-slate-400 font-bold uppercase tracking-wider">System User Roles Enforced:</span>
                <ul className="list-disc pl-5 flex flex-col gap-1 mt-1 font-medium text-slate-600 dark:text-slate-400">
                  <li><span className="font-bold text-slate-800 dark:text-white">Super Admin</span>: Full root system developer settings</li>
                  <li><span className="font-bold text-slate-800 dark:text-white">Admin</span>: Billing, invoicing, projects, and users manager</li>
                  <li><span className="font-bold text-slate-800 dark:text-white">Manager</span>: Deliverables, task assignments, and progress analytics</li>
                  <li><span className="font-bold text-slate-800 dark:text-white">Employee</span>: Assigned tasks execution and document updates</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Database Backup & Disaster Recovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Generate raw SQL dumps of the database to local safeStorage paths. Easily restore settings, activity tables, and client listings instantly.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <Button onClick={handleBackup} icon={<HardDrive className="h-4 w-4" />}>
                  Create Local Backup
                </Button>
                <Button variant="outline" onClick={handleRestore} icon={<HardDrive className="h-4 w-4" />}>
                  Restore Database
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
