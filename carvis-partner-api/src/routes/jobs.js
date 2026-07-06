import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Helper to standardise job format
const formatJob = (job, type) => ({
    id: job.id,
    type: type, // 'SERVICE' or 'EMERGENCY'
    customer_id: job.user_id,
    title: job.title || job.issue_type || 'Bilinmeyen Talep',
    description: job.description || 'Açıklama yok',
    status: job.status,
    budget: job.budget || null,
    location: job.location || null, // Assuming JSONB {lat, lng} if exists
    created_at: job.created_at
});

// Get active jobs for the authenticated partner
router.get('/', requireAuth, async (req, res) => {
    try {
        // Fetch Service Requests (Tenders/Maintenance)
        const { data: serviceReqs, error: sErr } = await supabase
            .from('service_requests')
            .select('*')
            .in('status', ['pending', 'open']);
            
        if (sErr) throw sErr;

        // Fetch Emergency Requests (SOS)
        const { data: emergencyReqs, error: eErr } = await supabase
            .from('emergency_requests')
            .select('*')
            .eq('status', 'pending');
            
        if (eErr) throw eErr;

        // Combine and format
        const formattedServices = (serviceReqs || []).map(j => formatJob(j, 'SERVICE'));
        const formattedEmergencies = (emergencyReqs || []).map(j => formatJob(j, 'EMERGENCY'));
        
        // Sort by newest first
        const allJobs = [...formattedServices, ...formattedEmergencies].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({
            success: true,
            data: allJobs,
            meta: {
                total_jobs: allJobs.length,
                emergency_count: formattedEmergencies.length,
                service_count: formattedServices.length,
                partner_id: req.partner.id
            }
        });
    } catch (error) {
        console.error("GET /jobs Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update job status (Accepting or Completing a job)
router.patch('/:id/status', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, type } = req.body; // type must be 'SERVICE' or 'EMERGENCY'

        if (!status || !type) {
            return res.status(400).json({ success: false, message: 'Status and Type (SERVICE/EMERGENCY) are required' });
        }

        const tableName = type === 'EMERGENCY' ? 'emergency_requests' : 'service_requests';

        // Update in Supabase
        const { data, error } = await supabase
            .from(tableName)
            .update({ status: status.toLowerCase() }) // Supabase commonly uses lowercase statuses
            .eq('id', id)
            .select()
            .single();

        if (error) {
            // Check if it's a UUID syntax error or row not found
            throw error;
        }

        res.json({
            success: true,
            message: `Job ${id} status updated to ${status}`,
            data: data
        });

    } catch (error) {
        console.error("PATCH /jobs/status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
