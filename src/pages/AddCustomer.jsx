import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New' 
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            status: formData.status,
            user_id: user.id
          }
        ]);

      if (insertError) throw insertError;

      navigate('/customers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Add New Customer</h2>
          <p className="text-slate-400 text-sm">Enter the customer's details below</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-2" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="John Doe"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-2" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-2" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className="w-full py-3 px-4 bg-transparent border border-slate-600 hover:bg-white/5 text-white font-semibold rounded-lg transition-colors"
              onClick={() => navigate('/customers')}
            >
              Cancel
            </button>
            <button type="submit" className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
