const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const selfApiRoutes = require("./rutes/selfapi");

var mysqlrestapi  = require('./mysql-restapi');
var dbconfig = require('./mysqlconn');
// const assignaturesRoutes = require('./rutes/assignatures');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', "GET , POST, PATCH, PUT , DELETE, OPTIONS");
  next();

})

app.use("/api/crud/assignatures/:id", function(req, res, next) {
  if (req.body.validapgina == false) {
    req.body.validapgina = 0;
  }
  next();
});

var api = mysqlrestapi(app, dbconfig);
app.use("/selfapi", selfApiRoutes);

app.get('*',(req,res)=>{

  res.sendFile(__dirname+'/public/index.html');

});

module.exports = app;
