const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const UserRoute = require('./src/routes/User');
const Payment = require('./src/routes/Payment');
const Upload = require('./src/routes/UploadS3Routes');
const Admin = require('./src/routes/Admin');
const Report = require('./src/routes/Report');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

const crypto = require('crypto');

const secret_key = '1234567890';
const app = express();
dotenv.config();

app.use(express.json());

mongoose.connect(
    'mongodb+srv://moremanoj0123:Mannoj123@cluster0.gb2e40h.mongodb.net/runanubhanvishwavivah', // Please put your database URL here
    {
        retryWrites: true,
        w: 'majority',
    },
)
    .then(() => {
        console.log('Connected to the MongoDB');
        startServer();
    })
    .catch(error => {
        console.log('error: ', error);
    });

/** Server start only if MongoDB connected */
const startServer = () => {
    app.use((req, res, next) => {
        console.log(
            `Incoming request from -> Method: [${req.method}] - Url: [${req.url}] - IP [${req.socket.remoteAddress}]`,
        );

        res.on('finish', () => {
            console.log(
                `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`,
            );
        });

        next();
    });
};

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());

/** Rules of our API */
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
    return res.send('Express Typescript on Vercel');
});

app.use('/user', UserRoute);
app.use('/pay', Payment);
app.use('/upload', Upload);
app.use('/admin', Admin);
app.use('/report', Report);

app.get('/ping', (req, res) => {
    return res.json({ message: 'HealthCheck' });
});

app.use((req, res) => {
    res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send('Internal server error');
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
