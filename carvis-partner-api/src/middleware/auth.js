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
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('[SECURITY ERROR] JWT_SECRET environment variable is not set.');
            return res.status(500).json({
                success: false,
                message: 'Server error: JWT_SECRET is not configured.'
            });
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
