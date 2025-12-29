// src/components/QrTracking.jsx
import React, { useState, useEffect } from "react";
import "./Dashboard.css";

export default function QrTracking() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    recentUsers: 0,
    bySubscription: {}
  });
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [view, setView] = useState("qr-codes"); // qr-codes or users
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    
    // Check if user is admin
    if (userData.role === "admin") {
      setIsAdmin(true);
      fetchQrCodes();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchQrCodes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/qr-codes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQrCodes(data.qrCodes);
        }
      } else if (response.status === 403) {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const deleteQrCode = async (qrId) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/qr-codes/${qrId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert("QR code deleted successfully");
        fetchQrCodes(); // Refresh list
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Error deleting QR code");
    }
  };

  const filteredQrCodes = qrCodes.filter(qr => {
    const matchesSearch = 
      qr.text && qr.text .toLowerCase().includes(search.toLowerCase()) ||
      qr.userEmail && qr.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      qr.userName && qr.userName.toLowerCase().includes(search.toLowerCase());
    
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      const qrDate = new Date(qr.generatedAt).toDateString();
      return matchesSearch && today === qrDate;
    } else if (dateFilter === "thisWeek") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const qrDate = new Date(qr.generatedAt);
      return matchesSearch && qrDate >= oneWeekAgo;
    } else if (dateFilter === "thisMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const qrDate = new Date(qr.generatedAt);
      return matchesSearch && qrDate >= oneMonthAgo;
    }
    
    return matchesSearch;
  });

  const filteredUsers = users.filter(user => {
    return (
      user.name && user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email && user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.subscriptionTier && user.subscriptionTier.toLowerCase().includes(search.toLowerCase())
    );
  });

  const exportToCSV = () => {
    let csvContent = "";
    
    if (view === "qr-codes") {
      const headers = ["ID", "User", "Email", "Subscription", "Text", "Color", "Generated At", "Downloads"];
      const csvData = filteredQrCodes.map(qr => [
        qr.id,
        qr.userName,
        qr.userEmail,
        qr.userSubscription,
        qr.text,
        qr.color,
        new Date(qr.generatedAt).toLocaleString(),
        qr.downloads || 0
      ]);
      
      csvContent = [
        headers.join(","),
        ...csvData.map(row => row.join(","))
      ].join("\n");
    } else {
      const headers = ["ID", "Name", "Email", "Subscription", "QR Codes", "Created At", "Status"];
      const csvData = filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.subscriptionTier,
        user.qrCodesCount || 0,
        new Date(user.createdAt).toLocaleDateString(),
        user.subscriptionActive ? "Active" : "Inactive"
      ]);
      
      csvContent = [
        headers.join(","),
        ...csvData.map(row => row.join(","))
      ].join("\n");
    }
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-export-${view}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // If not admin, don't render the component
  if (!isAdmin) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h3 style={{ color: '#495057', marginBottom: '10px' }}>Admin Access Required</h3>
        <p style={{ color: '#6c757d' }}>
          This section is only accessible to administrators.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#6b7280' }}>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="qr-tracking-container">
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ color: '#4f46e5', marginBottom: '5px' }}>
            📊 Admin Dashboard
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Welcome, {user && user.username} • Total QR Codes: <strong>{stats.total}</strong>
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{
            background: '#10b981',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ADMIN
          </span>
        </div>
      </div>

      {/* View Toggle */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        background: '#f8f9fa',
        padding: '8px',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => {
            setView("qr-codes");
            setSearch("");
          }}
          style={{
            background: view === "qr-codes" ? '#4f46e5' : 'transparent',
            color: view === "qr-codes" ? 'white' : '#6b7280',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: 1
          }}
        >
          📋 QR Codes
        </button>
        <button
          onClick={() => {
            setView("users");
            setSearch("");
            fetchUsers();
          }}
          style={{
            background: view === "users" ? '#4f46e5' : 'transparent',
            color: view === "users" ? 'white' : '#6b7280',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: 1
          }}
        >
          👥 Users
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>📈</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total QR Codes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>📅</div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf6' }}>📆</div>
          <div className="stat-content">
            <h3>{stats.thisWeek}</h3>
            <p>This Week</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>👥</div>
          <div className="stat-content">
            <h3>{stats.recentUsers}</h3>
            <p>Active Users (7d)</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder={`🔍 Search ${view === "qr-codes" ? "QR codes..." : "users..."}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '10px 15px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        
        {view === "qr-codes" && (
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              minWidth: '150px'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
        )}
        
        <button
          onClick={exportToCSV}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📥 Export CSV
        </button>
        
        <button
          onClick={() => {
            if (view === "qr-codes") {
              fetchQrCodes();
              fetchStats();
            } else {
              fetchUsers();
            }
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* QR Codes Table */}
      {view === "qr-codes" ? (
        <div style={{
          background: 'white',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#111827' }}>
              QR Codes ({filteredQrCodes.length})
            </h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {filteredQrCodes.length} of {qrCodes.length}
            </div>
          </div>
          
          {filteredQrCodes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No QR codes found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Text</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Generated</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Downloads</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQrCodes.map((qr) => (
                    <tr key={qr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>
                            {qr.userName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {qr.userEmail}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            {qr.userSubscription} • {qr.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', maxWidth: '200px' }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#111827'
                        }}>
                          {qr.text}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            background: qr.color || '#000000',
                            border: '1px solid #d1d5db'
                          }}></div>
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {qr.color}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                        {new Date(qr.generatedAt).toLocaleDateString()}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(qr.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: '#f3f4f6',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {qr.downloads || 0}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => window.open(qr.qrCodeData, '_blank')}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteQrCode(qr.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Users Table */
        <div style={{
          background: 'white',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#111827' }}>
              Users ({filteredUsers.length})
            </h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Total Users: {users.length}
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No users found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Subscription</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>QR Codes</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Joined</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {user.email}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: user.subscriptionTier === 'premium' ? '#8b5cf6' : 
                                    user.subscriptionTier === 'basic' ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {user.subscriptionTier || 'free'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>
                          {user.qrCodesCount || 0}
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {user.updatedAt ? 'Updated: ' + new Date(user.updatedAt).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: user.subscriptionActive ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.subscriptionActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.role === 'admin' && (
                          <div style={{
                            marginTop: '5px',
                            background: '#4f46e5',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            ADMIN
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subscription Stats */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#111827' }}>Subscription Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {Object.entries(stats.bySubscription || {}).map(([tier, count]) => (
            <div key={tier} style={{
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: tier === 'premium' ? '#8b5cf6' : 
                             tier === 'basic' ? '#10b981' : '#6b7280'
                }}></div>
                <span style={{ fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>
                  {tier}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                {count}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Users
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}