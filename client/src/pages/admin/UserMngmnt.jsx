import React, { useState, useEffect } from 'react';

const UserMngmnt = () => {
    const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = '/api/users';

    // 1. Load FontAwesome and Initial Data
    useEffect(() => {
        // Load FontAwesome dynamically as per original script
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(link);

        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([loadSummaryData(), loadUserRequests()]);
        setIsLoading(false);
    };

    const loadSummaryData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/summary`);
            if (!response.ok) throw new Error('Failed to fetch summary');
            const data = await response.json();
            setSummary({
                pending: data.pending || 0,
                approved: data.approved || 0,
                rejected: data.rejected || 0
            });
        } catch (error) {
            console.error('Error loading summary data:', error);
        }
    };

    const loadUserRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`);
            if (!response.ok) throw new Error('Failed to fetch requests');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error loading user requests:', error);
        }
    };

    // 2. Handle Status Update (Approve/Reject)
    const handleStatusUpdate = async (userId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this user?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/status/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Update failed');
            }

            alert(`User has been ${newStatus}.`);
            // Refresh data
            fetchData();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Helper: Formatting
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US');
    const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
    });

    const getStatusPill = (status) => {
        const sl = status.toLowerCase();
        let icon = sl === 'pending' ? 'fa-clock' : (sl === 'approved' ? 'fa-circle-check' : 'fa-circle-xmark');
        return (
            <span className={`status-pill status-${sl}`}>
                <i className={`fa-regular ${icon}`}></i> {status}
            </span>
        );
    };

    return (
        <div className="user-management-page">
            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">
                    <h3>Pending Requests</h3>
                    <div className="value" id="pending-count">{summary.pending}</div>
                </div>
                <div className="card">
                    <h3>Approved Users</h3>
                    <div className="value" id="approved-count">{summary.approved}</div>
                </div>
                <div className="card">
                    <h3>Rejected Requests</h3>
                    <div className="value" id="rejected-count">{summary.rejected}</div>
                </div>
            </div>

            {/* User Requests Table */}
            <div className="table-section card">
                <div className="table-header">
                    <h3>User Access Requests</h3>
                </div>
                <div className="tablescroll">
                    <table className="user-requests-table">
                        <thead>
                            <tr>
                                <th>User Info</th>
                                <th>Requested Role</th>
                                <th>Email</th>
                                <th>Request Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="user-requests-tbody">
                            {isLoading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No user requests found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_id}>
                                        <td>
                                            <div className="user-name">{user.full_name}</div>
                                            <div className="user-position">{user.position || ''}</div>
                                        </td>
                                        <td><span className="role-pill">{user.role}</span></td>
                                        <td>
                                            <div><i className="fa-regular fa-envelope"></i> {user.email}</div>
                                        </td>
                                        <td>
                                            <div>{formatDate(user.requested_date)}</div>
                                            <div className="date-cell-time">{formatTime(user.requested_date)}</div>
                                        </td>
                                        <td>{getStatusPill(user.status)}</td>
                                        <td className="actions-cell">
                                            {user.status.toLowerCase() === 'pending' ? (
                                                <>
                                                    <button 
                                                        className="btn-action btn-approve" 
                                                        onClick={() => handleStatusUpdate(user.user_id, 'approved')}
                                                    >
                                                        <i className="fa-solid fa-user-plus"></i> Approve
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-reject" 
                                                        onClick={() => handleStatusUpdate(user.user_id, 'rejected')}
                                                    >
                                                        <i className="fa-solid fa-user-xmark"></i> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <span>-</span>
                                            )}
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
};

export default UserMngmnt;