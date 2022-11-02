var dbconfig = require('../mysqlconn');
const shell = require('shelljs');
/* var LDAP = require('ldap-client');

var ldap = new LDAP({
    uri:             'ldap://montblanc.uab.es',   // string
    validatecert:    false,             // Verify server certificate
    connecttimeout:  -1,                // seconds, default is -1 (infinite timeout), connect timeout
    base:            'o=sids',          // default base for all future searches
    attrs:           '*',               // default attribute list for future searches
    filter:          '(objectClass=*)', // default filter for all future searches
    scope:           LDAP.SUBTREE,      // default scope for all future searches
}, function(err) {
    // connected and ready
}); */

/**
 *
 * @param {logEntry: = {
    niu: Usuari que fa l'acció,
    accio: nom de la funció,
    parametres: parametres de la funció, generalment req.body,
    resposta: resposta de la funció,
    resultat: success | error
  };
 * } logEntry
 */

function insertaLog (logEntry) {
  console.log("\nInsertaLog");
  console.log(logEntry);


  dbconfig.connection.query( //Afegir log
    "INSERT INTO `logs` (`usuari`, `accio`, `parametres`, `resultat`, `resposta`) " +
    'VALUES ("'+logEntry.niu+'", "'+logEntry.accio+'",\''+logEntry.parametres+'\', "'+logEntry.resultat+'", "'+logEntry.resposta+'");',
    (errorinsert, result) =>{

      if (!errorinsert){
        console.log("Log insertat correctament.");
      } else {
        console.log("Error al insertar Log");
        console.log(errorinsert);
      }
    });
}

/**
 *
 * @param {*} username: Nom d'usuari
 * @param {*} callback: Funció per tornar true/false
 */
function checkUsernameExists(username, callback) {
  const { stdout, stderr, code } = shell.exec('ldapsearch -x -b "ou=apps,o=sids" -D "cn=proxycc,ou=cc,ou=users,o=sids" -w proxy135 -H ldaps://montblanc.uab.es -L "(uid='+username+')"', {silent: true});

      if (stdout) {
        if (stdout.includes('numEntries:')) {
          callback(true);
          return;
        }
        else {
          callback(false);
          return;
        }
      }
      callback(false);
}


/**
 * Request:
 *  alumnes: Array d'alumnes
 *
 * Resposta:
 * [ {
  *
      cn: [ 'NOMBRE1' ],
      sn: [ 'APELLIDOS1' ],
      dn: 'uid=NIU1,ou=CC,ou=Users,o=sids'
    },
    {
      cn: [ 'NOMBRE2' ],
      sn: [ 'APELLIDOS2' ],
      dn: 'uid=NIU2,ou=CC,ou=Users,o=sids'
    }
  ]

 */

