const db = require('../db');

const simulateEdiSubmission = (filingId, invoiceNo) => {
    const isSuccess = Math.random() > 0.15;
    const outcome = isSuccess ? 'SUBMITTED' : 'FAILED';
    console.log(`[EDI Webhook Simulation] Filing ID: ${filingId}, Invoice: ${invoiceNo} — sending dummy submission to EDI system...`);
    console.log(`[EDI Webhook Simulation] Response: ${isSuccess ? 'ACK received' : 'NACK - submission rejected'} (simulated) — Timestamp: ${new Date().toISOString()}`);
    return outcome;
};

// Helper: logs every status change into filing_history
const logStatusChange = async (filingId, oldStatus, newStatus) => {
    await db.query(
        'INSERT INTO filing_history (filing_id, old_status, new_status) VALUES (?, ?, ?)',
        [filingId, oldStatus, newStatus]
    );
};

// 1. Create a filing — now starts as DRAFT, no EDI call yet
const createFiling = async (req, res) => {
    try {
        const { shipment_id, invoice_no, value, items } = req.body;

        if (!shipment_id || !invoice_no || !value || !items) {
            return res.status(400).json({ error: 'Shipment ID, Invoice No, Value, and Items are required' });
        }
        if (isNaN(value) || Number(value) <= 0) {
            return res.status(400).json({ error: 'Value must be a positive number' });
        }

        const [existing] = await db.query('SELECT id FROM filings WHERE invoice_no = ?', [invoice_no]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'A filing with this Invoice Number already exists' });
        }

        const [result] = await db.query(
            'INSERT INTO filings (shipment_id, invoice_no, value, items, status) VALUES (?, ?, ?, ?, ?)',
            [shipment_id, invoice_no, value, items, 'DRAFT']
        );

        await logStatusChange(result.insertId, null, 'DRAFT');

        res.status(201).json({ message: 'Filing created as draft', filingId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Staff submits a DRAFT filing for internal review
const submitForReview = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        if (rows[0].status !== 'DRAFT' && rows[0].status !== 'REJECTED') {
            return res.status(400).json({ error: 'Only DRAFT or REJECTED filings can be submitted for review' });
        }

        await db.query('UPDATE filings SET status = ? WHERE id = ?', ['UNDER_REVIEW', id]);
        await logStatusChange(id, rows[0].status, 'UNDER_REVIEW');

        res.status(200).json({ message: 'Filing submitted for internal review' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Reviewer approves — triggers the EDI simulation
const approveFiling = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        if (rows[0].status !== 'UNDER_REVIEW') {
            return res.status(400).json({ error: 'Only filings under review can be approved' });
        }

        const finalStatus = simulateEdiSubmission(id, rows[0].invoice_no);
        await db.query('UPDATE filings SET status = ? WHERE id = ?', [finalStatus, id]);
        await logStatusChange(id, 'UNDER_REVIEW', finalStatus);

        res.status(200).json({ message: `Filing approved and submitted to EDI — outcome: ${finalStatus}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Reviewer rejects — with a reason
const rejectFiling = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        const [rows] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        if (rows[0].status !== 'UNDER_REVIEW') {
            return res.status(400).json({ error: 'Only filings under review can be rejected' });
        }

        await db.query('UPDATE filings SET status = ?, rejection_reason = ? WHERE id = ?', ['REJECTED', rejection_reason || 'No reason provided', id]);
        await logStatusChange(id, 'UNDER_REVIEW', 'REJECTED');

        res.status(200).json({ message: 'Filing rejected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllFilings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM filings ORDER BY submission_date ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFilingById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        const [items] = await db.query('SELECT * FROM filing_items WHERE filing_id = ?', [id]);
        const [history] = await db.query('SELECT * FROM filing_history WHERE filing_id = ? ORDER BY changed_at ASC', [id]);
        res.status(200).json({ ...rows[0], items, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateFiling = async (req, res) => {
    try {
        const { id } = req.params;
        const { shipment_id, invoice_no, value, items } = req.body;

        const [existing] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        if (isNaN(value) || Number(value) <= 0) {
            return res.status(400).json({ error: 'Value must be a positive number' });
        }

        await db.query(
            'UPDATE filings SET shipment_id = ?, invoice_no = ?, value = ?, items = ? WHERE id = ?',
            [shipment_id, invoice_no, value, items, id]
        );

        res.status(200).json({ message: 'Filing updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteFiling = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        await db.query('DELETE FROM filings WHERE id = ?', [id]);
        res.status(200).json({ message: 'Filing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Add a line item to a filing
const addFilingItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, hs_code, quantity, unit_value } = req.body;

        if (!item_name || !quantity || !unit_value) {
            return res.status(400).json({ error: 'item_name, quantity, and unit_value are required' });
        }

        const [result] = await db.query(
            'INSERT INTO filing_items (filing_id, item_name, hs_code, quantity, unit_value) VALUES (?, ?, ?, ?, ?)',
            [id, item_name, hs_code || null, quantity, unit_value]
        );

        res.status(201).json({ message: 'Item added', itemId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createFiling, getAllFilings, getFilingById, updateFiling, deleteFiling,
    submitForReview, approveFiling, rejectFiling, addFilingItem
};