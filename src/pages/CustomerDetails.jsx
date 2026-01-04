import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import Loader from '../components/Loader';


export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Loading states for actions
  const [submittingInteraction, setSubmittingInteraction] = useState(false);
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Interaction form state
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState('Note');
  const [interactionDate, setInteractionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Follow-up form state
  const [followups, setFollowups] = useState([]);
  const [followupDate, setFollowupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [followupAction, setFollowupAction] = useState('');

  useEffect(() => {
    fetchCustomer();
    fetchInteractions();
    fetchFollowups();
  }, [id]);

  /* ---------------- CUSTOMER ---------------- */

  const fetchCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCustomer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setCustomer({ ...customer, status });
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------------- INTERACTIONS ---------------- */

  const fetchInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('customer_id', id)
        .order('date', { ascending: false });

      if (error) throw error;
      setInteractions(data || []);
    } catch (err) {
      console.error('Fetch interactions failed:', err.message);
    }
  };

  const addInteraction = async (e) => {
    e.preventDefault();
    setActionError(null);
    if (!newNote.trim()) return;

    setSubmittingInteraction(true);
    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([
          {
            customer_id: id,
            type: interactionType,
            notes: newNote.trim(),
            date: interactionDate
          }
        ])
        .select();

      if (error) throw error;

      setInteractions([data[0], ...interactions]);
      setNewNote('');
      setInteractionType('Note');
      setInteractionDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
      setActionError('Could not add interaction. Please try again.');
    } finally {
      setSubmittingInteraction(false);
    }
  };

  /* ---------------- FOLLOW UPS ---------------- */

  const fetchFollowups = async () => {
    try {
      const { data, error } = await supabase
        .from('followups')
        .select('*')
        .eq('customer_id', id)
        .order('followup_date', { ascending: true });

      if (error) throw error;
      setFollowups(data || []);
    } catch (err) {
      console.error('Fetch followups failed:', err.message);
    }
  };

  const addFollowup = async (e) => {
    e.preventDefault();
    setActionError(null);
    if (!followupAction.trim()) return;

    setSubmittingFollowup(true);
    try {
      const { data, error } = await supabase
        .from('followups')
        .insert([
          {
            customer_id: id,
            followup_date: followupDate,
            action: followupAction.trim()
          }
        ])
        .select();

      if (error) throw error;

      setFollowups([...followups, data[0]]);
      setFollowupAction('');
      setFollowupDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
      setActionError('Could not add follow-up.');
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const markFollowupComplete = async (followupId) => {
    setActionError(null);
    try {
      const { error } = await supabase
        .from('followups')
        .update({ completed: true })
        .eq('id', followupId);

      if (error) throw error;

      setFollowups(followups.map(f => 
        f.id === followupId ? { ...f, completed: true } : f
      ));
    } catch (err) {
      console.error(err);
      setActionError('Could not mark as completed.');
    }
  };

  /* ---------------- UI HELPERS ---------------- */

  const getBadgeClass = (type) => {
    const base = "px-2 py-1 rounded text-xs font-bold uppercase border";
    switch (type) {
      case 'Call':
        return `${base} bg-blue-500/20 text-blue-400 border-blue-500/30`;
      case 'Email':
        return `${base} bg-emerald-500/20 text-emerald-400 border-emerald-500/30`;
      case 'Meeting':
        return `${base} bg-amber-500/20 text-amber-400 border-amber-500/30`;
      default:
        return `${base} bg-slate-500/20 text-slate-400 border-slate-500/30`;
    }
  };

  /* ---------------- UI ---------------- */

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (!customer) {
    return (
      <div className="text-white text-center p-8">
        Customer not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
      <button 
        onClick={() => navigate('/customers')} 
        className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors text-sm font-medium" 
      >
        ← Back to Customers
      </button>

      {actionError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-sm">{actionError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CUSTOMER INFO CARD */}
        <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl h-fit">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{customer.name}</h1>
            <p className="text-slate-400 text-sm">
              ID: {customer.id.slice(0, 8)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-slate-400">Status</span>
              <select
                className="bg-slate-900/50 border border-slate-600 text-white text-sm rounded px-3 py-1 outline-none focus:border-indigo-500 cursor-pointer"
                value={customer.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-slate-400">Email</span>
              <span className="text-white font-medium">{customer.email}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-slate-400">Phone</span>
              <span className="text-white font-medium">{customer.phone || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-slate-400">Member Since</span>
              <span className="text-white font-medium">{new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* INTERACTIONS CARD */}
        <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Log Interaction</h2>

          <form onSubmit={addInteraction} className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="mb-0">
                <label className="block text-slate-400 text-xs font-medium mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value)}
                >
                  <option value="Note">Note</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>

              <div className="mb-0">
                <label className="block text-slate-400 text-xs font-medium mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={interactionDate}
                  onChange={(e) => setInteractionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <textarea
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-y"
                placeholder="Write clear, concise notes..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>

            <button 
              className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
              type="submit"
              disabled={!newNote.trim() || submittingInteraction}
            >
              {submittingInteraction ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Interaction'}
            </button>
          </form>

          <div className="flex items-center justify-between mb-4">
             <h3 className="text-white font-medium">Timeline</h3>
             <span className="text-xs text-slate-400">{interactions.length} entries</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {interactions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm">
                <p className="empty-state">No interactions logged yet.</p>
              </div>
            ) : (
              interactions.map((i) => (
                <div key={i.id} className="bg-slate-900/30 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className={getBadgeClass(i.type)}>
                      {i.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(i.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {i.notes}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOLLOW UPS CARD */}
        <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Upcoming Follow-ups</h2>

          <form onSubmit={addFollowup} className="mb-8">
            <div className="mb-4">
              <label className="block text-slate-400 text-xs font-medium mb-2">Details</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Call to check in..."
                value={followupAction}
                onChange={(e) => setFollowupAction(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-400 text-xs font-medium mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
              />
            </div>

            <button 
              className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
              type="submit"
              disabled={!followupAction.trim() || submittingFollowup}
            >
              {submittingFollowup ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Set Follow-up'}
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {followups.length === 0 ? (
               <div className="p-6 text-center border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm">
                <p className="empty-state">No follow-ups scheduled.</p>
              </div>
            ) : (
              followups.map((f) => (
                <div key={f.id} className={`bg-slate-900/30 border border-white/5 rounded-lg p-4 transition-opacity ${f.completed ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <p className={`text-white text-sm ${f.completed ? 'line-through' : ''}`}>
                        {f.action}
                      </p>
                      {!f.completed && (
                        <button 
                          onClick={() => markFollowupComplete(f.id)}
                          className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-2 py-1 rounded text-xs ml-2 whitespace-nowrap transition-colors"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Due: {new Date(f.followup_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
