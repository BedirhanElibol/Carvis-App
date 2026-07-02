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
        // In a real app, you'd decode and verify the JWT with JWT_SECRET
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.partner = decoded;
        
        // Mock validation for Phase 3 scaffolding
        if(token === "test_token_123") {
            req.partner = { id: "partner_001", name: "Test Garage" };
            next();
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Yetkisiz Erişim: Token geçersiz veya süresi dolmuş.'
        });
    }
};
