/* Create database connetion */
var mysql = require('mysql');

var mysqlOptions = {
  host:'localhost',
  user:'root',
  password:'',
  database:'ganesha'
};

/* var mysqlOptions = {
  host:'minerva.ccomunicacio',
  user:'desa_ganesha',
  password:'O9VS5OYU1TmB2gdz',
  database:'desa_ganesha'
}; */

var connection=mysql.createPool(mysqlOptions);

/* Setting parameters for API url customization */
var settingOptions = {
    apiURL:'api', // Custom parameter to create API urls
    paramPrefix:'_' // Parameter for field seperation in API url
};

/* Setting options to handle cross origin resource sharing issue */
var corsOptions = {
  origin: "*", // Website you wish to allow to connect
  methods: "GET, POST, PUT, DELETE", // Request methods you wish to allow
  preflightContinue: false,
  optionsSuccessStatus: 200,
  allowedHeaders: "Content-Type, access-control-allow-origin, Authorization",
  credentials: true // Set to true if you need the website to include cookies in the requests sent,

};




module.exports={connection, settingOptions, corsOptions};
