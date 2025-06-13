// Simple server test to check if basic Express setup works
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.status(200).json({});
    }
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Test server is running!' });
});

app.get('/ping', (req, res) => {
    res.json({ message: 'Server is alive', timestamp: new Date().toISOString() });
});

// Test login endpoint without database
app.post('/user/login', (req, res) => {
    console.log('Login attempt received:', req.body);
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
        return res.status(200).json({
            success: 0,
            data: { message: 'Mobile number and password are required' }
        });
    }

    // Mock successful login for testing
    if (mobileNumber === '1234567890' && password === 'test123') {
        return res.status(200).json({
            success: 1,
            data: {
                token: 'mock-jwt-token-for-testing',
                message: 'Login successful'
            }
        });
    }

    return res.status(200).json({
        success: 0,
        data: { message: 'Invalid credentials' }
    });
});

const PORT = process.env.PORT || 8085;

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Test it at: http://localhost:${PORT}/ping`);
});
