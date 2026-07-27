import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FilingList({ refreshTrigger, onEditClick }) {
    const [filings, setFilings] = useState([]);

    const fetchFilings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/filings');
            setFilings(response.data);
        } catch (err) {
            console.log('Error fetching filings');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/filings/${id}`);
            fetchFilings();
        } catch (err) {
            console.log('Error deleting filing');
        }
    };

    useEffect(() => {
        fetchFilings();
    }, [refreshTrigger]);

    return (
        <div className="card">
            <h2>All Filings</h2>
            {filings.length === 0 ? (
                <p className="empty-state">No filings submitted yet. Add one above to get started.</p>
            ) : (
                <table className="filing-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Shipment ID</th>
                            <th>Invoice No</th>
                            <th>Value</th>
                            <th>Items</th>
                             <th>Submitted On</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filings.map((filing, index) => (
                            <tr key={filing.id}>
                                <td>{index + 1}</td>
                                <td>{filing.shipment_id}</td>
                                <td>{filing.invoice_no}</td>
                                <td>₹{filing.value}</td>
                                <td>{filing.items}</td>
                                 <td>{new Date(filing.submission_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td>
                                   <span className={`status-badge ${ filing.status === 'SUBMITTED' ? 'status-submitted' :
                                    filing.status === 'FAILED' ? 'status-failed' : 'status-pending'}`}> {filing.status}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: '8px' }}>
                                    <button className="delete-btn" onClick={() => onEditClick(filing)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(filing.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FilingList;