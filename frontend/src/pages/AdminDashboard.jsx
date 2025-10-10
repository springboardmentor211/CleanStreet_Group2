


import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from "react-leaflet";
import { Eye, Shield, Trash2, Users, UserCheck, BarChart3, Download, FileText, CheckCircle } from 'lucide-react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "leaflet/dist/leaflet.css";
import "./AdminDashboard.css";


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="recharts-tooltip-label">{label || payload[0].name}</p>
        <p className="recharts-tooltip-item">{`Count: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#1f2937" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {`${name.replace("_", " ")} (${value})`}
    </text>
  );
};

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

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center' }}>
          <div className="success-modal-icon"> <CheckCircle size={24} /> </div>
          <h3>Success</h3>
          <p>{message}</p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-primary modal-btn" onClick={onClose}>OK</button>
          </div>
        </div>
      </div>
    );
};

const issueTypeColors = {
  pothole: "#A0522D", garbage_dump: "#FF4500", water_leak: "#1E90FF",
  streetlight: "#FFD700", broken_sidewalk: "#8B4513", graffiti: "#800080",
  noise_pollution: "#FF1493", other: "#32CD32",
};

const MONTH_COLORS = {
    Jan: "#8884d8", Feb: "#82ca9d", Mar: "#ffc658", Apr: "#ff8042", May: "#0088FE",
    Jun: "#00C49F", Jul: "#FFBB28", Aug: "#FF8042", Sep: "#AF19FF", Oct: "#FF1943",
    Nov: "#3b82f6", Dec: "#ef4444"
};

const PRIORITY_COLORS = { 'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#22c55e' };
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [summary, setSummary] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [issueTypeData, setIssueTypeData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  const [usersSummary, setUsersSummary] = useState({});
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [reportsSummary, setReportsSummary] = useState({});
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [manageFilter, setManageFilter] = useState('all');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const fetchComplaints = async (status) => {
    setLoading(true);
    setData([]);
    try {
      const res = await getAllComplaints(status);
      setData(res.data);
    } catch (err) { console.error("Error fetching complaints:", err); }
    finally { setLoading(false); }
  };

  const fetchSummaryAndLog = async () => {
    setLoading(true);
    try {
      const [summaryRes, logRes, issueTypeRes, priorityRes, monthlyRes] = await Promise.all([
        getAdminSummary(), getAdminActivityLog(), getIssueTypeSummary(),
        getComplaintPrioritySummary(), getMonthlyComplaintSummary(),
      ]);
      setSummary(summaryRes.data);
      setActivityLog(logRes.data);
      setIssueTypeData(issueTypeRes.data);
      setPriorityData(priorityRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (err) { console.error("Failed to fetch dashboard data:", err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => { 
    setLoading(true); setData([]); 
    try { const res = await getAllUsers(); setData(res.data); } 
    catch (err) { console.error("Error fetching user list:", err); } 
    finally { setLoading(false); } 
  };
  
  const fetchReportsData = async () => { 
    setLoading(true); setData([]); 
    try { 
      const [summaryRes, breakdownRes, casesRes] = await Promise.all([ 
        getReportsSummary(), getCategoryBreakdown(), getAllComplaints("resolved") 
      ]); 
      setReportsSummary(summaryRes.data); 
      setCategoryBreakdown(breakdownRes.data); 
      setData(casesRes.data); 
    } catch (err) { console.error("Error fetching reports data:", err); } 
    finally { setLoading(false); } 
  };

  useEffect(() => {
    if (activeTab === 'overview') { fetchSummaryAndLog(); } 
    else if (activeTab === 'map') { fetchComplaints("all"); } 
    else if (activeTab === 'users') { 
        fetchUsers(); 
        getAdminUsersSummary().then(res => setUsersSummary(res.data));
    } 
    else if (activeTab === 'reports') { fetchReportsData(); }
    else if (activeTab === 'manage') { fetchComplaints(manageFilter); } 
    else if (activeTab === 'pending') { fetchComplaints("received"); } 
    else if (activeTab === 'resolved') { fetchComplaints("resolved"); }
  }, [activeTab, manageFilter]);
  
  const handleDelete = async (complaintId) => { if (!window.confirm("Are you sure you want to permanently delete this complaint?")) return; try { await deleteComplaintByAdmin(complaintId); setData(prev => prev.filter(c => c._id !== complaintId)); alert("Complaint deleted successfully."); } catch (err) { alert("Failed to delete complaint."); } };
  const handleAssignClick = (complaint) => { getAdminVolunteers().then(res => setVolunteers(res.data || [])).catch(err => console.error("Error fetching volunteers:", err)); setSelectedComplaint(complaint); setShowAssignModal(true); };
  const handleAssign = async () => { if (!selectedVolunteer) { alert("Please select a volunteer."); return; } try { await assignComplaint(selectedComplaint._id, selectedVolunteer); setShowAssignModal(false); setSelectedVolunteer(""); setSuccessMessage("Complaint has been assigned successfully!"); setShowSuccessModal(true); if (activeTab === 'pending') { fetchComplaints('received'); } else if (activeTab === 'manage') { fetchComplaints('all'); } } catch (err) { console.error("Error assigning complaint:", err); alert("Failed to assign complaint."); } };
  const handleConfirmLogout = () => { logout(); navigate('/'); };
  const handleViewUser = async (user) => { setSelectedUser(user); setIsUserDetailsLoading(true); setShowUserDetailsModal(true); try { const res = await getUserDetails(user._id); setSelectedUserDetails(res.data); } catch (err) { setSelectedUserDetails(null); } finally { setIsUserDetailsLoading(false); } };


  const handleDownloadSingleReport = (caseData) => {
    const doc = new jsPDF();
    

    const addTextSection = () => {
      doc.setFontSize(20);
      doc.text("Completed Case Report", 14, 22);
      doc.setFontSize(12);
      let yPosition = 32;
      const addText = (label, value, y) => {
        doc.text(`${label}:`, 14, y);
        const splitValue = doc.splitTextToSize(value || 'N/A', 140);
        doc.text(splitValue, 50, y);
        return y + (splitValue.length * 5) + 3;
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
      return yPosition + (splitDescription.length * 5); 
    };

    const loadImages = (imageUrls) => {
      return Promise.all(imageUrls.map(url => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
        img.src = url;
      })));
    };

    
    let finalY = addTextSection();

    if (Array.isArray(caseData.images) && caseData.images.length > 0) {
      const imageUrls = caseData.images.map(imgFile => `http://localhost:5000/uploads/${imgFile}`);
      
      loadImages(imageUrls)
        .then(loadedImages => {
          let yPosition = finalY;
          const margin = 14;
          const pageHeight = doc.internal.pageSize.getHeight();

          loadedImages.forEach((img, index) => {
            doc.setFontSize(14);
            const imageTitle = `Complaint Image ${index + 1} of ${loadedImages.length}`;
            const spaceNeededForTitle = 20;

            
            if (yPosition + spaceNeededForTitle > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(imageTitle, margin, yPosition);
            yPosition += 10;

            
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxImgWidth = pageWidth - (margin * 2);
            const maxImgHeight = pageHeight - yPosition - margin - 10; 

            let imgWidth = img.width;
            let imgHeight = img.height;
            const ratio = imgWidth / imgHeight;

            if (imgWidth > maxImgWidth) {
              imgWidth = maxImgWidth;
              imgHeight = imgWidth / ratio;
            }
            if (imgHeight > maxImgHeight) {
              imgHeight = maxImgHeight;
              imgWidth = imgHeight * ratio;
            }

            
            if (yPosition + imgHeight > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
              doc.text(imageTitle, margin, yPosition); 
              yPosition += 10;
            }

            const imageX = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'JPEG', imageX, yPosition, imgWidth, imgHeight);
            
            
            yPosition += imgHeight + 10;
          });

          doc.save(`case-report-${caseData._id.slice(-6).toUpperCase()}.pdf`);
        })
        .catch(error => {
          console.error(error);
          alert("Could not load some images. Generating text-only PDF.");
          doc.save(`case-report-${caseData._id.slice(-6).toUpperCase()}.pdf`);
        });
    } else {
      
      doc.save(`case-report-${caseData._id.slice(-6).toUpperCase()}.pdf`);
    }

    logReportDownload().catch(err => console.error("Could not log download:", err));
    fetchReportsData();
  };
  
  const handleDownloadAllReports = (cases) => { const doc = new jsPDF(); const tableColumns = ["Case ID", "Title", "Category", "Complainant", "Completed By", "Date"]; const tableRows = cases.map(c => [ c._id.slice(-4).toUpperCase(), c.title, c.issueType, c.user_id?.name || 'N/A', c.assigned_to?.name || 'N/A', new Date(c.updatedAt).toLocaleDateString() ]); doc.text("All Completed Cases Report", 14, 15); autoTable(doc, { head: [tableColumns], body: tableRows, startY: 20 }); doc.save('all-completed-cases.pdf'); logReportDownload().catch(err => console.error("Could not log download:", err)); fetchReportsData(); };
  const handleExportExcel = async () => { try { const response = await exportExcelReport(); const url = window.URL.createObjectURL(new Blob([response.data])); const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'completed-cases.xlsx'); document.body.appendChild(link); link.click(); link.remove(); fetchReportsData(); } catch (err) { console.error("Error exporting Excel file:", err); alert("Could not export Excel file."); } };

  const filteredReportData = useMemo(() => { if (categoryFilter === 'All') return data; return data.filter(item => item.issueType === categoryFilter); }, [data, categoryFilter]);
  const filteredUsers = useMemo(() => { if (activeTab !== 'users') return []; if (userRoleFilter === 'all') return data; return data.filter(user => user.role === userRoleFilter); }, [data, userRoleFilter, activeTab]);
  const fullMonthlyData = useMemo(() => { const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; const dataMap = new Map(months.map(m => [m, { month: m, count: 0 }])); if(Array.isArray(monthlyData)) { monthlyData.forEach(item => { if (item && typeof item.month === 'string') { const apiDate = new Date(item.month); const monthName = apiDate.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }); if (dataMap.has(monthName)) { dataMap.get(monthName).count = item.count; } } }); } return Array.from(dataMap.values()); }, [monthlyData]);
  const sortedPriorityData = useMemo(() => { const order = { "High": 1, "Medium": 2, "Low": 3 }; return [...priorityData].sort((a, b) => (order[a.name] || 99) - (order[b.name] || 99)); }, [priorityData]);

  const completeCategoryBreakdown = useMemo(() => {
    const apiDataMap = new Map((categoryBreakdown || []).map(item => [item.name, item]));
    const allCategoryNames = Object.keys(issueTypeColors);
    return allCategoryNames.map(name => {
      if (apiDataMap.has(name)) { return apiDataMap.get(name); }
      return { name, percentage: 0 };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [categoryBreakdown]);


  return (
    <div className="admin-dashboard">
      <aside 
        className={`sidebar ${isSidebarExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <h2><span className="sidebar-text">Admin Panel</span></h2>
        <ul>
            <li className={activeTab === "overview" ? "active" : ""} onClick={() => handleTabChange("overview")}><span className="sidebar-icon">📊</span><span className="sidebar-text">Dashboard</span></li>
            <li className={activeTab === "manage" ? "active" : ""} onClick={() => handleTabChange("manage")}><span className="sidebar-icon">📋</span><span className="sidebar-text">Manage Complaints</span></li>
            <li className={activeTab === "pending" ? "active" : ""} onClick={() => handleTabChange("pending")}><span className="sidebar-icon">🕒</span><span className="sidebar-text">Pending Complaints</span></li>
            <li className={activeTab === "resolved" ? "active" : ""} onClick={() => handleTabChange("resolved")}><span className="sidebar-icon">✅</span><span className="sidebar-text">Resolved</span></li>
            <li className={activeTab === "users" ? "active" : ""} onClick={() => handleTabChange("users")}><span className="sidebar-icon">👥</span><span className="sidebar-text">Users</span></li>
            <li className={activeTab === "reports" ? "active" : ""} onClick={() => handleTabChange("reports")}><span className="sidebar-icon"><BarChart3 size={20}/></span><span className="sidebar-text">Reports & Analytics</span></li>
            <li className={activeTab === "map" ? "active" : ""} onClick={() => handleTabChange("map")}><span className="sidebar-icon">🗺️</span><span className="sidebar-text">Issue Map</span></li>
        </ul>
        <button className="logout-btn" onClick={() => setShowLogoutModal(true)}><span className="sidebar-icon">🚪</span><span className="sidebar-text">Logout</span></button>
      </aside>

      <main className={`main-content ${isSidebarExpanded ? "expanded" : ""}`}>
        {activeTab === "overview" && (
           <>
            <div className="main-header"><h1>Dashboard</h1></div>
            <div className="cards">
              <div className="card" onClick={() => handleTabChange('manage')}><h2>{summary.total || 0}</h2><p>Total Complaints</p></div>
              <div className="card" onClick={() => handleTabChange('pending')}><h2>{summary.pending || 0}</h2><p>Pending</p></div>
              <div className="card"><h2>{summary.assigned || 0}</h2><p>Assigned</p></div>
              <div className="card"><h2>{summary.inReview || 0}</h2><p>In Review</p></div>
              <div className="card" onClick={() => handleTabChange('resolved')}><h2>{summary.resolved || 0}</h2><p>Resolved</p></div>
              <div className="card" onClick={() => handleTabChange('users')}><h2>{summary.activeUsers || 0}</h2><p>Active Users</p></div>
            </div>
            <div className="overview-charts-grid">
              <div className="chart-card">
                <h2>Complaints by Issue Type</h2>
                {issueTypeData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={issueTypeData} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={90} 
                        fill="#8884d8" 
                        dataKey="value" 
                        nameKey="name" 
                        labelLine
                        label={renderCustomizedLabel}
                      >
                        {issueTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={issueTypeColors[entry.name.toLowerCase().replace(/ /g, '_')] || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p>No data available.</p>}
              </div>
              <div className="chart-card">
                <h2>Complaints by Priority</h2>
                {sortedPriorityData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sortedPriorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name.charAt(0).toUpperCase() + name.slice(1)} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sortedPriorityData.map((entry) => {
                          const capitalizedName = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
                          return <Cell key={`cell-${entry.name}`} fill={PRIORITY_COLORS[capitalizedName]} />;
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p>No data available.</p>}
              </div>
            </div>
            <div className="chart-card">
               <h2>Monthly Case Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fullMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.7)' }}/>
                    <Legend />
                    <Bar dataKey="count">
                      <LabelList dataKey="count" position="top" />
                      {fullMonthlyData.map((entry) => (
                        <Cell key={`cell-${entry.month}`} fill={MONTH_COLORS[entry.month]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="activity-log-container">
              <h2>Recent Activity</h2>
              <ul className="activity-log-list">{activityLog?.length > 0 ? activityLog.map(activity => (<li key={activity._id} className="activity-log-item"><span className="activity-message">{activity.message}</span><span className="activity-time">{new Date(activity.createdAt).toLocaleString()}</span></li>)) : (<li><p>No recent activity.</p></li>)}</ul>
            </div>
          </>
        )}
        
        {activeTab === "manage" && (
            <>
                <div className="main-header">
                    <h1>Manage Complaints</h1>
                    <select className="table-filter-dropdown" value={manageFilter} onChange={e => setManageFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="received">Received</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
                <div className="table-container scrollable">
                    <table className="complaints-table">
                        <thead><tr><th>ID</th><th>Title</th><th>Complainant</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>) : 
                            (data?.length > 0 ? data.map(c => (
                                <tr key={c._id} className="clickable-row" onClick={() => navigate(`/complaints/${c._id}`)}>
                                    <td>{c._id.slice(-6).toUpperCase()}</td><td className="complaint-title">{c.title}</td><td>{c.user_id?.name || 'N/A'}</td><td>{c.assigned_to?.name || 'Unassigned'}</td>
                                    <td><span className={`status-pill status-${(c.status || 'unknown').replace('_', '-')}`}>{(c.status || 'unknown').replace('_', ' ')}</span></td>
                                    <td><span className={`priority-pill priority-${(c.priority || 'low').toLowerCase()}`}>{c.priority || 'N/A'}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                        <button className="icon-btn" onClick={() => navigate(`/complaints/${c._id}`)} title="View Details"><Eye size={18} /></button>
                                        {c.status !== 'resolved' && ( <button className="icon-btn" onClick={() => handleAssignClick(c)} title="Assign Complaint"><Shield size={18} /></button> )}
                                        {c.status !== 'resolved' && ( <button className="icon-btn danger" onClick={() => handleDelete(c._id)} title="Delete Complaint"><Trash2 size={18} /></button> )}
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="8" style={{ textAlign: 'center' }}>No complaints to display for this filter.</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {(activeTab === "pending" || activeTab === "resolved") && (
            <>
                <div className="main-header"><h1>{`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Complaints`}</h1></div>
                <div className="table-container">
                    <table className="complaints-table">
                        <thead><tr><th>ID</th><th>Title</th><th>Complainant</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>) : 
                            (data?.length > 0 ? data.map(c => (
                                <tr key={c._id} className="clickable-row" onClick={() => navigate(`/complaints/${c._id}`)}>
                                    <td>{c._id.slice(-6).toUpperCase()}</td><td className="complaint-title">{c.title}</td><td>{c.user_id?.name || 'N/A'}</td><td>{c.assigned_to?.name || 'Unassigned'}</td>
                                    <td><span className={`status-pill status-${(c.status || 'unknown').replace('_', '-')}`}>{(c.status || 'unknown').replace('_', ' ')}</span></td>
                                    <td><span className={`priority-pill priority-${(c.priority || 'low').toLowerCase()}`}>{c.priority || 'N/A'}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                        <button className="icon-btn" onClick={() => navigate(`/complaints/${c._id}`)} title="View Details"><Eye size={18} /></button>
                                        {c.status !== 'resolved' && ( <button className="icon-btn" onClick={() => handleAssignClick(c)} title="Assign Complaint"><Shield size={18} /></button> )}
                                        {c.status !== 'resolved' && ( <button className="icon-btn danger" onClick={() => handleDelete(c._id)} title="Delete Complaint"><Trash2 size={18} /></button> )}
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
                <div className="main-header">
                    <div>
                        <h1>User Management</h1>
                        <p className="page-subtitle">Oversee all registered users and their roles</p>
                    </div>
                </div>
                <div className="cards">
                    <div className="user-summary-card">
                        <div className="card-info"><p>Citizens</p><span>{usersSummary.users || 0}</span></div>
                        <div className="card-icon green"><Users size={28}/></div>
                    </div>
                    <div className="user-summary-card">
                        <div className="card-info"><p>Volunteers</p><span>{usersSummary.volunteers || 0}</span></div>
                        <div className="card-icon purple"><Shield size={28}/></div>
                    </div>
                    <div className="user-summary-card">
                        <div className="card-info"><p>Admins</p><span>{usersSummary.admins || 0}</span></div>
                        <div className="card-icon blue"><UserCheck size={28}/></div>
                    </div>
                </div>
                <div className="table-container" style={{ marginTop: '2rem' }}>
                    <div className="filter-controls">
                        <button className={`filter-btn ${userRoleFilter === 'all' ? 'active' : ''}`} onClick={() => setUserRoleFilter('all')}>All Users</button>
                        <button className={`filter-btn ${userRoleFilter === 'user' ? 'active' : ''}`} onClick={() => setUserRoleFilter('user')}>Citizens</button>
                        <button className={`filter-btn ${userRoleFilter === 'volunteer' ? 'active' : ''}`} onClick={() => setUserRoleFilter('volunteer')}>Volunteers</button>
                        <button className={`filter-btn ${userRoleFilter === 'admin' ? 'active' : ''}`} onClick={() => setUserRoleFilter('admin')}>Admins</button>
                    </div>
                    <table className="complaints-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Join Date</th>
                                <th className="col-center">Complaints</th>
                                <th className="col-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading users...</td></tr>) : 
                            (filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{user._id.slice(-6).toUpperCase()}</td>
                                    <td className="complaint-title">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`role-pill role-${(user.role || 'user').toLowerCase()}`}>{user.role}</span></td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="col-center">{user.complaintCount || 0}</td>
                                    <td className="actions-cell col-center">
                                        <button className="icon-btn" onClick={() => handleViewUser(user)} title="View Details"><Eye size={18} /></button>
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="7" style={{ textAlign: 'center' }}>No users found for this filter.</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {activeTab === "reports" && (
            <>
                <div className="main-header"><div><h1>Reports & Analytics</h1><p className="page-subtitle">View completion reports and download case documentation</p></div></div>
                <div className="cards">
                    <div className="report-summary-card">
                        <div className="card-info"><p>Total Cases Solved</p><span>{reportsSummary.casesSolved || 0}</span></div>
                        <div className="card-icon green"><CheckCircle size={28}/></div>
                    </div>
                    <div className="report-summary-card">
                         <div className="card-info"><p>Reports Ready</p><span>{reportsSummary.reportsReady || 0}</span></div>
                        <div className="card-icon blue"><FileText size={28}/></div>
                    </div>
                    <div className="report-summary-card">
                         <div className="card-info"><p>Avg. Resolution Time</p><span>{reportsSummary.avgResolutionTime || 'N/A'}</span></div>
                        <div className="card-icon purple"><BarChart3 size={28}/></div>
                    </div>
                </div>
                <div className="analytics-grid">
                    <div className="category-breakdown-card">
                        <h3>Category Breakdown</h3>
                        {completeCategoryBreakdown?.length > 0 ? completeCategoryBreakdown.map(cat => (
                            <div className="category-item" key={cat.name}>
                                <div className="category-info">
                                    <p>{(cat.name || 'other').replace("_", " ")}</p>
                                    <div className="category-bar">
                                        <div className="bar-fill" style={{width: `${cat.percentage}%`, backgroundColor: issueTypeColors[(cat.name || '').toLowerCase().replace(" ", "_")] || '#6c757d'}}></div>
                                    </div>
                                </div>
                                <span className="category-percentage">{cat.percentage.toFixed(1)}%</span>
                            </div>
                        )) : <p>No resolved cases to show breakdown.</p>}
                    </div>
                    <div className="export-options-card">
                        <h3>Export Options</h3>
                        <button onClick={() => handleDownloadAllReports(data)}><Download size={16}/> Download All as PDF</button>
                        <button onClick={handleExportExcel}><FileText size={16}/> Export All as Excel</button>
                    </div>
                </div>
                <div className="table-container" style={{marginTop: '2rem'}}>
                     <div className="table-header"><h3>Completed Cases ({filteredReportData?.length || 0})</h3>
                        <div>
                            <select className="btn-secondary" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{marginRight: '1rem', padding: '0.5rem 1rem'}}>
                                <option value="All">All Categories</option>
                                {Object.keys(issueTypeColors).map(cat => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}</option>))}
                            </select>
                        </div>
                     </div>
                    <table className="complaints-table">
                        <thead><tr><th>Case ID</th><th>Title</th><th>Completed By</th><th>Category</th><th>Completed Date</th><th>Report Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading cases...</td></tr>) : 
                            (filteredReportData?.length > 0 ? filteredReportData.map(c => (
                                <tr key={c._id} className="clickable-row" onClick={() => navigate(`/complaints/${c._id}`)}>
                                    <td>{c._id.slice(-4).toUpperCase()}</td><td className="complaint-title">{c.title}</td><td>{c.assigned_to?.name || 'N/A'}</td>
                                    <td><span className={`category-pill cat-${c.issueType}`}>{ (c.issueType || 'other').replace("_", " ") }</span></td>
                                    <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
                                    <td><span className="report-status-pill status-ready">Ready</span></td>
                                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                        <button className="icon-btn" onClick={() => navigate(`/complaints/${c._id}`)} title="View Report">
                                            <Eye size={18} />
                                        </button>
                                        <button className="icon-btn" onClick={() => handleDownloadSingleReport(c)} title="Download Report">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (<tr><td colSpan="7" style={{ textAlign: 'center' }}>No completed cases found for this filter.</td></tr>))}
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
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        message={successMessage}
      />

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