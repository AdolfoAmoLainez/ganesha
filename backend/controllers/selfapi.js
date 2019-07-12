var dbconfig = require('../mysqlconn');
const shell = require('shelljs');
var LDAP = require('ldap-client');

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
});

/**
 * Request:
 *  alumnes: Array d'alumnes
 *
 * Resposta:
 * [ {
  *  uid: [ 'NIU1' ],
      displayName: [ 'NOMBRE1' ],
      dn: 'uid=NIU1,ou=CC,ou=Users,o=sids'
    },
    { uid: [ 'NIU2' ],
      displayName: [ 'NOMBRE2' ],
      dn: 'uid=NIU2,ou=CC,ou=Users,o=sids'
    }
  ]

 */

exports.getAlumnesNames = (req, res) => {

  console.log("\nBusca Noms Alumnes!");
  console.log(req.body);


  filtro = '(|';

  req.body.alumnes.forEach(alumne => {
    filtro += '(uid=' + alumne.niu + ')';
  });
  filtro += ')';

  ldap.bind({
    binddn: 'cn=proxyCC,ou=CC,ou=users,o=sids',
    password: 'proxy135'
},
(errBind) => {
  if (!errBind) {
     ldap.search({
                      base: 'o=sids',
                      scope: LDAP.SUBTREE,
                      filter: filtro,
                      attrs: 'cn, sn'
                    },
                    (err, data) => {
                      if (err) {
                        res.status(200).json([]);
                      } else {
                        res.status(200).json(data);
                      }

                    });
  }

});

}

/**
 * Request:
 *  assignatura
 *  quantitat de grups
 *  quota en Gb
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

              shell.exec('ganesha-add-grups ' + req.body.assignatura.codi +
                         ' "' + nomGrups.join(' ') + '" ' +
                         '"' + niusProfes.join(' ') + '"', {silent: true}, function(code, stdout, stderr){

                if (stdout) {
                  console.log("Stdout", stdout);
                  var resultjson = '';
                  var grupsWithError = [];
                  try {
                    resultjson = JSON.parse(stdout);
                  } catch ( err) {
                    console.log("Error en la resposta de l'script ganesha-add-grups!");
                    res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-add-grups!"}] });
                    return;
                  }
                  resultjson.forEach( grupElement => {

                    if(grupElement.codi == 200) {
                      valuesInsert.push("(" + req.body.assignatura.id + "," +
                                            req.body.quotaMin + "," +
                                            arrayGrups[grupElement.json.nomgrup].ordre + ")");
                    } else {
                      grupsWithError.push(grupElement);
                    }
                  });

                  if (valuesInsert.length > 0) { // S'ha creat algun grup
                    sqlInsert= "INSERT INTO `grups` (assignatura_id,quota,ordre) VALUES "+valuesInsert.join() +";";
                    console.log(sqlInsert);

                    // Insercio a la BBDD
                      dbconfig.connection.query( //Afegir grups
                      sqlInsert,
                      (errorIns, consulta) => {
                      if (!errorIns){
                        if (grupsWithError.length == 0) { // No hi ha cap error de creació de grups
                          res.status(200).json({problemes: 0, grups:[{message: 'Grups creats correctament!'}]});
                        } else {
                          res.status(521).json({problemes: grupsWithError.length, grups: grupsWithError});
                        }
                      } else {
                        res.status(520).json({problemes: valuesInsert.length, grups: [{message: "No s'ha pogut insertar els grups a la BBDD!"}]});
                      }
                    });
                  } else {
                    console.log("Error: No s'ha pogut crear cap grup!");
                    res.status(520).json({problemes: -1, grups: [{message: "Error: No s'ha pogut crear cap grup!"}]});
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
 *  grups: llista en format array de grups
 * assigCodi: codi de l'assignatura
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
  grupsId = [];
  nomGrups = [];
  arrayGrups = []; // Array amb els grups identificats pel nom


  req.body.grups.forEach(element => {

    const nom = req.body.assigCodi + '-g' + element.ordre;
    nomGrups.push(nom);
    arrayGrups[nom]=element;

  });

    const { stdout, stderr, code } = shell.exec('ganesha-del-grups ' + req.body.assigCodi + ' "' +
    nomGrups.join(' ') + '" TRUE', {silent: true});

      if (stdout) {
        console.log("Stdout", stdout);
        var resultjson = '';
        grupsWithError = [];
        try {
          resultjson = JSON.parse(stdout);
        } catch ( err) {
          console.log("Error en la resposta de l'script ganesha-del-grups!");
          res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-del-grups!"}] });
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
              } else {
                res.status(521).json({problemes: grupsWithError.length, grups: grupsWithError});
              }
              //res.status(200).json({message: 'Fet!'});
            } else {
              res.status(520).json({problemes: grupsId.length, grups: [{message: "No s'ha pogut esborrar els grups de la BBDD!"}]});
              //res.status(500).json({message: "No s'han pogut esborrar els grups"});
            }
          });

      }
    //});


  //res.status(200).json({message: 'Fet!'});
}

/**
 * Obtenir un grup amb el codi de la seva assignatura
 *
 * Request:
 *  id: grup_id
 *
 * Resposta:
 *  message:
 *  consuta: grup amb el codi de l'assignatura
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
        res.status(500).json({message: "No s'ha pogut consultar la info de grup!"});
      }
    });
}

/**
 * Request:
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
 *      error => 520 problema amb l'script / insertar en BBDD
 *               501,502 problema al afegir l'alumne des de l'script
 */
