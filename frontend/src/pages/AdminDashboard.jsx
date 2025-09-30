
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminSummary,
  getAllComplaints,
  getAllUsers,
  getAdminUsersSummary,
  getUserDetails,
  getAdminVolunteers,
  assignComplaint,
  getAdminActivityLog,
  deleteComplaintByAdmin,
  getIssueTypeSummary,
  getComplaintPrioritySummary,
  getMonthlyComplaintSummary,
  getReportsSummary,
  getCategoryBreakdown,
  logReportDownload,
  exportExcelReport,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from "react-leaflet";
import { Eye, Shield, Trash2, Users, UserCheck, BarChart3, Download, FileText, CheckCircle } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "leaflet/dist/leaflet.css";
import "./AdminDashboard.css";


const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out?</p>
          <div className="modal-actions">
            <button className="btn-secondary modal-btn" onClick={onClose}>Cancel</button>
            <button className="btn-danger modal-btn" onClick={onConfirm}>Logout</button>
          </div>
        </div>
      </div>
    );
};

const issueTypeColors = {
 
  pothole: "#8B4513", 
  garbage_dump: "#FF4500", 
  water_leak: "#1E90FF",
  streetlight: "#FFD700", 
  broken_sidewalk: "#A0522D", 
  graffiti: "#800080",
  noise_pollution: "#FF1493", 
  other: "#32CD32",
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Overview page
  const [summary, setSummary] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [issueTypeData, setIssueTypeData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Users page
  const [usersSummary, setUsersSummary] = useState({});
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false);
  
  // Assign & Logout Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Reports & Analytics page
  const [reportsSummary, setReportsSummary] = useState({});
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchSummaryAndLog = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, logRes, issueTypeRes, priorityRes, monthlyRes] = await Promise.all([
        getAdminSummary(), getAdminActivityLog(), getIssueTypeSummary(), getComplaintPrioritySummary(), getMonthlyComplaintSummary()
      ]);
      setSummary(summaryRes.data);
      setActivityLog(logRes.data);
      setIssueTypeData(issueTypeRes.data);
      setPriorityData(priorityRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (err) { console.error("Failed to fetch dashboard data:", err); } 
    finally { setLoading(false); }
  }, []);
  
  const fetchComplaints = useCallback(async (status) => {
    setLoading(true);
    setData([]);
    try {
      const res = await getAllComplaints(status);
      setData(res.data);
    } catch (err) { console.error("Error fetching complaints:", err); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setData([]);
    try {
      const res = await getAllUsers();
      setData(res.data);
    } catch (err) { console.error("Error fetching user list:", err); }
    finally { setLoading(false); }
  }, []);

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    setData([]);
    try {
      const [summaryRes, breakdownRes, casesRes] = await Promise.all([
        getReportsSummary(), getCategoryBreakdown(), getAllComplaints("resolved")
      ]);
      setReportsSummary(summaryRes.data);
      setCategoryBreakdown(breakdownRes.data);
      setData(casesRes.data);
    } catch (err) { console.error("Error fetching reports data:", err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') { fetchSummaryAndLog(); } 
    else if (activeTab === 'map') { fetchComplaints("all"); } 
    else if (activeTab === 'users') { 
        fetchUsers(); 
        getAdminUsersSummary().then(res => setUsersSummary(res.data));
    } 
    else if (activeTab === 'reports') { fetchReportsData(); }
    else if (activeTab === 'manage') { fetchComplaints("all"); } 
    else if (activeTab === 'pending') { fetchComplaints("received"); } 
    else if (activeTab === 'resolved') { fetchComplaints("resolved"); }
    
  }, [activeTab, fetchSummaryAndLog, fetchComplaints, fetchUsers, fetchReportsData]);
  
  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint?")) return;
    try {
      await deleteComplaintByAdmin(complaintId);
      setData(prev => prev.filter(c => c._id !== complaintId));
      alert("Complaint deleted successfully.");
    } catch (err) { alert("Failed to delete complaint."); }
  };
  
  const handleAssignClick = (complaint) => {
    getAdminVolunteers()
      .then(res => setVolunteers(res.data || []))
      .catch(err => console.error("Error fetching volunteers:", err));
    setSelectedComplaint(complaint);
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedVolunteer) return alert("Please select a volunteer");
    try {
      await assignComplaint(selectedComplaint._id, selectedVolunteer);
      setShowAssignModal(false);
      setSelectedVolunteer("");
      if (activeTab === 'pending') fetchComplaints('received');
      else if (activeTab === 'manage') fetchComplaints('all');
    } catch (err) { console.error("Error assigning complaint:", err); }
  };
  
  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setIsUserDetailsLoading(true);
    setShowUserDetailsModal(true);
    try {
        const res = await getUserDetails(user._id);
        setSelectedUserDetails(res.data);
    } catch (err) { setSelectedUserDetails(null); } 
    finally { setIsUserDetailsLoading(false); }
  };

  const handleDownloadSingleReport = (caseData) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Completed Case Report", 14, 22);
    doc.setFontSize(12);
    let yPosition = 32;
    const addText = (label, value, y) => {
      doc.text(`${label}:`, 14, y);
      doc.text(value || 'N/A', 50, y);
      return y + 8;
    };
    yPosition = addText('Case ID', caseData._id.slice(-6).toUpperCase(), yPosition);
    yPosition = addText('Title', caseData.title, yPosition);
    yPosition = addText('Category', caseData.issueType, yPosition);
    yPosition = addText('Status', caseData.status, yPosition);
    yPosition = addText('Complainant', caseData.user_id?.name, yPosition);
    yPosition = addText('Completed By', caseData.assigned_to?.name, yPosition);
    yPosition = addText('Reported Date', new Date(caseData.createdAt).toLocaleDateString(), yPosition);
    yPosition = addText('Completed Date', new Date(caseData.updatedAt).toLocaleDateString(), yPosition);
    yPosition += 4;
    doc.text(`Description:`, 14, yPosition);
    yPosition += 6;
    const splitDescription = doc.splitTextToSize(caseData.description, 180);
    doc.text(splitDescription, 14, yPosition);
    doc.save(`case-report-${caseData._id.slice(-6).toUpperCase()}.pdf`);

    logReportDownload().catch(err => console.error("Could not log download:", err));
    fetchReportsData();
  };

  const handleDownloadAllReports = (cases) => {
    const doc = new jsPDF();
    const tableColumns = ["Case ID", "Title", "Category", "Complainant", "Completed By", "Date"];
    const tableRows = cases.map(c => [
      c._id.slice(-4).toUpperCase(), c.title, c.issueType, c.user_id?.name || 'N/A',
      c.assigned_to?.name || 'N/A', new Date(c.updatedAt).toLocaleDateString()
    ]);
    doc.text("All Completed Cases Report", 14, 15);
    autoTable(doc, { head: [tableColumns], body: tableRows, startY: 20 });
    doc.save('all-completed-cases.pdf');

    logReportDownload().catch(err => console.error("Could not log download:", err));
    fetchReportsData();
  };
  
  const handleExportExcel = async () => {
      try {
          const response = await exportExcelReport();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'completed-cases.xlsx');
          document.body.appendChild(link);
          link.click();
          link.remove();
          fetchReportsData();
      } catch (err) {
          console.error("Error exporting Excel file:", err);
          alert("Could not export Excel file.");
      }
  };

  const filteredReportData = useMemo(() => {
    if (categoryFilter === 'All') return data;
    return data.filter(item => item.issueType === categoryFilter);
  }, [data, categoryFilter]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  return (
    <div className="admin-dashboard">
      <aside 
        className={`sidebar ${isSidebarExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <h2><span className="sidebar-text">Admin Panel</span></h2>
        <ul>
            <li className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><span className="sidebar-icon">📊</span><span className="sidebar-text">Dashboard</span></li>
            <li className={activeTab === "manage" ? "active" : ""} onClick={() => setActiveTab("manage")}><span className="sidebar-icon">📋</span><span className="sidebar-text">Manage Complaints</span></li>
            <li className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}><span className="sidebar-icon">🕒</span><span className="sidebar-text">Pending Complaints</span></li>
            <li className={activeTab === "resolved" ? "active" : ""} onClick={() => setActiveTab("resolved")}><span className="sidebar-icon">✅</span><span className="sidebar-text">Resolved</span></li>
            <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}><span className="sidebar-icon">👥</span><span className="sidebar-text">Users</span></li>
            <li className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}><span className="sidebar-icon"><BarChart3 size={20}/></span><span className="sidebar-text">Reports & Analytics</span></li>
            <li className={activeTab === "map" ? "active" : ""} onClick={() => setActiveTab("map")}><span className="sidebar-icon">🗺️</span><span className="sidebar-text">Issue Map</span></li>
        </ul>
        <button className="logout-btn" onClick={() => setShowLogoutModal(true)}><span className="sidebar-icon">🚪</span><span className="sidebar-text">Logout</span></button>
      </aside>

      <main className={`main-content ${isSidebarExpanded ? "expanded" : ""}`}>
        {activeTab === "overview" && (
           <>
            <div className="main-header"><h1>Dashboard</h1></div>
            <div className="cards">
              <div className="card" onClick={() => setActiveTab('manage')}><h2>{summary.total || 0}</h2><p>Total Complaints</p></div>
              <div className="card" onClick={() => setActiveTab('pending')}><h2>{summary.pending || 0}</h2><p>Pending</p></div>
              <div className="card"><h2>{summary.assigned || 0}</h2><p>Assigned</p></div>
              <div className="card"><h2>{summary.in_review || 0}</h2><p>In Review</p></div>
              <div className="card" onClick={() => setActiveTab('resolved')}><h2>{summary.resolved || 0}</h2><p>Resolved</p></div>
              <div className="card" onClick={() => setActiveTab('users')}><h2>{summary.activeUsers || 0}</h2><p>Active Users</p></div>
            </div>
            <div className="overview-charts-grid">
              <div className="chart-card">
                <h2>Complaints by Issue Type</h2>
                {issueTypeData?.length > 0 ? (<ResponsiveContainer width="100%" height={300}><PieChart><Pie data={issueTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" 
                label={(entry) => `${(entry.name || 'Unknown').replace("_", " ")}: ${entry.value}`}>
                  {issueTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>) : <p>No data available.</p>}
              </div>
              <div className="chart-card">
                <h2>Complaints by Priority</h2>
                {priorityData?.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={priorityData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={60} /><Tooltip cursor={{fill: '#f1f5f9'}} /><Bar dataKey="count" barSize={30}>{priorityData.map((entry, index) => {const color = entry.name === 'High' ? '#ef4444' : entry.name === 'Medium' ? '#f59e0b' : '#22c55e'; return <Cell key={`cell-${index}`} fill={color} />;})}</Bar></BarChart></ResponsiveContainer>) : <p>No data available.</p>}
              </div>
            </div>
            <div className="chart-card">
               <h2>Monthly Case Trends</h2>
                <ResponsiveContainer width="100%" height={300}><LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
            </div>
            <div className="activity-log-container">
              <h2>Recent Activity</h2>
              {activityLog?.length > 0 ? (<ul className="activity-log-list">{activityLog.map(activity => (<li key={activity._id} className="activity-log-item"><span className="activity-message">{activity.message}</span><span className="activity-time">{new Date(activity.createdAt).toLocaleString()}</span></li>))}</ul>) : (<p>No recent activity.</p>)}
            </div>
          </>
        )}
        
        {(activeTab === "manage" || activeTab === "pending" || activeTab === "resolved") && (
            <>
                <div className="main-header"><h1>{`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Complaints`}</h1></div>
                <div className="table-container">
                    <table className="complaints-table">
                        <thead><tr><th>ID</th><th>Title</th><th>Complainant</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>) : 
                            (data?.length > 0 ? data.map(c => (
                                <tr key={c._id}>
                                    <td>{c._id.slice(-6).toUpperCase()}</td><td className="complaint-title">{c.title}</td><td>{c.user_id?.name || 'N/A'}</td><td>{c.assigned_to?.name || 'Unassigned'}</td>
                                    <td><span className={`status-pill status-${(c.status || 'unknown').replace('_', '-')}`}>{(c.status || 'unknown').replace('_', ' ')}</span></td>
                                    <td><span className={`priority-pill priority-${(c.priority || 'low').toLowerCase()}`}>{c.priority || 'N/A'}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <button className="icon-btn" onClick={() => navigate(`/complaints/${c._id}`)} title="View Details"><Eye size={18} /></button>
                                        
                                       
                                        {c.status !== 'resolved' && (
                                          <button className="icon-btn" onClick={() => handleAssignClick(c)} title="Assign Complaint">
                                            <Shield size={18} />
                                          </button>
                                        )}
                                        
                                        
                                        {c.status !== 'resolved' && (
                                          <button className="icon-btn danger" onClick={() => handleDelete(c._id)} title="Delete Complaint">
                                            <Trash2 size={18} />
                                          </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="8" style={{ textAlign: 'center' }}>No complaints to display.</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </>
        )}
        
        {activeTab === "users" && (
            <>
                <div className="main-header"><h1>User Management</h1></div>
                <div className="user-summary-grid">
                   <div className="user-summary-card"><div className="card-info"><p>Users</p><span>{usersSummary.users || 0}</span></div><div className="card-icon green"><UserCheck size={24}/></div></div>
                    <div className="user-summary-card"><div className="card-info"><p>Volunteers</p><span>{usersSummary.volunteers || 0}</span></div><div className="card-icon purple"><Shield size={24}/></div></div>
                    <div className="user-summary-card"><div className="card-info"><p>Admin Users</p><span>{usersSummary.admins || 0}</span></div></div>
                </div>
                <div className="table-container">
                    <table className="complaints-table">
                        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Join Date</th><th>Complaints</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading users...</td></tr>) : 
                            (data?.length > 0 ? data.map(user => (
                                <tr key={user._id}>
                                    <td>{user._id.slice(-6).toUpperCase()}</td><td className="complaint-title">{user.name}</td><td>{user.email}</td>
                                    <td><span className={`role-pill role-${(user.role || 'user').toLowerCase()}`}>{user.role}</span></td>
                                    <td><span className={`status-pill ${user.isActive ? 'status-active' : 'status-inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td><td>{user.complaintCount || 0}</td>
                                    <td className="actions-cell"><button className="icon-btn" onClick={() => handleViewUser(user)} title="View Details"><Eye size={18} /></button></td>
                                </tr>
                            )) : (<tr><td colSpan="8" style={{ textAlign: 'center' }}>No users found.</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {activeTab === "reports" && (
            <>
                <div className="main-header"><div><h1>Reports & Analytics</h1><p className="page-subtitle">View completion reports and download case documentation</p></div></div>
                <div className="report-summary-grid">
                    <div className="report-summary-card"><div className="card-info"><p>Cases Solved</p><span>{reportsSummary.casesSolved || 0}</span></div><div className="card-icon green"><CheckCircle size={24}/></div></div>
                    <div className="report-summary-card"><div className="card-info"><p>Reports Ready</p><span>{reportsSummary.reportsReady || 0}</span></div><div className="card-icon blue"><FileText size={24}/></div></div>
                </div>
                <div className="analytics-grid">
                    <div className="quick-stats-card">
                        <h3>Quick Stats</h3>
                        <div className="stat-item"><p>Resolution Rate</p><span>{reportsSummary.resolutionRate || 0}%</span></div>
                        <div className="stat-item"><p>Avg. Resolution Time</p><span>{reportsSummary.avgResolutionTime || 'N/A'}</span></div>
                        <div className="stat-item"><p>User Satisfaction</p><span>{reportsSummary.userSatisfaction || 'N/A'}</span></div>
                    </div>
                    <div className="category-breakdown-card">
                        <h3>Category Breakdown</h3>
                        {categoryBreakdown?.length > 0 ? categoryBreakdown.map(cat => (<div className="category-item" key={cat.name}><div className="category-info"><p>{cat.name}</p><span>{cat.percentage}%</span></div><div className="category-bar">
                        <div className="bar-fill" style={{width: `${cat.percentage}%`, backgroundColor: issueTypeColors[(cat.name || '').toLowerCase().replace(" ", "_")] || '#6c757d'}}></div></div></div>)) : <p>No resolved cases to show breakdown.</p>}
                    </div>
                    <div className="export-options-card">
                        <h3>Export Options</h3>
                        <button onClick={() => handleDownloadAllReports(data)}>Download All Reports (PDF)</button>
                        <button onClick={handleExportExcel}>Export Data (Excel)</button>
                    </div>
                </div>
                <div className="table-container" style={{marginTop: '2rem'}}>
                     <div className="table-header"><h3>Completed Cases & Reports ({filteredReportData?.length || 0})</h3>
                        <div>
                            <select className="btn-secondary" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{marginRight: '1rem', padding: '0.5rem 1rem'}}>
                                <option value="All">All Categories</option>
                                {Object.keys(issueTypeColors).map(cat => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}</option>))}
                            </select>
                            <button className="btn-primary" onClick={() => handleDownloadAllReports(filteredReportData)}>Download All</button>
                        </div>
                     </div>
                    <table className="complaints-table">
                        <thead><tr><th>Case ID</th><th>Title</th><th>Complainant</th><th>Completed By</th><th>Category</th><th>Completed Date</th><th>Report Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading cases...</td></tr>) : 
                            (filteredReportData?.length > 0 ? filteredReportData.map(c => (
                                <tr key={c._id}>
                                    <td>{c._id.slice(-4).toUpperCase()}</td><td className="complaint-title">{c.title}</td><td>{c.user_id?.name || 'N/A'}</td><td>{c.assigned_to?.name || 'N/A'}</td>
                                    <td><span className={`category-pill cat-${c.issueType}`}>{ (c.issueType || 'other').replace("_", " ") }</span></td>
                                    <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
                                    <td><span className="report-status-pill status-ready">Ready</span></td>
                                    <td className="actions-cell">
                                        <button className="icon-btn" onClick={() => navigate(`/complaints/${c._id}`)} title="View Report"><Eye size={18} /></button>
                                        <button className="icon-btn" onClick={() => handleDownloadSingleReport(c)} title="Download Report"><Download size={18} /></button>
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="8" style={{ textAlign: 'center' }}>No completed cases found for this filter.</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {activeTab === "map" && (<div className="map-view-container"><h1>Issue Map Overview</h1>{loading ? <p>Loading map...</p> :<MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{data.map((c) => c.location?.coordinates ? (<CircleMarker key={c._id} center={[c.location.coordinates[1], c.location.coordinates[0]]} radius={8} color={issueTypeColors[c.issueType] || "#000"} fillOpacity={0.7}><LeafletTooltip>{c.title}</LeafletTooltip><Popup><div><h4>{c.title}</h4><p>Status: {c.status}</p><button onClick={() => navigate(`/complaints/${c._id}`)}>View Details</button></div></Popup></CircleMarker>) : null )}</MapContainer>}</div>)}
      </main>
      
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign Complaint</h3><p>"{selectedComplaint?.title}"</p>
            <select value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)}><option value="">Select Volunteer</option>{volunteers.map((v) => (<option key={v._id} value={v._id}>{v.name} ({v.email})</option>))}</select>
            <div className="modal-actions"><button className="btn-secondary modal-btn" onClick={() => setShowAssignModal(false)}>Cancel</button><button className="btn-primary modal-btn" onClick={handleAssign}>Confirm</button></div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleConfirmLogout} />

      {showUserDetailsModal && selectedUser && (
        <div className="modal-overlay">
            <div className="modal-content user-details-modal">
                <button className="close-modal-btn" onClick={() => setShowUserDetailsModal(false)}>×</button>
                <div className="user-info-header">
                    <div className="user-avatar">{(selectedUser.name || 'U').charAt(0).toUpperCase()}</div><h3>{selectedUser.name || 'Unnamed User'}</h3><p>{selectedUser.email}</p>
                    <span className={`role-pill role-${(selectedUser.role || 'user').toLowerCase()}`}>{selectedUser.role || 'user'}</span>
                </div>
                {isUserDetailsLoading ? <p style={{textAlign: 'center', padding: '2rem'}}>Loading details...</p> : (
                    <div className="user-stats-grid">
                        <div className="stat-item"><h4>Total Complaints</h4><span>{selectedUserDetails?.totalComplaints ?? 0}</span></div>
                        <div className="stat-item"><h4>Resolved</h4><span>{selectedUserDetails?.resolvedComplaints ?? 0}</span></div>
                        <div className="stat-item"><h4>Pending</h4><span>{selectedUserDetails?.pendingComplaints ?? 0}</span></div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;