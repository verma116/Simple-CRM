import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loader from "../components/Loader";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    openFollowups: 0,
    todayFollowupsCount: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Total Customers
      const { count: customerCount, error: customerError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      if (customerError) throw customerError;

      // 2. Open Follow-ups
      const { count: openCount, error: openError } = await supabase
        .from("followups")
        .select("*", { count: "exact", head: true })
        .eq("completed", false);

      if (openError) throw openError;

      // 3. Today's Follow-ups
      const { data: todayData, error: todayError } = await supabase
        .from("followups")
        .select(
          `
          *,
          customers (name)
        `
        )
        .eq("followup_date", today)
        .eq("completed", false);

      if (todayError) throw todayError;

      // 4. Upcoming Follow-ups (All open tasks ordered by date)
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("followups")
        .select("*, customers(name)")
        .eq("completed", false)
        .order("followup_date");

      if (upcomingError) throw upcomingError;

      setStats({
        totalCustomers: customerCount || 0,
        openFollowups: openCount || 0,
        todayFollowupsCount: todayData ? todayData.length : 0,
      });

      setTodayTasks(todayData || []);
      setUpcomingTasks(upcomingData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      setError('Something went wrong loading your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getStatusBadge = (date) => {
    const today = new Date().toISOString().split("T")[0];
    if (date < today)
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
          Overdue
        </span>
      );
    if (date === today)
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Due Today
        </span>
      );
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold uppercase bg-gray-500/20 text-gray-400 border border-gray-500/30">
        Upcoming
      </span>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="signup-container p-8 block">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-3xl font-bold m-0">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/customers")}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Customers
          </button>
          <button
            onClick={handleLogout}
            className="btn-text text-red-500 hover:text-red-400">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-sm text-center">{error}</div>}

      {/* SUMMARY CARDS */}
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1 */}
        <div
          onClick={() => navigate("/customers")}
          className="signup-card text-center p-8 cursor-pointer transform hover:scale-105 transition-transform duration-200">
          <h3 className="text-slate-400 text-sm mb-2 uppercase tracking-widest">
            Total Customers
          </h3>
          <p className="text-white text-5xl font-bold m-0">
            {stats.totalCustomers}
          </p>
        </div>

        {/* Card 2 */}
        <div className="signup-card text-center p-8">
          <h3 className="text-slate-400 text-sm mb-2 uppercase tracking-widest">
            Open Follow-ups
          </h3>
          <p className="text-indigo-400 text-5xl font-bold m-0">
            {stats.openFollowups}
          </p>
        </div>

        {/* Card 3 */}
        <div className="signup-card text-center p-8">
          <h3 className="text-slate-400 text-sm mb-2 uppercase tracking-widest">
            Due Today
          </h3>
          <p className="text-emerald-400 text-5xl font-bold m-0">
            {stats.todayFollowupsCount}
          </p>
        </div>
      </div>

      {/* TODAY'S AGENDA */}
      <h2 className="text-white text-xl font-semibold mb-6">
        Today's Agenda
      </h2>
      {todayTasks.length > 0 ? (
        <div className="grid gap-4 mb-12">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-800/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex justify-between items-center shadow-xl">
              <div>
                <p className="text-white text-lg mb-2">{task.action}</p>
                <div className="flex gap-4 text-slate-400 text-sm">
                  <span>
                    Customer:{" "}
                    <strong className="text-slate-200">
                      {task.customers?.name || "Unknown"}
                    </strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/customer/${task.customer_id}`)}
                className="w-auto px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors">
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12 text-center">
            <p className="text-slate-400 text-lg">No follow-ups due today. Great job!</p>
        </div>
      )}

      {/* UPCOMING / ALL PENDING TASKS */}
      <h2 className="text-white text-xl font-semibold mb-6">
        Upcoming Follow-ups
      </h2>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">
                  Status
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">
                  Date
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">
                  Customer
                </th>
                <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider border-b border-white/10">
                  Action
                </th>
                <th className="px-6 py-4 border-b border-white/10"></th>
              </tr>
            </thead>
            <tbody>
              {upcomingTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-slate-400 border-none">
                    <p className="text-lg">No upcoming follow-ups found.</p>
                    <p className="text-sm text-slate-500 mt-2">Schedule tasks in customer details to see them here.</p>
                  </td>
                </tr>
              ) : (
                upcomingTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 align-middle">
                      {getStatusBadge(task.followup_date)}
                    </td>
                    <td className="px-6 py-4 align-middle text-slate-400">
                      {new Date(task.followup_date).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle text-white font-medium">
                      {task.customers?.name}
                    </td>
                    <td className="px-6 py-4 align-middle text-slate-400">
                      {task.action}
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <button
                        onClick={() =>
                          navigate(`/customer/${task.customer_id}`)
                        }
                        className="bg-transparent border border-slate-600 text-white px-3 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