exports.addAlumneGrup = (req, res) => {
  console.log("\nAssignar usuari grup!");
  console.log(req.body);


  const { stdout, stderr, code } = shell.exec('ganesha-add-alumne-grup ' + req.body.alumne.niu + ' ' +
  req.body.assigCodi + ' ' + req.body.grupName, {silent: true});

  if (stdout) {
    console.log("Stdout", stdout);
    var resultjson = '';

    try {
      resultjson = JSON.parse(stdout);
    } catch ( err) {
      console.log("Error en la resposta de l'script ganesha-add-usuari-grup!");
      res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-add-usuari-grup!"}] });
      return;
    }


    switch (resultjson.codi){
      case 200:
          dbconfig.connection.query( //Afegir profe assignatura
            "INSERT INTO `alumnes` (`id`, `niu`, `nom`, `grup_id`) " +
            "VALUES (NULL, '"+req.body.alumne.niu+"', '"+req.body.alumne.nom+"','"+req.body.alumne.grup_id+"');",
            (errorinsert) =>{
              if (!errorinsert){
                res.status(200).json({message: resultjson.message});
              } else {
                res.status(520).json({message: "No s'ha pogut insertar l'alumne a la BBDD"});
              }
            });
        break;
      case 501: //Problema des de l'script
      case 502:
          res.status(501).json({message: resultjson.message});
        break;
    }

  }

}

