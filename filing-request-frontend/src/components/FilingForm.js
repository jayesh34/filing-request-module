import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FilingForm({ onFilingSaved, editingFiling, onCancelEdit }) {
    const [formData, setFormData] = useState({
        shipment_id: '',
        invoice_no: '',
        value: '',
        items: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (editingFiling) {
            setFormData({
                shipment_id: editingFiling.shipment_id,
                invoice_no: editingFiling.invoice_no,
                value: editingFiling.value,
                items: editingFiling.items
            });
        } else {
            setFormData({ shipment_id: '', invoice_no: '', value: '', items: '' });
        }
    }, [editingFiling]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.shipment_id || !formData.invoice_no || !formData.value || !formData.items) {
            setError('Shipment ID, Invoice No, Value, and Items are required');
            return;
        }
         if (Number(formData.value) <= 0) {
        setError('Value must be a positive number');
        return;
    }

        try {
            if (editingFiling) {
                await axios.put(`http://localhost:5000/api/filings/${editingFiling.id}`, {
                    ...formData,
                    status: editingFiling.status
                });
            } else {
                await axios.post('http://localhost:5000/api/filings', formData);
            }

            setFormData({ shipment_id: '', invoice_no: '', value: '', items: '' });
            onFilingSaved();
        } catch (err) {
            setError(err.response?.data?.error || 'Error saving filing');
        }
    };

    return (
        <div className="card">
            <h2>{editingFiling ? 'Edit Filing' : 'New Filing Request'}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                {error && <p className="error-banner">{error}</p>}

                <div className="form-field">
                    <label>Shipment ID</label>
                    <input type="text" name="shipment_id" value={formData.shipment_id} onChange={handleChange} placeholder="SHIP-1042" />
                </div>

                <div className="form-field">
                    <label>Invoice Number</label>
                    <input type="text" name="invoice_no" value={formData.invoice_no} onChange={handleChange} placeholder="INV-0088" />
                </div>

                <div className="form-field">
                    <label>Value (INR)</label>
                    <input type="number" name="value" value={formData.value} onChange={handleChange} placeholder="50000" />
                </div>

                <div className="form-field">
                    <label>Items</label>
                    <input type="text" name="items" value={formData.items} onChange={handleChange} placeholder="Electronics, Cables" />
                </div>

                <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                    <button type="submit" className="submit-btn">
                        {editingFiling ? 'Update Filing' : 'Submit Filing'}
                    </button>
                    {editingFiling && (
                        <button type="button" className="delete-btn" onClick={onCancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default FilingForm;