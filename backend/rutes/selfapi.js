const express = require("express");
const SelfApiController = require("../controllers/selfapi");

const router = express.Router();

router.post('/crea_grups', SelfApiController.crearGrups);
router.post('/esborra_grups', SelfApiController.esborrarGrups);
router.post('/add_alumne_grup', SelfApiController.addAlumneGrup);
router.post('/add_professor_assignatura', SelfApiController.addProfeAssignatura);
router.post('/delete_professors_assignatura', SelfApiController.deleteProfesAssignatura);
router.post('/delete_alumnes_grup', SelfApiController.deleteAlumnesGrup);
router.post('/add_assignatura', SelfApiController.addAssignatura);
router.get('/getlvminfo', SelfApiController.getLvmInfo);
router.post('/get_minuts_consumits', SelfApiController.getMinutsConsumits);
router.post('/get_grups_assignatura', SelfApiController.getGrupsAssignatura);

module.exports = router;