/**
 * Request:
 *  alumnes: llista d'alumnes
 *  grupName: nom del grup (carpeta)
 *  assigCodi: codi assignatura
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

  alumnesNius = [];
  arrayAlumnes = [];
  alumnesIdToDel = [];

  req.body.alumnes.forEach(alumne => {
    const niu = alumne.niu
    alumnesNius.push(niu);
    //console.log(element.niu);

    arrayAlumnes['n'+niu] = alumne;
  });

  const { stdout, stderr, code } = shell.exec('ganesha-del-alumnes-grup "' +
       alumnesNius.join(' ') + '" ' +
       req.body.assigCodi + ' ' +
       req.body.grupName, {silent: true});

    if (stdout) {
      console.log("Stdout", stdout);
      var resultjson = '';
      alumnesWithError = [];
      try {
        resultjson = JSON.parse(stdout);
      } catch ( err) {
        console.log("Error en la resposta de l'script ganesha-del-profes-assignatura.adolfo!");
        res.status(520).json({problemes: -1, alumnes:[{message: "Error en la resposta de l'script ganesha-del-profes-assignatura.adolfo!"}] });
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
              } else {
                res.status(521).json({problemes: alumnesWithError.length, alumnes: alumnesWithError});
              }
            } else {
              res.status(520).json({problemes: alumnesIdToDel.length, alumnes: [{message: "No s'ha pogut esborrar els alumnes de la BBDD!"}]});
            }
          });
      } else {
        console.log("Error: No s'ha pogut esborrar cap professor!");
        res.status(520).json({problemes: -1, alumnes: [{message: "Error:  No s'ha pogut esborrar cap alumne!"}]});
        return;
      }
    }




/*   alumnesId = [];

  req.body.alumnes.forEach(element => {
    alumnesId.push(element.id);
  });

  dbconfig.connection.query( //Esborrar grups
    "DELETE FROM `alumnes` WHERE id IN ("+alumnesId.join()+");" ,
    (errorDel) =>{
      if (!errorDel){
        res.status(200).json({message: 'Fet!'});
      } else {
        res.status(500).json({message: "No s'han pogut esborrar els alumnes"});
      }
    }); */
}

/**
 * Request:
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

  profesNius = [];
  arrayProfes = [];
  profesIdToDel = [];

  req.body.profes.forEach(profe => {
    const niu = profe.niu
    profesNius.push(niu);
    //console.log(element.niu);

    arrayProfes['n'+niu] = profe;
  });

  const { stdout, stderr, code } = shell.exec('ganesha-del-profes-assignatura "' +
       profesNius.join(' ') + '" ' +
       req.body.assigCodi, {silent: true});

    if (stdout) {
      console.log("Stdout", stdout);
      var resultjson = '';
      profesWithError = [];
      try {
        resultjson = JSON.parse(stdout);
      } catch ( err) {
        console.log("Error en la resposta de l'script ganesha-del-profes-assignatura.adolfo!");
        res.status(520).json({problemes: -1, profes:[{message: "Error en la resposta de l'script ganesha-del-profes-assignatura.adolfo!"}] });
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
              } else {
                res.status(521).json({problemes: profesWithError.length, profes: profesWithError});
              }
            } else {
              res.status(520).json({problemes: profesIdToDel.length, profes: [{message: "No s'ha pogut esborrar els professors de la BBDD!"}]});
            }
          });
      } else {
        console.log("Error: No s'ha pogut esborrar cap professor!");
        res.status(520).json({problemes: -1, profes: [{message: "Error:  No s'ha pogut esborrar cap professor!"}]});
        return;
      }
    }

}

exports.getLvmInfo = (req, res) => {
/*   const volinfo = {
      codi: 200,
      message: 'Informació obtinguda correctament.',
      json: [
        {
          volname: 'MinisivaVol',
          tamany: '4,99g',
          disponible: '4,2g'
        }
      ]
    }; */
  console.log("\nget LVM Info!");

  shell.exec('ganesha-lvm-info ', {silent: true}, function(code, stdout, stderr){

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
 *      error => 520 problema amb l'script / insertar en BBDD
 *               501 problema al afegir el profe des de l'script
 */

exports.addProfeAssignatura = (req, res) => {
  console.log("\nAssignar profe a assignatura!");
  console.log(req.body);

  const { stdout, stderr, code } = shell.exec('ganesha-add-profe-assignatura ' + req.body.professor.niu + " " +
  req.body.assignaturaCodi, {silent: true});

  if (stdout) {
    console.log("Stdout", stdout);
    var resultjson = '';

    try {
      resultjson = JSON.parse(stdout);
    } catch ( err) {
      console.log("Error en la resposta de l'script ganesha-add-profe-assignatura!");
      res.status(520).json({problemes: -1, grups:[{message: "Error en la resposta de l'script ganesha-add-profe-assignatura!"}] });
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
              } else {
                res.status(520).json({message: "No s'ha pogut insertar el professor a la BBDD"});
              }
            });
        break;
      case 501: //Problema des de l'script
          res.status(501).json({message: resultjson.message});
        break;
    }

  }

}

