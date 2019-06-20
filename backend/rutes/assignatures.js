const express = require("express");
const AssignaturesController = require("../controllers/assignatures");

const router = express.Router();

router.post('', AssignaturesController.crearAssignatura);
router.get('', AssignaturesController.getAssignatures);

module.exports = router;
