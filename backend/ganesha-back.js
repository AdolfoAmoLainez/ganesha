const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const selfApiRoutes = require("./rutes/selfapi");
const assignaturesRoutes = require('./rutes/assignatures');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', "GET , POST, PATCH, PUT , DELETE, OPTIONS");
  next();

})

app.use('/api/crud/assignatures', assignaturesRoutes)

app.use("/selfapi", selfApiRoutes);

module.exports = app;
