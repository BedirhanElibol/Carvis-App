import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get active jobs for the authenticated partner
router.get('/', requireAuth, async (req, res) => {
    try {
        // Mock data for Phase 3 scaffolding
        const mockJobs = [
            {
                id: "job_001",
                customer_name: "Ahmet Yılmaz",
                vehicle: "Toyota Corolla 2020",
                issue: "Akü Takviyesi",
                status: "PENDING",
                location: { lat: 41.0082, lng: 28.9784 },
                created_at: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            data: mockJobs,
            meta: {
                total_jobs: mockJobs.length,
                partner_id: req.partner.id
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update job status
router.patch('/:id/status', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. "IN_PROGRESS", "COMPLETED"

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        // Mock update
        res.json({
            success: true,
            message: `Job ${id} status updated to ${status}`,
            data: {
                id,
                status,
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
