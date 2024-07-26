const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

const users = [
  new User({
    username: 'manager',
    firstName: 'Taman',
    lastName: 'Dhawan',
    email: 'tamandhawan@gmail.com',
    password: '$2a$10$VwnlcEwWJ/w8oknZLw9DcuL2zx.xNgv2c9BflynVWRubEZNnSyaaS', //Ankit$hah1910
    role: 'manager',
    status: 'active',
    avatar: '',
    contactNumber: '',
  }),
];

const db = process.env.MONGO_URI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .catch((err) => {
    console.log(err.stack);
    // process.exit(1);
  })
  .then(() => {
    console.log('connected to db');
  });

users.map(async (p, index) => {
  await p.save((err, result) => {
    if (index === users.length - 1) {
      console.log('DONE!');
      mongoose.disconnect();
    }
  });
});
