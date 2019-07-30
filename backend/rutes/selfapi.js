const express = require("express");
const SelfApiController = require("../controllers/selfapi");

const router = express.Router();

router.post('/add_grups', SelfApiController.addGrups);
router.post('/delete_grups', SelfApiController.deleteGrups);
router.post('/get_grup_info', SelfApiController.getGrupInfo);
router.post('/add_alumne_grup', SelfApiController.addAlumneGrup);
router.post('/delete_alumnes_grup', SelfApiController.deleteAlumnesGrup);
router.post('/add_professor_assignatura', SelfApiController.addProfeAssignatura);
router.post('/delete_professors_assignatura', SelfApiController.deleteProfesAssignatura);
router.post('/add_assignatura', SelfApiController.addAssignatura);
router.post('/delete_assignatura', SelfApiController.deleteAssignatura);
router.get('/getlvminfo', SelfApiController.getLvmInfo);
router.post('/get_minuts_consumits', SelfApiController.getMinutsConsumits);
router.post('/get_grups_assignatura', SelfApiController.getGrupsAssignatura);
router.get('/add_usuari', SelfApiController.addUsuari);
router.post('/valida_usuari', SelfApiController.validaUsuari);
router.post('/get_alumnes_names', SelfApiController.getAlumnesNames);
router.post('/get_perfil_usuari', SelfApiController.getPerfilUsuari);
router.post('/get_assignatures_profe', SelfApiController.getAssignaturesProfessor);
router.post('/test_user_pgina_validation', SelfApiController.testUserPginaValidation);
router.post('/mod_grup', SelfApiController.modifyGrup);
router.post('/get_logs', SelfApiController.getLogs);
module.exports = router;