/**
 * Request:
 *  assignatura
 *
 * Resposta:
 *   message
 *   assignaturaId: Id de l'assignatura insertada
 *
 * TODO: Gestionar las unidades de quota desdel frontend K, M, G.... ?
 */

exports.addAssignatura = (req, res) => {
  console.log(req.body);
  console.log("\nadd Assignatura!");

  shell.exec('ganesha-add-assignatura ' + req.body.codi + " " +
             req.body.tamanygb + "G", {silent: true}, function(code, stdout, stderr){

    if (stdout) {
        console.log("Stdout", stdout);

        const stdjson = JSON.parse(stdout);
        if (stdjson.codi == 200) {
          dbconfig.connection.query( //Afegir assignatura
            "INSERT INTO `assignatures` (`id`, `codi`, `nom`, `unitat_id`, `tamany`, `unitatstamany`) " +
            "VALUES (NULL, '"+req.body.codi+"', '"+req.body.nom+"','"+req.body.unitat_id+"', '"+req.body.tamany+"', '"+req.body.unitatstamany+"');",
            (errorinsert, result) =>{

              if (!errorinsert){
                res.status(200).json({message: stdjson.message, assignaturaId: result.insertId});
                console.log("Assignatura " + req.body.codi + " creada correctament.");
              } else {
                res.status(500).json({message: "No s'ha pogut insertar l'assignatura en la BBDD"});
                console.log("ERROR: No s'ha pogut insertar l'assignatura " + req.body.codi + " en la BBDD.");
              }
            });
        } else {
          res.status(stdjson.codi).json({message: stdjson.message});
          console.log("ERROR: " + stdjson.message);
        }

    } else {
      console.log("Error en la resposta de l'script ganesha-add-assignatura!");
      res.status(500).json({message: "Error en la resposta de l'script ganesha-add-assignatura!"});
    }
  });


}

/**
 * Request:
 *  assignatura
 *
 * Resposta:
 *   message
 *
 */

exports.deleteAssignatura = (req, res) => {
  console.log(req.body);
  console.log("\ndelete Assignatura. Not implemented!");
  res.status(200).json({message: 'Fet!'});
}


/**
 * Grups d'una assignatura
 *
 * Request:
 *  id: assignatura_id
 *
 * Resposta:
 *  message:
 *  conjunt de grups de l'assignatura + la quantitat d'alumnes que té cada grup
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
        res.status(500).json({message: "No s'ha pogut consultar els grups de l'assignatura!"});
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
        res.status(500).json({message: "No s'ha pogut consultar els minuts consumits!"});
      }
    });
}

/**
 * Request:
 *
 * Resposta:
 * message
 *
 */

exports.addUsuari = (req, res) => {
  console.log("\nAfegir Usuari!");
  console.log(req.body);
  dbconfig.connection.query( //Afegir profe assignatura
    "INSERT INTO `usuaris` (`id`, `niu`, `perfil_id`) " +
    "VALUES (NULL, 'Escriu Niu', '2');",
    (errorinsert) =>{
      if (!errorinsert){
        res.status(200).json({message: 'Fet!'});
      } else {
        res.status(500).json({message: "No s'ha pogut insertar l'usuari a la BBDD"});
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
          res.status(200).json({status: 'error', message: 'Aquest usuari no pot accedir a l\'aplicació', perfils});
        }
        //res.status(200).json({message: 'Fet!', consulta});
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
        //res.status(200).json({message: 'Fet!', consulta});
      } else {
        res.status(500).json({message: "No s'ha pogut consultar l'usuari!"});
      }
    });
}
