const db = require('../db');
const simulateEdiSubmission = (filingId, invoiceNo) => {
    const isSuccess = Math.random() > 0.15; 
    const outcome = isSuccess ? 'SUBMITTED' : 'FAILED';

    console.log(`[EDI Webhook Simulation] Filing ID: ${filingId}, Invoice: ${invoiceNo} — sending dummy submission to EDI system...`);
    console.log(`[EDI Webhook Simulation] Response: ${isSuccess ? 'ACK received' : 'NACK - submission rejected'} (simulated) — Timestamp: ${new Date().toISOString()}`);

    return outcome;
};

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
            [shipment_id, invoice_no, value, items, 'PENDING']
        );

        const finalStatus = simulateEdiSubmission(result.insertId, invoice_no);
        await db.query('UPDATE filings SET status = ? WHERE id = ?', [finalStatus, result.insertId]);

        res.status(201).json({
            message: `Filing created and submitted to EDI — outcome: ${finalStatus}`,
            filingId: result.insertId,
            status: finalStatus
        });
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

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateFiling = async (req, res) => {
    try {
        const { id } = req.params;
        const { shipment_id, invoice_no, value, items, status } = req.body;

        const [existing] = await db.query('SELECT * FROM filings WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Filing not found' });
        }
      if (isNaN(value) || Number(value) <= 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
        }

        await db.query(
            'UPDATE filings SET shipment_id = ?, invoice_no = ?, value = ?, items = ?, status = ? WHERE id = ?',
            [shipment_id, invoice_no, value, items, status, id]
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

module.exports = { createFiling, getAllFilings, getFilingById, updateFiling, deleteFiling };