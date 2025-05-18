import jwt from 'jsonwebtoken';

const getTokenInfo = async (token) => {
    try {
        // Verifies and decodes the token
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

function generateToken(name, email, role,userId) {
    const token = jwt.sign({ name, email, role ,userId}, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

function generateTokenForTwoStepsAuth(email,userId) {
    const token = jwt.sign({ email,userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}
function getTokenForTwoStepsAuth(token) {
    const decoded =  jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}

export { generateToken, getTokenInfo,generateTokenForTwoStepsAuth,getTokenForTwoStepsAuth };
