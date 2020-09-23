const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const selfApiRoutes = require("./rutes/selfapi");
const loginApiRoutes = require("./rutes/loginapi");
var mysqlrestapi  = require('./mysql-restapi');
var dbconfig = require('./mysqlconn');
// const assignaturesRoutes = require('./rutes/assignatures');
// CAS
var cas = require('connect-cas');
var url = require('url');
var session = require('express-session');
var cookieParser = require('cookie-parser');

// Your CAS server's hostname

cas.configure({ 'host': 'sacnt.uab.cat', 'protocol': 'https',
paths: {
        validate: '/validate',
        serviceValidate: '/p3/serviceValidate', // CAS 3.0
        proxyValidate: '/p3/proxyValidate', // CAS 3.0
        proxy: '/proxy',
        login: '/login',
        logout: '/logout'
    }
});

const app = express();

app.use(cookieParser());
// Use cookie sessions for simplicity, you can use something else
//app.use(express.cookieParser('this should be random and secure'));
//app.use(express.cookieSession());
app.use(session({
	secret: 'FljhP)/&|a"N>0JDxzpDo0;Vx-u9vd3^#qDHCw6!(w73<hBmH;A+S`C^XJU8H',
        resave: false,
        saveUninitialized: true
	}
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', "GET , POST, PATCH, PUT , DELETE, OPTIONS");
  next();

})

// app.use('/api/crud/assignatures', assignaturesRoutes)

app.use('/api/crud/*', cas.serviceValidate(),(req, res, next) => {

  if (req.session.cas && req.session.cas.user) {
    next();
  } else {
      res.status(401).json({message: 'Usuari no valid!'})
  }

});

app.use("/api/crud/assignatures/:id", function(req, res, next) {
  if (req.body.validapgina == false) {
    req.body.validapgina = 0;
  }
  next();
});

var api = mysqlrestapi(app, dbconfig);

app.use("/loginapi", loginApiRoutes);
app.use("/selfapi", selfApiRoutes);

app.get('*',(req,res)=>{

  res.sendFile(__dirname+'/public/index.html');

});

module.exports = app;
