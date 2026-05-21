import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken, logout as googleLogout } from '../lib/googleAuth';

interface Event {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function AdminCalendarView() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchEvents = async () => {
    if (!token) return;
    setIsLoadingEvents(true);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.items || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newEventTitle || !newEventDate) return;
    setIsCreating(true);

    const event = {
      summary: newEventTitle,
      start: {
        dateTime: new Date(newEventDate).toISOString(),
      },
      end: {
        dateTime: new Date(new Date(newEventDate).getTime() + 60 * 60 * 1000).toISOString(),
      },
    };

    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!res.ok) throw new Error('Failed to create event');
      
      setNewEventTitle('');
      setNewEventDate('');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!token) return;
    
    // Explicit confirmation required by guidelines
    const confirmed = window.confirm(`Are you sure you want to delete the calendar event "${title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete event');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (needsAuth || !token) {
    return (
      <div className="bg-brand-white border border-brand-border rounded-xl p-8 flex flex-col items-center text-center shadow-sm max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <CalendarIcon size={32} />
        </div>
        <h3 className="font-serif text-2xl text-brand-dark mb-3">Connect Google Calendar</h3>
        <p className="text-brand-muted text-sm mb-8 leading-relaxed max-w-sm">
          Sign in with your Google Workspace account to securely manage Rawda Fragrance events, meetings, and schedules.
        </p>
        
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="border border-[#dadce0] rounded-md px-4 py-2 hover:bg-[#f8fafa] flex items-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          <span className="font-roboto font-medium text-[#3c4043] tracking-wide text-sm">{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-white border border-brand-border rounded-xl shadow-sm mt-8 max-w-4xl mx-auto overflow-hidden">
      <div className="p-6 md:p-8 border-b border-brand-border flex items-center justify-between">
        <div>
          <h3 className="font-serif text-2xl text-brand-dark flex items-center gap-2">
            <CalendarIcon className="text-blue-500" /> Administrative Calendar
          </h3>
          <p className="text-sm text-brand-muted font-medium mt-1">Logged in as {user?.email}</p>
        </div>
        <button 
          onClick={googleLogout}
          className="text-xs uppercase tracking-widest text-red-500 hover:text-red-600 font-bold px-3 py-1.5 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors rounded-full"
        >
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Left Column - Create Event */}
        <div className="p-6 md:p-8 md:col-span-1 bg-gray-50/50">
          <h4 className="font-bold text-sm tracking-widest uppercase text-brand-dark mb-6 flex items-center gap-2">
            <PlusCircle size={16} className="text-[#0A996F]"/> Create Event
          </h4>
          <form className="space-y-4" onSubmit={handleCreateEvent}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Event Title</label>
              <input 
                type="text" 
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                placeholder="Product Launch, Meeting..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Date & Time</label>
              <input 
                type="datetime-local" 
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-brand-dark"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isCreating}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 px-4 text-[11px] uppercase tracking-widest font-bold transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {isCreating ? 'Adding Event...' : 'Add to Calendar'}
            </button>
          </form>
        </div>

        {/* Right Column - Events List */}
        <div className="p-6 md:p-8 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-sm tracking-widest uppercase text-brand-dark">Upcoming Events</h4>
            <button onClick={fetchEvents} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Refresh">
              <RefreshCw size={14} className={isLoadingEvents ? 'animate-spin text-blue-500' : ''} />
            </button>
          </div>

          <div className="space-y-4">
            {isLoadingEvents && events.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-border border-t-blue-500 mb-3"></div>
                <p className="text-sm text-brand-muted font-medium">Syncing with Google Calendar...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                <CalendarIcon size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No upcoming events scheduled</p>
                <p className="text-xs text-gray-400 mt-1">Events from your primary calendar will appear here.</p>
              </div>
            ) : (
              events.map((event) => {
                const dateRaw = event.start.dateTime || event.start.date || '';
                const dateObj = new Date(dateRaw);
                const isAllDay = !event.start.dateTime;
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl flex flex-col items-center justify-center min-w-[50px]">
                        <span className="text-xs font-bold uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-bold leading-none">{dateObj.getDate()}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-brand-dark mb-1">{event.summary || '(No title)'}</h5>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <Clock size={10} />
                          {isAllDay ? 'All Day' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteEvent(event.id, event.summary || 'Untitled')}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
