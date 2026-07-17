import { requireAuth } from './middleware/auth.js';
import jwt from 'jsonwebtoken';

// Mock request and response helpers
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

const runTests = () => {
    console.log('============================================================');
    console.log('             CARVIS SECURITY AUDIT: EXPRESS API            ');
    console.log('============================================================');

    // Test Case 1: Missing authorization header
    {
        const req = { headers: {} };
        const res = mockResponse();
        let nextCalled = false;
        requireAuth(req, res, () => { nextCalled = true; });

        if (res.statusCode === 401 && !nextCalled) {
            console.log('[PASS] Case 1: Missing auth header blocked with 401.');
        } else {
            console.error('[FAIL] Case 1: Expected 401 block, got next=' + nextCalled);
        }
    }

    // Test Case 2: Invalid token
    {
        const req = { headers: { authorization: 'Bearer bad_token_xyz' } };
        const res = mockResponse();
        let nextCalled = false;
        requireAuth(req, res, () => { nextCalled = true; });

        if (res.statusCode === 401 && !nextCalled) {
            console.log('[PASS] Case 2: Invalid bearer token blocked with 401.');
        } else {
            console.error('[FAIL] Case 2: Expected 401 block for bad token, got next=' + nextCalled);
        }
    }

    // Test Case 3: Development bypass token (test_token_123)
    {
        process.env.NODE_ENV = 'development';
        const req = { headers: { authorization: 'Bearer test_token_123' } };
        const res = mockResponse();
        let nextCalled = false;
        requireAuth(req, res, () => { nextCalled = true; });

        if (nextCalled && req.partner && req.partner.id === 'partner_001') {
            console.log('[PASS] Case 3: Development bypass token accepted in non-production env.');
        } else {
            console.error('[FAIL] Case 3: Expected bypass token to succeed.');
        }
    }

    // Test Case 4: Real JWT verification
    {
        const secret = 'carvis_secure_development_jwt_secret_key_2026';
        process.env.JWT_SECRET = secret;
        const payload = { id: 'partner_002', name: 'Real Auto Shop', role: 'partner' };
        const token = jwt.sign(payload, secret);

        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockResponse();
        let nextCalled = false;
        requireAuth(req, res, () => { nextCalled = true; });

        if (nextCalled && req.partner && req.partner.id === 'partner_002') {
            console.log('[PASS] Case 4: Real signed JWT verified successfully.');
        } else {
            console.error('[FAIL] Case 4: Real signed JWT verification failed.');
        }
    }

    console.log('============================================================');
    console.log('             SECURITY VERIFICATION RUN COMPLETE             ');
    console.log('============================================================');
};

runTests();
