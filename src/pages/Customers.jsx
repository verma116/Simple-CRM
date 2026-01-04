import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

export default function Customers() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white font-medium transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/add-customer')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg" 
          >
            Add Customer
          </button>
          <button 
            onClick={handleLogout} 
            className="text-red-500 hover:text-red-400 font-medium transition-colors ml-2" 
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full max-w-md px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all backdrop-blur-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-sm">{error}</div>}

      {loading ? (
        <Loader />
      ) : (filteredCustomers.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-lg empty-state">
                {customers.length === 0 ? "No customers added yet." : "No matches found."}
            </p>
        </div>
      ) : (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">Name</th>
                  <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">Email</th>
                  <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">Status</th>
                  <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-slate-400">{customer.email}</td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-slate-900/50 border border-slate-600 text-white text-sm rounded px-3 py-1 outline-none focus:border-indigo-500 cursor-pointer"
                        value={customer.status}
                        onChange={(e) => updateStatus(customer.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          onClick={() => navigate(`/customer/${customer.id}`)}
                      >
                          View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
