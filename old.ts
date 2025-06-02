import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import UserRoute from './src/routes/User';
import Payment from './src/routes/Payment';
import Upload from './src/routes/UploadS3Routes';
import Admin from './src/routes/Admin';
import Report from './src/routes/Report';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';

const crypto = require('crypto');

const secret_key = '1234567890';
const app = express();
dotenv.config();

app.use(express.json());

mongoose.connect(
    'mongodb+srv://moremanoj0123:Mannoj123@cluster0.gb2e40h.mongodb.net/runanubhanvishwavivah', //Please put your database url here
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

/** Server start only if mongoDB connected */
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
    'Access-Control-Allow-Header',
    'Origin, X-Requested-With,Content-Type,Accept,Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
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

app.get('/ping', (res: express.Response) => {
  return res.json({ message: 'HealthCheck' });
});

app.use((req: express.Request, res: express.Response) => {
  res.status(404).send('Not found');
});

app.use((err: any, req: express.Request, res: express.Response) => {
  res.status(err.status || 500).send('Internal server error');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
