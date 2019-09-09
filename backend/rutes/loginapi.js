const express = require("express");
const LoginApiController = require("../controllers/loginapi");

var cas = require('connect-cas');
var url = require('url');
var session = require('express-session');
var cookieParser = require('cookie-parser');

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

const router = express.Router();

router.get('/getUserData', cas.serviceValidate(), cas.authenticate(), LoginApiController.getUserData);
router.get('/login', cas.serviceValidate(), cas.authenticate(), LoginApiController.login);
router.get('/logout', LoginApiController.logout);

module.exports = router;
