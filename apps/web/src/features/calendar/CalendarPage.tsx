import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { calendarService } from '../../services/dataService';
import { Plus, ChevronLeft, ChevronRight, Video, Calendar, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('meeting');
  const [location, setLocation] = useState('');

  const fetchEvents = async () => {
    try {
      const data = await calendarService.getAll();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await calendarService.create({
        title,
        description,
        start,
        end,
        allDay: false,
        type: type as any,
        color: type === 'meeting' ? '#2563eb' : '#ef4444',
        attendees: [],
        location,
        createdBy: '1',
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Event scheduled successfully!');
      setIsAddOpen(false);
      fetchEvents();
      setTitle('');
      setDescription('');
      setStart('');
      setEnd('');
      setLocation('');
    } catch (error) {
      toast.error('Failed to schedule event.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <PageHeader
        title="Calendar"
        description="Schedule meetings, events, project deadlines, and standups"
        actions={
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Schedule Event
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Upcoming Events</h3>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {events.map((ev) => (
                <Card key={ev.id} hoverEffect className="flex items-center justify-between p-5 border-l-4" style={{ borderLeftColor: ev.color }}>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 font-bold">
                      {ev.type === 'meeting' ? <Video className="h-5 w-5 text-primary-500" /> : <Bell className="h-5 w-5 text-rose-500" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{ev.title}</span>
                      <p className="text-xs text-slate-500">{ev.description}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(ev.start).toLocaleString()}</span>
                    </div>
                  </div>
                  {ev.location && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                      {ev.location}
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Mini Info Panel */}
          <Card className="h-fit">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider mb-4">Calendar Guide</h3>
            <ul className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Meetings & standups</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Invoice deadlines</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Team events</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-purple-750" /> Client demonstrations</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Schedule Event Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Event" size="lg">
        <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
          <Input label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Project Demo" required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="datetime-local" label="Start Time" value={start} onChange={(e) => setStart(e.target.value)} required />
            <Input type="datetime-local" label="End Time" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Google Meet, Room A" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none text-slate-900 dark:text-slate-100 focus:border-primary-500"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Reminder</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
