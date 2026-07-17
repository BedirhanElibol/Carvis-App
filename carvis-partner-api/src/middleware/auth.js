import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Yetkisiz Erişim: Geçerli bir Bearer Token sağlanmadı.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'carvis_secure_development_jwt_secret_key_2026';
        
        // Developer back-channel test bypass (only allowed in non-production)
        if (process.env.NODE_ENV !== 'production' && token === 'test_token_123') {
            console.warn('[SECURITY WARNING] Mock bypass token used in development environment.');
            req.partner = { id: 'partner_001', name: 'Test Garage', role: 'partner' };
            return next();
        }

        const decoded = jwt.verify(token, secret);
        req.partner = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Yetkisiz Erişim: Token geçersiz veya süresi dolmuş.'
        });
    }
};