exports.getAlumnesNames = (req, res) => {

  console.log("\nBusca Noms Alumnes!");
  console.log(req.body);

  arrayAlu = [];

  req.body.alumnes.forEach(alumne => {
    const { stdout, stderr, code } = shell.exec('ldapsearch -x -b "ou=apps,o=sids" -D "cn=proxycc,ou=cc,ou=users,o=sids" -w proxy135 -H ldaps://montblanc.uab.es -L "(uid='+alumne.niu+')" sn cn | grep "dn:\\|sn:\\|cn:"', {silent: true});

      if (stdout) {
        lines = stdout.split('\n');

        var userObj = {
                dn:'',
                sn:[],
                cn:[]
        };
        for(var line = 0; line<lines.length;line++){

          const partes = lines[line].split(':');
          if(lines[line].includes("dn:")){
                  const dn = lines[line].split(':')[1].trim();
                  userObj.dn=dn;
          }
          if(lines[line].includes("sn:")){
            sn ='';
            if (partes.length === 3 ){
              //Assumim que llavors está codificat en Base64 per accents
              sn = ':' + lines[line].split(':')[2];
              sn = Buffer.from(sn, 'base64').toString();
            } else {
              sn = lines[line].split(':')[1].trim();
            }

            userObj.sn[0]=sn;

          }
          if(lines[line].includes("cn:")){
            cn ='';
            if (partes.length === 3 ){
              //Assumim que llavors está codificat en Base64 per accents
              cn = ':' + lines[line].split(':')[2];
              cn = Buffer.from(cn, 'base64').toString();
            } else {
              cn = lines[line].split(':')[1].trim();
            }

            userObj.cn[0]=cn

          }

        }
        arrayAlu.push(userObj);
      }
  });
  res.status(200).json(arrayAlu);
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  assignatura
 *  quantitat de grups
 *  quotaMin
 *  quotaFisica
 *  unitatsQuota
 *
 * Response:
 * {
 *    problemes:
 *              0 => Tot ok (codi 200)
 *              numero de grups amb problemes (codi 521)
 *             -1 => problema script / problema amb la BBDD (codi 520)
 *                   no s'ha pogut crear cap grup
 *
 *    grups:
 *             [{codi, message, json}] => array de missatges de grups amb problemes
 *             [{message: }] => altres
 * }
 */
exports.addGrups = (req, res) => {
  console.log("\nInsertar grups!");
  console.log(req.body);

  var logEntry = {
    niu: req.body.username,
    accio: 'addGrups',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  dbconfig.connection.query( //Busquem el max ordre del grup
    "SELECT MAX(ordre) as max FROM grups WHERE assignatura_id="+req.body.assignatura.id,
    (errorMax, maxGrup) =>{

      if (!errorMax){
        dbconfig.connection.query( //Busquem els profes del grup
          "SELECT niu FROM professors WHERE assignatura_id="+req.body.assignatura.id,
          (errorProf, nius) =>{
            if(!errorProf){
              nomGrups=[];
              arrayGrups=[]; // Per obtenir després l'ordre segon el nom del grup tornat
              niusProfes=[];
              max = 0;
              valuesInsert=[];

              if (maxGrup[0].max!=null){
                max=parseInt(maxGrup[0].max);
              }

              for (i=1; i<=req.body.quantitat; i++){
                nom = req.body.assignatura.codi+"-g"+ (max+i);
                arrayGrups[nom] = {
                  ordre: (max+i)
                };

                nomGrups.push(nom);
              }
              console.log("Crear "+ req.body.quantitat+" grups començant per " + max);
              console.log("Grups: " + nomGrups.join(' '));
              console.log("GrupsArray: ", arrayGrups);

              nius.forEach(element => {
                niusProfes.push(element.niu);
              });

              console.log("Profes: " + niusProfes.join(' '));
              console.log("Creació de grups!");

              shell.exec('sudo /usr/local/sbin/ganesha-add-grups ' + req.body.assignatura.codi +
                         ' "' + nomGrups.join(' ') + '" ' +
                         '"' + niusProfes.join(' ') + '" ' +
                         req.body.quotaFisica + req.body.unitatsQuota, {silent: true}, function(code, stdout, stderr){

                if (stdout) {
                  console.log("Stdout", stdout);
                  var resultjson = '';
                  var grupsWithError = [];
                  try {
                    resultjson = JSON.parse(stdout);
                  } catch ( err) {
                    console.log("Error en la resposta de l'script ganesha-add-grups!");
                    const resposta = {problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-add-grups!"}]};
                    res.status(520).json(resposta);
                    logEntry.resultat = 'error';
                    logEntry.resposta = JSON.stringify(resposta);
                    insertaLog(logEntry);
                    return;
                  }
                  resultjson.forEach( grupElement => {

                    if(grupElement.codi == 200) {
                      valuesInsert.push("(" + req.body.assignatura.id + "," +
                                            "'" + grupElement.json.nomgrup + "'," +
                                            req.body.quotaMin + "," +
                                            arrayGrups[grupElement.json.nomgrup].ordre + ")");
                    } else {
                      grupsWithError.push(grupElement);
                    }
                  });

                  if (valuesInsert.length > 0) { // S'ha creat algun grup
                    sqlInsert= "INSERT INTO `grups` (assignatura_id,nom,quota,ordre) VALUES "+valuesInsert.join() +";";
                    console.log(sqlInsert);

                    // Insercio a la BBDD
                      dbconfig.connection.query( //Afegir grups
                      sqlInsert,
                      (errorIns, consulta) => {
                      if (!errorIns){
                        if (grupsWithError.length == 0) { // No hi ha cap error de creació de grups
                          res.status(200).json({problemes: 0, grups:[{message: 'Grups creats correctament!'}]});
                          logEntry.resultat = 'success';
                          logEntry.resposta = 'Grups creats correctament!';
                          insertaLog(logEntry);
                        } else {
                          const resposta = {problemes: grupsWithError.length, grups: grupsWithError};
                          res.status(521).json(resposta);
                          logEntry.resultat = 'error';
                          logEntry.resposta = JSON.stringify(resposta);
                          insertaLog(logEntry);
                        }
                      } else {
                        const resposta = {problemes: valuesInsert.length, grups: [{message: "No ha estat possible insertar els grups a la BBDD!"}]};
                        res.status(520).json(resposta);
                        logEntry.resultat = 'error';
                        logEntry.resposta = JSON.stringify(resposta);
                        insertaLog(logEntry);
                      }
                    });
                  } else {
                    console.log("Error: No s'ha pogut crear cap grup!");
                    res.status(520).json({problemes: -1, grups: [{message: "Error: No ha estat possible crear cap grup!"}]});
                    logEntry.resultat = 'error';
                    logEntry.resposta = "No ha estat possible crear cap grup!";
                    insertaLog(logEntry);
                    return;
                  }
                }
              });
            }
          }
        );
      }
    }
  )
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  grups: llista en format array de grups
 *  assigCodi: codi de l'assignatura
 *
 * Response:
 * {
 *    problemes:
 *              0 => Tot ok (codi 200)
 *              numero de grups amb problemes (codi 521)
 *             -1 => problema script / problema amb la BBDD (codi 520)
 *                   no s'ha pogut crear cap grup
 *
 *    grups:
 *             [{codi, message, json}] => array de missatges de grups amb problemes
 *             [{message: }] => altres
 * }
 *
 */

exports.deleteGrups = (req, res) => {
  console.log("\nEsborrar grups!");
  console.log(req.body);

  logEntry = {
    niu: req.body.username,
    accio: 'deleteGrups',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  grupsId = [];
  nomGrups = [];
  arrayGrups = []; // Array amb els grups identificats pel nom


  req.body.grups.forEach(element => {

/*      const nom = req.body.assigCodi + '-g' + element.ordre;
     nomGrups.push(nom);
     arrayGrups[nom]=element; */
    nomGrups.push(element.nom);
    arrayGrups[element.nom]=element;

  });

    const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-del-grups ' + req.body.assigCodi + ' "' +
    nomGrups.join(' ') + '" TRUE', {silent: true});

      if (stdout) {
        console.log("Stdout", stdout);
        var resultjson = '';
        grupsWithError = [];
        try {
          resultjson = JSON.parse(stdout);
        } catch ( err) {
          console.log("Error en la resposta de l'script ganesha-del-grups!");
          res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta script ganesha-del-grups!"}] });
          logEntry.resultat = 'error';
          logEntry.resposta = "Error en la resposta de l'script ganesha-del-grups!";
          insertaLog(logEntry);
          return;
        }
        console.log(arrayGrups);

        resultjson.forEach( grupElement => {
          console.log(grupElement);

          if(grupElement.codi == 200) {
            grupsId.push(arrayGrups[grupElement.json.nomgrup].id);
          } else {
            grupsWithError.push(grupElement);
          }
        });

        dbconfig.connection.query( //Esborrar grups
          "DELETE FROM `grups` WHERE id IN ("+grupsId.join()+");" ,
          (errorDel) =>{
            if (!errorDel){
              if (grupsWithError.length == 0) { // No hi ha cap error de creació de grups
                res.status(200).json({problemes: 0, grups:[{message: 'Grups esborrats correctament!'}]});
                logEntry.resultat = 'success';
                logEntry.resposta = 'Grups esborrats correctament!';
                insertaLog(logEntry);
              } else {
                const resultat = {problemes: grupsWithError.length, grups: grupsWithError};
                res.status(521).json(resultat);
                logEntry.resultat = 'error';
                logEntry.resposta = JSON.stringify(resultat);
                insertaLog(logEntry);
              }

            } else {
              const resultat = {problemes: grupsId.length, grups: [{message: "No ha estat possible esborrar els grups de la BBDD!"}]};
              res.status(520).json(resultat);
              logEntry.resultat = 'error';
              logEntry.resposta = JSON.stringify(resultat);
              insertaLog(logEntry);
            }
          });

      }

}

/**
 * Obtenir un grup amb el codi de la seva assignatura
 *
 * Request:
 *  id: grup_id
 *
 * Resposta:
 *  520 => message:
 *  200 => consulta: grup amb el codi de l'assignatura
 */

exports.getGrupInfo = (req, res) => {
  console.log("\nGet grup Info!");
  console.log(req.body);
  dbconfig.connection.query(
    'SELECT assignatures.codi, grups.* FROM `grups` INNER JOIN assignatures on assignatures.id = grups.assignatura_id ' +
    'WHERE grups.id=' + req.body.grup_id,
      (errorSel, consulta) => {
      if (!errorSel){
        res.status(200).json(consulta);
      } else {
        res.status(520).json({message: "No s'ha pogut consultar la info de grup!"});
      }
    });
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  alumne:
 *    id: number;
      niu: string;
      nom: string;
      grup_id: string;
 *  grupName: Nomcomplert del grup
 *  assigCodi: Codi de l'assignatura
 *
 *  * Resposta:
 *  message:
 *      ok => codi 200
 *      error => 520 problema amb l'script / insertar en BBDD / No existeix niu a LDAP
 *               501,502 problema al afegir l'alumne des de l'script
 */
exports.addAlumneGrup = (req, res) => {
  logEntry = {
    niu: req.body.username,
    accio: 'addAlumneGrup',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };
  console.log("\nAssignar usuari grup!");
  console.log(req.body);

  responseError = 200;
  responseMsj = 'Alumne afegit correctament!'

  arrayAlumnes = req.body.alumne.niu.split(',');

  for( var i = 0; i < arrayAlumnes.length; i++) {
    const niu = arrayAlumnes[i];

    const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-add-alumne-grup ' + niu.trim() + ' ' +
    req.body.assigCodi + ' ' + req.body.grupName, {silent: true});

    if (stdout) {
      console.log("Stdout", stdout);
      var resultjson = '';

      try {
        resultjson = JSON.parse(stdout);
      } catch ( err) {
        console.log("Error en la resposta de l'script ganesha-add-usuari-grup!");
        res.status(520).json({message: "Error en la resposta de l'script ganesha-add-usuari-grup!"});
        logEntry.resultat = 'error';
        logEntry.resposta = "Error en la resposta de l'script ganesha-add-usuari-grup!";
        insertaLog(logEntry);
        break;
      }


      switch (resultjson.codi){
        case 200:
            dbconfig.connection.query( //Afegir profe assignatura
              "INSERT INTO `alumnes` (`id`, `niu`, `nom`, `grup_id`) " +
              "VALUES (NULL, '"+niu.trim()+"', '"+req.body.alumne.nom+"','"+req.body.alumne.grup_id+"');",
              (errorinsert) =>{
                if (!errorinsert){
                  // res.status(200).json({message: resultjson.message});
                  logEntry.resultat = 'success';
                  logEntry.resposta = resultjson.message;
                  insertaLog(logEntry);
                } else {
                  // res.status(520).json({message: "No s'ha pogut insertar l'alumne a la BBDD"});
                  logEntry.resultat = 'error';
                  logEntry.resposta = "No ha estat possible insertar l'alumne a la BBDD";
                  insertaLog(logEntry);
                  responseError = 520;
                  responseMsj = "No s'ha pogut insertar l'alumne a la BBDD";
                  return;
                }
              });
          break;
        default:
            //res.status(resultjson.codi).json({message: resultjson.message});
            logEntry.resultat = 'error';
            logEntry.resposta = resultjson.message;
            console.log("ERROR: " + resultjson.message);
            insertaLog(logEntry);
            responseError = resultjson.codi;
            responseMsj = resultjson.message;
          break;
      }
    }

    if (responseError !== 200) {break;}
  }


  res.status(200).json({message: responseMsj});


}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  alumnes: llista d'alumnes
 *  grupName: nom del grup (carpeta)
 *  assigCodi: codi assignatura
 *  esborrarDades: true/false. Si no quedaran alumnes, s'ha d'esborrar el contingut de
 *                 la carpeta del grup.
 *
 *   Response:
 * {
 *    problemes:
 *              0 => Tot ok (codi 200)
 *              numero d'alumnes amb problemes (codi 521)
 *             -1 => problema script / problema amb la BBDD (codi 520)
 *                   no s'ha pogut esborrar cap alumne
 *
 *    alumnes:
 *             [{codi, message, json}] => array de missatges d'alumnes amb problemes
 *             [{message: }] => altres
 * }
 */

exports.deleteAlumnesGrup = (req, res) => {

  console.log("\nEsborrar alumnes grup!");
  console.log(req.body);

  logEntry = {
    niu: req.body.username,
    accio: 'deleteAlumnesGrup',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  alumnesNius = [];
  arrayAlumnes = [];
  alumnesIdToDel = [];

  req.body.alumnes.forEach(alumne => {
    const niu = alumne.niu
    alumnesNius.push(niu);
    //console.log(element.niu);

    arrayAlumnes['n'+niu] = alumne;
  });

  const esborrarDades = req.body.esborrarDades? 'TRUE':'FALSE';

  const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-del-alumnes-grup "' +
       alumnesNius.join(' ') + '" ' +
       req.body.assigCodi + ' ' +
       req.body.grupName + ' ' +
       esborrarDades, {silent: true});

    if (stdout) {
      console.log("Stdout", stdout);
      var resultjson = '';
      alumnesWithError = [];
      try {
        resultjson = JSON.parse(stdout);
      } catch ( err) {
        console.log("Error en la resposta de l'script ganesha-del-alumnes-grup!");
        res.status(520).json({problemes: -1, alumnes:[{message: "Error en la resposta de l'script ganesha-del-alumnes-grup!"}] });
        logEntry.resultat = 'error';
        logEntry.resposta = "Error en la resposta de l'script ganesha-del-alumnes-grup!";
        insertaLog(logEntry);
        return;
      }

      resultjson.forEach( alumneElement => {
        console.log('n'+alumneElement.json.usuario);
        console.log(arrayAlumnes['n'+alumneElement.json.usuario].id);
        if(alumneElement.codi == 200) {
          alumnesIdToDel.push(arrayAlumnes['n'+alumneElement.json.usuario].id);
        } else {
          alumnesWithError.push(alumneElement);
        }
      });

      console.log("alumnesIdToDel: ",alumnesIdToDel);
      console.log(arrayAlumnes);



      if (alumnesIdToDel.length > 0) {
        dbconfig.connection.query( //Esborrar profes
          "DELETE FROM `alumnes` WHERE id IN ("+alumnesIdToDel.join()+");" ,
          (errorDel) =>{
            if (!errorDel){
              if (alumnesWithError.length == 0) { // No hi ha cap error de creació de grups
                res.status(200).json({problemes: 0, alumnes:[{message: 'Alumnes esborrats correctament!'}]});
                logEntry.resultat = 'success';
                logEntry.resposta = 'Alumnes esborrats correctament!';
                insertaLog(logEntry);
              } else {
                res.status(521).json({problemes: alumnesWithError.length, alumnes: alumnesWithError});
                logEntry.resultat = 'error';
                logEntry.resposta = JSON.stringify({problemes: alumnesWithError.length, alumnes: alumnesWithError});
                insertaLog(logEntry);
              }
            } else {
              res.status(520).json({problemes: alumnesIdToDel.length, alumnes: [{message: "No s'ha pogut esborrar els alumnes de la BBDD!"}]});
              logEntry.resultat = 'error';
              logEntry.resposta = "No ha estat possible esborrar els alumnes de la BBDD!";
              insertaLog(logEntry);
            }
          });
      } else {
        console.log("Error: No s'ha pogut esborrar cap alumne!");
        res.status(520).json({problemes: -1, alumnes: [{message: "Error:  No s'ha pogut esborrar cap alumne!"}]});
        logEntry.resultat = 'error';
        logEntry.resposta = "No ha estat possible esborrar cap alumne";
        insertaLog(logEntry);
        return;
      }
    }
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  profes: llista de profes
 *
 *  assigCodi: codi assignatura
 *
 *  Response:
 * {
 *    problemes:
 *              0 => Tot ok (codi 200)
 *              numero de profes amb problemes (codi 521)
 *             -1 => problema script / problema amb la BBDD (codi 520)
 *                   no s'ha pogut esborrar cap professor
 *
 *    profes:
 *             [{codi, message, json}] => array de missatges de profes amb problemes
 *             [{message: }] => altres
 * }
 */

exports.deleteProfesAssignatura = (req, res) => {
  console.log("\nEsborrar profesors assignatura!");
  console.log(req.body);

  logEntry = {
    niu: req.body.username,
    accio: 'deleteProfesAssignatura',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  profesNius = [];
  arrayProfes = [];
  profesIdToDel = [];

  req.body.profes.forEach(profe => {
    const niu = profe.niu
    profesNius.push(niu);
    //console.log(element.niu);

    arrayProfes['n'+niu] = profe;
  });

  const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-del-profes-assignatura "' +
       profesNius.join(' ') + '" ' +
       req.body.assigCodi, {silent: true});

    if (stdout) {
      console.log("Stdout", stdout);
      var resultjson = '';
      profesWithError = [];
      try {
        resultjson = JSON.parse(stdout);
      } catch ( err) {
        console.log("Error en la resposta de l'script ganesha-del-profes-assignatura!");
        res.status(520).json({problemes: -1, profes:[{message: "Error en la resposta de l'script ganesha-del-profes-assignatura!"}] });
        logEntry.resultat = 'error';
        logEntry.resposta = "Error en la resposta de l'script ganesha-del-profes-assignatura!";
        insertaLog(logEntry);
        return;
      }

      resultjson.forEach( profeElement => {
        console.log('n'+profeElement.json.usuario);
        console.log(arrayProfes['n'+profeElement.json.usuario].id);
        if(profeElement.codi == 200) {
          profesIdToDel.push(arrayProfes['n'+profeElement.json.usuario].id);
        } else {
          profesWithError.push(profeElement);
        }
      });

      console.log("profeidtodel: ",profesIdToDel);
      console.log(arrayProfes);



      if (profesIdToDel.length > 0) {
        dbconfig.connection.query( //Esborrar profes
          "DELETE FROM `professors` WHERE id IN ("+profesIdToDel.join()+");" ,
          (errorDel) =>{
            if (!errorDel){
              if (profesWithError.length == 0) { // No hi ha cap error de creació de grups
                res.status(200).json({problemes: 0, profes:[{message: 'Professors esborrats correctament!'}]});
                logEntry.resultat = 'success';
                logEntry.resposta = 'Professors esborrats correctament!';
                insertaLog(logEntry);
              } else {
                const resultat = {problemes: profesWithError.length, profes: profesWithError};
                res.status(521).json(resultat);
                logEntry.resultat = 'error';
                logEntry.resposta = JSON.stringify(resultat);
                insertaLog(logEntry);
              }
            } else {
              const resultat = {problemes: profesIdToDel.length, profes: [{message: "No s'ha pogut esborrar els professors de la BBDD!"}]};
              res.status(520).json(resultat);
              logEntry.resultat = 'error';
              logEntry.resposta = JSON.stringify(resultat);
              insertaLog(logEntry);
            }
          });
      } else {
        console.log("Error: No s'ha pogut esborrar cap professor!");
        res.status(520).json({problemes: -1, profes: [{message: "Error:  No s'ha pogut esborrar cap professor!"}]});
        logEntry.resultat = 'error';
        logEntry.resposta = "Error:  No ha estat possible esborrar cap professor!";
        insertaLog(logEntry);
        return;
      }
    }

}

exports.getLvmInfo = (req, res) => {

  console.log("\nget LVM Info!");

  shell.exec('sudo /usr/local/sbin/ganesha-lvm-info ', {silent: true}, function(code, stdout, stderr){

    if (stdout) {

      const response = JSON.parse(stdout);

      res.status(response.codi).json(response);
    } else {
      res.status(500).json({message: "No s'ha pogut obtenir la informació del Volum"});
    }
  });

  //res.status(200).json(volinfo);


}

/**
 * Request:
 * {
 *  username: Usuari que fa la petició,
 *  assignaturaCodi,
 *  professor: { id: ,
            niu: ,
            nom: ,
            assignatura_id: }
 * }
 *
 * Resposta:
 *  message:
 *      ok => codi 200
 *      error => 520 problema amb l'script / insertar en BBDD / NIU no trobat LDAP
 *               501 problema al afegir el profe des de l'script
 */

exports.addProfeAssignatura = (req, res) => {

  console.log("\nAssignar profe a assignatura!");
  console.log(req.body);

  logEntry = {
    niu: req.body.username,
    accio: 'addProfeAssignatura',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };


  const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-add-profe-assignatura ' + req.body.professor.niu + " " +
  req.body.assignaturaCodi, {silent: true});

  if (stdout) {
    console.log("Stdout", stdout);
    var resultjson = '';

    try {
      resultjson = JSON.parse(stdout);
    } catch ( err) {
      console.log("Error en la resposta de l'script ganesha-add-profe-assignatura!");
      res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-add-profe-assignatura!"}] });
      logEntry.resultat = 'error';
      logEntry.resposta = "Error en la resposta de l'script ganesha-add-profe-assignatura!";
      insertaLog(logEntry);
      return;
    }


    switch (resultjson.codi){
      case 200:
          dbconfig.connection.query( //Afegir profe assignatura
            "INSERT INTO `professors` (`id`, `niu`, `nom`, `assignatura_id`) " +
            "VALUES (NULL, '"+req.body.professor.niu+"', '"+req.body.professor.nom+"','"+req.body.professor.assignatura_id+"');",
            (errorinsert) =>{
              if (!errorinsert){
                res.status(200).json({message: resultjson.message});
                logEntry.resultat = 'success';
                logEntry.resposta = resultjson.message;
                insertaLog(logEntry);
              } else {
                res.status(520).json({message: "No s'ha pogut insertar el professor a la BBDD"});
                logEntry.resultat = 'error';
                logEntry.resposta = "No ha estat possible insertar el professor a la BBDD";
                insertaLog(logEntry);
              }
            });
        break;
      default:
          res.status(stdjson.codi).json({message: stdjson.message});
          logEntry.resultat = 'error';
          logEntry.resposta = stdjson.message;
          console.log("ERROR: " + stdjson.message);
          insertaLog(logEntry);
        break;
    }

  }



}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  assignatura
 *
 * Resposta:
 *  message:
 *      ok => codi 200 => assignaturaId: Id de l'assignatura insertada
 *      error => 520 problema amb l'script / insertar en BBDD
 *               501 problema al afegir el assignatura des de l'script
 */

exports.addAssignatura = (req, res) => {

  console.log(req.body);
  console.log("\nadd Assignatura!");

  var logEntry = {
    niu: req.body.username,
    accio: 'addAssignatura',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };
  const assignatura = req.body.assignatura;

  if (assignatura.validapgina === true){
    assignatura.validapgina = 1;
  } else {
    assignatura.validapgina = 0;
  }

  const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-add-assignatura ' +
            assignatura.codi, {silent: true});

    if (stdout) {
        console.log("Stdout", stdout);

        const stdjson = JSON.parse(stdout);
        if (stdjson.codi == 200) {
          dbconfig.connection.query( //Afegir assignatura
            "INSERT INTO `assignatures` (`id`, `codi`, `nom`, `unitat_id`, `tamany`, `unitatstamany`, `validapgina`) " +
            "VALUES (NULL, '"+assignatura.codi+"', '"+assignatura.nom+"', 0, '"+assignatura.tamany+"', '', '"+assignatura.validapgina+"');",
            (errorinsert, result) =>{

              if (!errorinsert){
                res.status(200).json({message: stdjson.message, assignaturaId: result.insertId});
                logEntry.resultat = 'success';
                logEntry.resposta = 'Assignatura ' + assignatura.codi + ' creada correctament.';
                console.log("Assignatura " + assignatura.codi + " creada correctament.");
                insertaLog(logEntry);
              } else {
                res.status(520).json({message: "No s'ha pogut insertar l'assignatura en la BBDD"});
                logEntry.resultat = 'error';
                logEntry.resposta = "No ha estat possible insertar l'assignatura " + assignatura.codi + " en la BBDD.";
                console.log("ERROR: No s'ha pogut insertar l'assignatura " + assignatura.codi + " en la BBDD.");
                console.log(errorinsert);
                insertaLog(logEntry);
              }
            });
        } else {
          res.status(stdjson.codi).json({message: stdjson.message});
          logEntry.resultat = 'error';
          logEntry.resposta = stdjson.message;
          console.log("ERROR: " + stdjson.message);
          insertaLog(logEntry);
        }

    } else {
      console.log("Error en la resposta de l'script ganesha-add-assignatura!");
      res.status(520).json({message: "Error en la resposta de l'script ganesha-add-assignatura!"});
      logEntry.resultat = 'error';
      logEntry.resposta = "Error en la resposta de l'script ganesha-add-assignatura!";
      insertaLog(logEntry);
    }
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *  assignatura
 *
 * Resposta:
 *   message
 *
 */
exports.deleteAssignatura = (req, res) => {

  console.log("\ndelete Assignatura.");
  console.log(req.body);

  var logEntry = {
    niu: req.body.username,
    accio: 'deleteAssignatura',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };
  const assignatura = req.body.assignatura;

  console.log("Esborrant alumnes de assignatura " + assignatura.id);

  dbconfig.connection.query( //Esborrar alumnes dels grups BBDD
  "DELETE FROM `alumnes` WHERE grup_id IN ( SELECT id FROM grups WHERE assignatura_id="+assignatura.id+");",
  (errordeletealu, result) =>{

    if (errordeletealu === null){
      console.log("Esborrant grups de assignatura " + assignatura.id);
  
      dbconfig.connection.query( //Esborrar grups BBDD
      "DELETE FROM `grups` WHERE assignatura_id="+assignatura.id+";",
      (errordeletegrups, result) =>{
    
        if (errordeletegrups === null){

          console.log("Esborrant professors de assignatura " + assignatura.id);
  
          dbconfig.connection.query( //Esborrar professors BBDD
          "DELETE FROM `professors` WHERE assignatura_id="+assignatura.id+";",
          (errordeleteprofe, result) =>{
            if (errordeleteprofe === null){
              
              const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-del-assignatura ' + assignatura.codi + " " +
                "TRUE", {silent: true});
            
              if (stdout) {
                console.log("Stdout", stdout);
            
                const stdjson = JSON.parse(stdout);
            
                switch (stdjson.codi) {
                  case 200:
                      dbconfig.connection.query( //Esborrar assignatura BBDD
                        "DELETE FROM `assignatures` WHERE id="+assignatura.id+";",
                        (errordeleteAssig, result) =>{
            
                          if (!errordeleteAssig){
                            logEntry.resultat = 'success';
                            logEntry.resposta = 'Assignatura ' + assignatura.codi + ' esborrada correctament.';
                            console.log("Assignatura " + assignatura.codi + " esborrada correctament.");
                            insertaLog(logEntry);
                            res.status(200).json({message: stdjson.message, assignaturaId: result.insertId});
                          } else {
                            logEntry.resultat = 'error';
                            logEntry.resposta = "No ha estat possible esborrar l'assignatura " + assignatura.codi + " en la BBDD.";
                            console.log("ERROR: No s'ha pogut esborrar l'assignatura " + assignatura.codi + " en la BBDD.");
                            insertaLog(logEntry);
                            res.status(520).json({message: "No s'ha pogut esborrar l'assignatura en la BBDD"});
                          }
                        });
                    break;
                  case 505:
                      dbconfig.connection.query( //Esborrar assignatura BBDD
                        "DELETE FROM `assignatures` WHERE id="+assignatura.id+";",
                        (errordeleteAssig, result) =>{
            
                          if (!errordeleteAssig){
            
                            logEntry.resultat = 'success';
                            logEntry.resposta = 'Assignatura ' + assignatura.codi + ' esborrada correctament '+
                                                'tot i que la carpeta no existia!';
                            console.log("Assignatura " + assignatura.codi + " esborrada correctament.");
                            insertaLog(logEntry);
                            res.status(200).json({message: logEntry.resposta, assignaturaId: result.insertId});
                          } else {
                            logEntry.resultat = 'error';
                            logEntry.resposta = "No ha estat possible esborrar l'assignatura " + assignatura.codi + " en la BBDD.";
                            console.log("ERROR: No s'ha pogut esborrar l'assignatura " + assignatura.codi + " en la BBDD.");
                            insertaLog(logEntry);
                            res.status(520).json({message: "No s'ha pogut esborrar l'assignatura en la BBDD"});
                          }
                        });
                    break;
                  default:
                      res.status(stdjson.codi).json({message: stdjson.message});
                      logEntry.resultat = 'error';
                      logEntry.resposta = stdjson.message;
                      console.log("ERROR: " + stdjson.message);
                      insertaLog(logEntry);
                      break;
                }
            
              } else {
                console.log("Error en la resposta de l'script ganesha-del-assignatura!");
                res.status(520).json({message: "Error en la resposta de l'script ganesha-del-assignatura!"});
                logEntry.resultat = 'error';
                logEntry.resposta = "Error en la resposta de l'script ganesha-del-assignatura!";
                insertaLog(logEntry);
              }
            } else {
              console.log("Error al esborrar professors de l'assignatura!");
              res.status(520).json({message: "Error al esborrar professors de l'assignatura!"});
              logEntry.resultat = 'error';
              logEntry.resposta = "Error al esborrar professors de l'assignatura " + assignatura.id + "!";
              insertaLog(logEntry);
            }
          });
        } else {
          console.log("Error al esborrar grups de l'assignatura!");
          res.status(520).json({message: "Error al esborrar grups de l'assignatura!"});
          logEntry.resultat = 'error';
          logEntry.resposta = "Error al esborrar grups de l'assignatura " + assignatura.id + "!";
          insertaLog(logEntry);
        }
      });
    } else {
      console.log("Error al esborrar alumnes de l'assignatura!");
      res.status(520).json({message: "Error al esborrar grups de l'assignatura!"});
      logEntry.resultat = 'error';
      logEntry.resposta = "Error al esborrar alumnes de l'assignatura " + assignatura.id + "!";
      insertaLog(logEntry);
    }
  });

}


/**
 * Grups d'una assignatura
 *
 * Request:
 *  id: assignatura_id
 *
 * Resposta:
 *  520 => message:
 *  200 => conjunt de grups de l'assignatura + la quantitat d'alumnes que té cada grup
 */

exports.getGrupsAssignatura = (req, res) => {
  console.log("\nGet grups Assignatura!");
  console.log(req.body);
  dbconfig.connection.query( // Buscar Grups
      "SELECT grups.*, count(alumnes.id) as alumnes FROM grups LEFT JOIN alumnes on grups.id=alumnes.grup_id " +
      "WHERE assignatura_id="+req.body.id+" GROUP BY grups.id;",
      (errorSel, consulta) => {
      if (!errorSel){
        res.status(200).json({message: 'Fet!', consulta});
      } else {
        res.status(520).json({message: "No s'ha pogut consultar els grups de l'assignatura!"});
      }
    });
}



/**
 * Total de minuts ocupats pels grups d'una assignatura
 *
 * Request:
 *  id: assignatura_id
 */

exports.getMinutsConsumits = (req, res) => {
  console.log(req.body);
  console.log("Minuts ocupats Assignatura!");
  dbconfig.connection.query(
      "SELECT SUM(`quota`) as consumits FROM `grups` WHERE assignatura_id="+req.body.id+";",
      (errorSel, consulta) => {
      if (!errorSel){
        res.status(200).json({message: 'Fet!', consulta});
      } else {
        res.status(520).json({message: "No s'ha pogut consultar els minuts consumits!"});
      }
    });
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *
 * Resposta:
 *   200 => OK
 *   520 => error BBDD
 *   message
 *
 */

exports.addUsuari = (req, res) => {

  console.log("\nAfegir Usuari!");
  console.log(req.body);

  logEntry = {
    niu: req.body.username,
    accio: 'addUsuari',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  dbconfig.connection.query( //Afegir usuari
    "INSERT INTO `usuaris` (`id`, `niu`, `perfil_id`) " +
    "VALUES (NULL, 'Escriu Niu', '2');",
    (errorinsert) =>{
      if (!errorinsert){
        res.status(200).json({message: 'Fet!'});
        logEntry.resultat = 'success';
        logEntry.resposta = 'Usuari afegit correctament';
        insertaLog(logEntry);
      } else {
        res.status(520).json({message: "No s'ha pogut insertar l'usuari a la BBDD"});
        logEntry.resultat = 'error';
        logEntry.resposta = "No ha estat possible insertar l'usuari a la BBDD";
        insertaLog(logEntry);
      }

    });

}


/**
 * Verifica si l'usuari té permís per accedir i amb quin perfil
 *
 * Request:
 *  username
 *  passwd
 *
 * Response:
 *    status: success, error
 *    message: missatge d'error
 *    perfil: perfil de l'usuari
 */

exports.validaUsuari = (req, res) => {
  console.log(req.body);
  console.log("\nValida usuari!!!");
  dbconfig.connection.query(
      "SELECT usuaris.id as id, perfils.perfil FROM `perfils` LEFT JOIN `usuaris` ON perfils.id = usuaris.perfil_id " +
      "WHERE usuaris.niu='"+req.body.username+"';",
      (errorSel, perfils) => {
      if (!errorSel){
        console.log(perfils);
        if (perfils.length === 1) {
          res.status(200).json({status: 'success', message: 'Usuari validat correctament!', perfils});

        } else {

          dbconfig.connection.query(
            "SELECT niu FROM `alumnes` WHERE niu='"+req.body.username+"';",
            (errorSel, alumne) => {
              if(!errorSel) {
                if (alumne.length === 1) {

                  const { stdout, stderr, code } = shell.exec('sudo smbldap-usermod ' + 
                                                              "-N 'perico' " + 
                                                              "-S 'test test' " + 
                                                              '-M perico@autonoma.uab.cat ' +
                                                              req.body.username, {silent: true});

                  res.status(200).json({status: 'success', message: 'Usuari validat correctament!', perfils:[{perfil: 'alumne'}]});
        
                } else {
                  res.status(200).json({status: 'error', message: 'Aquest usuari no pot accedir a l\'aplicació', perfils});
                }
              } else {
                res.status(500).json({message: "No s'ha pogut consultar l'usuari!"});
              }
            });
        }

      } else {
        res.status(500).json({message: "No s'ha pogut consultar l'usuari!"});
      }
    });
}



/**
 * Verifica si l'usuari té permís per accedir i amb quin perfil
 *
 * Request:
 *  username
 *
 * Response:
    perfil
 */

exports.getPerfilUsuari = (req, res) => {
  console.log(req.body);
  console.log("\nGet Perfil Usuari!!!");
  dbconfig.connection.query(
      "SELECT perfils.perfil FROM `perfils` LEFT JOIN `usuaris` ON perfils.id = usuaris.perfil_id " +
      "WHERE usuaris.niu='"+req.body.username+"';",
      (errorSel, consulta) => {
      if (!errorSel){
        console.log(consulta);
        if (consulta.length === 1) {
          res.status(200).json({status: 'success', message: 'Usuari validat correctament!', perfils: consulta});

        } else {
          res.status(200).json({status: 'error', message: 'Aquest usuari no pot accedir a l\'aplicació', perfils: []});
        }

      } else {
        res.status(500).json({message: "No s'ha pogut consultar l'usuari!"});
      }
    });
}

/**
 * Busquem les assignatures d'un NIU
 *
 * Request:
 *  username
 *
 * Response:
    assignatures
 */

exports.getAssignaturesProfessor = (req, res) => {
  console.log("\nGet Assignatures Professor!");
  console.log(req.body);
  dbconfig.connection.query(
    'SELECT assignatures.* FROM `assignatures` JOIN `professors` ON assignatures.id=professors.assignatura_id ' +
    'WHERE professors.niu= ' + req.body.username +';',
      (errorSel, consulta) => {
      if (!errorSel){
        res.status(200).json(consulta);
      } else {
        res.status(520).json({message: "No s'ha pogut consultar les assignatures del professor!"});
      }
    });
}

/**
 * Comprovem si un usuari pot validar amb pgina.
 * Pensat per les màquines de la Redacció Integrada
 *
 * Request:
 *  username: Niu de l'alumne
 *
 * Response:
 *  200 => Validació OK. "\n"+req.body.username+"\nnom_complet\nemail_usuari\nadministradores\n"
 *  410 => Validació KO.
 */

exports.testUserPginaValidation = (req, res) => {
  if (req.body.username){

    dbconfig.connection.query(
      'SELECT alumnes.niu from ' +
      '`alumnes` JOIN `grups` ON alumnes.grup_id = grups.id ' +
      'JOIN `assignatures` ON assignatures.id = grups.assignatura_id ' +
      'WHERE assignatures.validapgina=1 AND alumnes.niu=' + req.body.username +';',
      function(error,result,fields){

        if (error) throw error;

        // console.log(result);

        if (result.length > 0){ //S'ha trobat l'alumne, per tant té permís
          res.status(200).send("\n"+req.body.username+"\nnom_complet\nemail_usuari\nadministradores\n");
        }else{
          res.status(401).send("\n");
        }

      });

    }else{
      res.status(401).send("\n");
    }
}

/**
 * Request:
 *  username: Usuari que fa la petició
 *    nomAssignatura,
 *    grupId,
 *    nomAnterior,
      nomNou,
      quotaMinuts,
      quotaFisica,
      unitatsQuota
 *
 * Resposta:
 *  message:
 *      ok => codi 200 => assignaturaId: Id de l'assignatura insertada
 *      error => 520 problema amb l'script / insertar en BBDD
 *               501 problema al afegir el assignatura des de l'script
 * TODO: Gestionar las unidades de quota desdel frontend K, M, G.... ?
 */

exports.modifyGrup = (req, res) => {
  console.log("\nModify Grup!");
  console.log(req.body);

  var logEntry = {
    niu: req.body.username,
    accio: 'modifyGrup',
    parametres: JSON.stringify(req.body),
    resposta: '',
    resultat: ''
  };

  const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-mod-grup ' + req.body.nomAssignatura + " " +
             req.body.nomAnterior + " " +
             req.body.nomNou + " " +
             req.body.quotaFisica + req.body.unitatsQuota, {silent: true});

    if (stdout) {
        console.log("Stdout", stdout);

        const stdjson = JSON.parse(stdout);
        if (stdjson.codi == 200) {
          dbconfig.connection.query( //Afegir assignatura
            "UPDATE `grups` SET " +
            "nom='"+req.body.nomNou+"', " +
            "quota="+req.body.quotaMinuts +
            " WHERE id=" + req.body.grupId + ";",
            (errorinsert, result) =>{

              if (!errorinsert){
                res.status(200).json({message: stdjson.message});
                logEntry.resultat = 'success';
                logEntry.resposta = 'Grup '+req.body.nomAnterior+' modificat correctament.';
                console.log('Grup '+req.body.nomAnterior+' modificat correctament.');
                insertaLog(logEntry);
              } else {
                console.log(errorinsert);

                res.status(520).json({message: "No s'ha pogut modificar el grup en la BBDD"});
                logEntry.resultat = 'error';
                logEntry.resposta = "No ha estat possible modificar el grup " + req.body.nomAnterior + " en la BBDD.";
                console.log("ERROR: No s'ha pogut modificar el grup " + req.body.nomAnterior + " en la BBDD.");
                insertaLog(logEntry);
              }
            });
        } else {
          res.status(stdjson.codi).json({message: stdjson.message});
          logEntry.resultat = 'error';
          logEntry.resposta = stdjson.message;
          console.log("ERROR: " + stdjson.message);
          insertaLog(logEntry);
        }

    } else {
      console.log("Error en la resposta de l'script ganesha-mod-grup!");
      res.status(520).json({message: "Error en la resposta de l'script ganesha-mod-grup!"});
      logEntry.resultat = 'error';
      logEntry.resposta = "Error en la resposta de l'script ganesha-mod-grup!";
      insertaLog(logEntry);
    }

}

/**
 * Busquem logs
 *
 * Request:
 *  {
      data,
      usuari,
      accio,
      resultat,
      limit,
      count
    };
 *
 * Response:
    Logs
 */

exports.getLogs = (req, res) => {
  console.log("\nGet logs!");
  console.log(req.body);

  filterArray = [];

  if (req.body.usuari != ''){
    filterArray.push("usuari LIKE '" + req.body.usuari + "'");
  }
  if (req.body.accio != ''){
    filterArray.push("accio LIKE '" + req.body.accio + "'");
  }
  if (req.body.resultat != ''){
    filterArray.push("resultat LIKE '" + req.body.resultat + "'");
  }

  whereClause ='';

  if (filterArray.length > 0) {
    whereClause = ' AND '+ filterArray.join(' AND ');
  }

  dbconfig.connection.query( // Comptem el total de rows per la paginacio
    "SELECT COUNT(id) as totalRows FROM `logs` WHERE DATE(timestamp) = '" + req.body.data + "'" + whereClause +";",
      (errorSel, cuenta) => {
      if (!errorSel){
        dbconfig.connection.query(// Agafem els diferents usuaris
          "SELECT distinct `usuari` FROM `logs` WHERE DATE(timestamp) = '" + req.body.data + "'" + whereClause + ";",
            (errorSel, usuaris) => {
            if (!errorSel){
              console.log(usuaris);

              dbconfig.connection.query(// Agafem els diferents accions
                "SELECT distinct `accio` FROM `logs` WHERE DATE(timestamp) = '" + req.body.data + "'" + whereClause + ";",
                  (errorSel, accions) => {
                  if (!errorSel){
                    dbconfig.connection.query(// Agafem els diferents resultats
                      "SELECT distinct `resultat` FROM `logs` WHERE DATE(timestamp) = '" + req.body.data + "'" + whereClause + ";",
                        (errorSel, resultats) => {
                        if (!errorSel){
                          dbconfig.connection.query(
                            "SELECT * FROM `logs` WHERE DATE(timestamp) = '" + req.body.data + "'" + whereClause +
                            " LIMIT " + req.body.count + "," + req.body.limit + ";",
                              (errorSel, consulta) => {
                              if (!errorSel){
                                res.status(200).json({
                                  totalRows: cuenta[0].totalRows,
                                  logs: consulta,
                                  usuaris,
                                  accions,
                                  resultats
                                });
                              } else {
                                res.status(520).json({message: "No s'ha pogut consultar els Logs!"});
                              }
                            });
                        } else {
                          res.status(520).json({message: "No s'ha pogut consultar els Logs!"});
                        }
                      });
                  } else {
                    res.status(520).json({message: "No s'ha pogut consultar els Logs!"});
                  }
                });
            } else {
              res.status(520).json({message: "No s'ha pogut consultar els Logs!"});
            }
          });

      } else {
        res.status(520).json({message: "No s'ha pogut consultar els Logs!"});
      }
    });
}

exports.getUserData = (username, callback) => {
  dbconfig.connection.query(
    "SELECT usuaris.id as id, perfils.perfil FROM `perfils` LEFT JOIN `usuaris` ON perfils.id = usuaris.perfil_id " +
    "WHERE usuaris.niu='"+username+"';",
    (errorSel, perfils) => {
    if (!errorSel){
      console.log(perfils);
      if (perfils.length === 1) {
       callback(200,perfils);

      } else {
        dbconfig.connection.query(
          "SELECT id, 'alumne' as perfil FROM `alumnes` where niu='"+username+"' ORDER BY `alumnes`.`id` ASC;",
          (errorSelAlu, perfilalu) => {
            if (!errorSelAlu){

              if (perfilalu.length >= 1) {
                callback(200,perfilalu);
         
               } else {
                 console.log(errorSelAlu);
                 callback(401);
               }
            }else {
              console.log(errorSelAlu);
              callback(500);
            }
          }
        );
      }

    } else {
      console.log(errorSel);

      callback(500);
    }
  });
}

/**
 * Verifica si el nom del gru ja s'ha fet servir
 *
 * Request:
 *  nomgrup
 *
 * Response:
    nomgrupexisteix: true / false
 */

exports.testNomGrum = (req, res) => {
  console.log("\ntestNomGrup!");
  console.log(req.body);

  nomgrup = req.body.nomgrup;

  const { stdout, stderr, code } = shell.exec('getent group ' + nomgrup, {silent: true});

  if (stdout){
    res.status(200).json({nomgrupexisteix: true});
  } else {
    res.status(200).json({nomgrupexisteix: false});
  }

}


function makePw(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.?#';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

/**
 * Fa canvi de password d'un alumne a ldap
 *
 * Request:
 *  username
 *
 * Response:
 *    status: success, error
 *    message: missatge d'error
 */

 exports.setPasswd = (req, res) => {
   var message ="";

  console.log("\nsetPasswd!!");

  var pw = makePw(9);

  var retObj = {
    status:"",
    message: ""
  }

  const { stdout, stderr, code } = shell.exec('echo "'+pw+'" | sudo smbldap-passwd -s -p ' + req.body.username, {silent: true});

  if (code == 0) {
    message = "Usuari activat correctament. Revisa el teu correu";
    const { stdout, stderr, codemail } = shell.exec('sudo smbldap-usershow '+req.body.username+' | grep mail | cut -d" " -f2 ' , {silent: true});
    const mail = stdout;
    if (mail.includes("@")){   
        //send mail
        var missatge = "";
        if (mail.includes("uab.cat")){
          missatge= "<HTML><BODY>" +
          "Al final d'aquest missatge trobar&agrave;s la teva contrasenya per accedir a les carpetes de Ganesha.<br>" +
          "<p><span style='font-weight: bold;'>En el cas del professorat</span>, a m&eacute;s dels ordinadors de les aules, l'acc&eacute;s es pot fer des d'ordinadors connectats per cable a la xarxa de la facultat (per exemple, el del vostre despatx). Tamb&eacute; des de casa, utilitzant l'aplicaci&oacute; de t&uacute;nel de la xarxa privada virtual (manual per configurar el t&uacute;nel <a href='https://si-respostes.uab.cat/inici/teletreball/xarxa-privada-virtual/servei-de-tunel'>aqu&iacute;</a> ). A m&eacute;s, podeu consultar el v&iacute;deo-tutorial d'&uacute;s de Ganesha <a href='https://uab-my.sharepoint.com/:v:/r/personal/1318095_uab_cat/Documents/Acces%20a%20Ganesha/Ganesha%20acces%20professorat.mp4?csf=1&web=1&e=2qcvfd'>aqu&iacute;</a>.</p>"+
          "La teva contrasenya &eacute;s:"+
          "<p style='font-weight: bold; font-size: 24px;'> " + pw + "</p><br></BODY></HTML>";
        } 
        if(mail.includes("autonoma.cat")){
           missatge= "<HTML><BODY>" +
          "Al final d'aquest missatge trobar&agrave;s la teva contrasenya per accedir a les carpetes de Ganesha.<br>" +
          "<p><span style='font-weight: bold;'>En el cas de l'alumnat</span>, l'acc&eacute;s a les carpetes es pot fer des dels ordinadors de la facultat (aules informatitzades, sales d'edici&oacute; o estudis de continu&iuml;tat), utilitzant la icona d'acc&eacute;s a Ganesha que hi ha a l'escriptori. Tamb&eacute; teniu un v&iacute;deo-tutorial de l'&uacute;s de Ganesha <a href='https://uab-my.sharepoint.com/:v:/r/personal/1318095_uab_cat/Documents/Acces%20a%20Ganesha/Ganesha%20acces%20alumnes.mp4?csf=1&web=1&e=SOvpbO'>aqu&iacute;</a>.</p>"+
          "La teva contrasenya &eacute;s:"+
          "<p style='font-weight: bold; font-size: 24px;'> " + pw + "</p><br></BODY></HTML>";
        }

        const capcaleres = '-a "From: sid.comunicacio@uab.cat" \
        -a "MIME-Version: 1.0" \
        -a "Content-Type: text/html" ';
        const { stdout, stderr, codesend } = shell.exec('echo "'+missatge+'" | mail -s "Contrasenya de Ganesha" ' + capcaleres + mail , {silent: true});
        retObj = {status: 'success', message: 'Missatge enviat. Revisa la teva bústia de correu!'};
    } else {
      retObj = {status: 'failed', message: "Ha hagut algun problema obtenint l'adreça de correu!"};
    }

  } else {
    retObj = {status: 'failed', message: "Ha hagut algun error activant l'usuari"};
  }

  console.log(retObj);
  res.status(200).send(retObj);
 }
