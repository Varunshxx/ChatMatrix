import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('jwt', token,{
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });
    return token;
};
