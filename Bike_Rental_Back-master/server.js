const express = require('express');
const cors = require('cors');
const compression = require('compression');
const csurf = require('csurf');
const path = require('path');

const connectDB = require('./db/db');

require('dotenv').config();

const app = express();

connectDB();

let secrets;

// Server static resources in production
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use(express.json({ extended: false }));
app.use(compression());
app.use(cors());
app.use((req, res, next) => {
  res.locals.secrets = secrets;
  next();
});

 if (process.env.NODE_ENV === 'production') {
   app.use(csurf());
   app.use((req, res, next) => {
     res.set('x-frame-options', 'DENY');
     res.cookie('mytoken', req.csrfToken());
     next();
   });
 }

app.get('/api/', (req, res) => res.send('API Running'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/user', require('./src/routes/user'));
app.use('/api/reservation', require('./src/routes/reservation'));
app.use('/api/bike', require('./src/routes/bike'));
app.use('/api/rating', require('./src/routes/rating'));

const PORT = process.env.PORT || 5000;

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
