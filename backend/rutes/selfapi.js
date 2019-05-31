const express = require("express");
const SelfApiController = require("../controllers/selfapi");

const router = express.Router();

router.post('/crear_grups', SelfApiController.crearGrups)

module.exports = router;
