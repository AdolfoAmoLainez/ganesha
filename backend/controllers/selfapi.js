var dbconfig = require('../mysqlconn');

/**
 * Request:
 *  assignatura
 *  quantitat de grups
 *  quota en Gb
 */
exports.crearGrups = (req, res) => {
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
              niusProfes=[];
              max = 0;

              if (maxGrup[0].max!=null){
                max=parseInt(maxGrup[0].max);
              }

              for (i=1; i<=req.body.quantitat; i++){
                nomGrups.push(req.body.assignatura.codi+"-g"+ (max+i));
              }
              console.log("Crear "+ req.body.quantitat+" grups començant per " + max);
              console.log("Grups: " + nomGrups.join());

              nius.forEach(element => {
                niusProfes.push(element.niu);
              });

              console.log(niusProfes.join());
              console.log("Creació de grups!");
              res.status(200).json({message: 'Fet!'});
            }
          }
        );
      }
    }
  )
}

/**
 * Request:
 *  llista de grup_id
 */

exports.esborrarGrups = (req, res) => {
  console.log(req.body);
  console.log("Esborrar grups!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  grup
 *  niu a afegir
 */
exports.addAlumneGrup = (req, res) => {
  console.log(req.body);
  console.log("Assignar usuari grup!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  llista d'alumnes
 */

exports.deleteAlumnesGrup = (req, res) => {
  console.log(req.body);
  console.log("Esborrar alumnes grup!");
  res.status(200).json({message: 'Fet!'});
}

exports.getLvmInfo = (req, res) => {
  const volinfo = {
      codi: 200,
      message: 'Informació obtinguda correctament.',
      json: [
        {
          volname: 'MinisivaVol',
          tamany: '4,99g',
          disponible: '4,2g'
        }
      ]
    };
  console.log("get LVM Info!");


  res.status(200).json(volinfo);

}

/**
 * Request:
 * {
 *  assignatura,
 *  professor
 * }
 *
 */

exports.addProfeAssignatura = (req, res) => {
  console.log(req.body);
  console.log("Assignar profe a assignatura!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  assignatura
 */

exports.addAssignatura = (req, res) => {
  console.log(req.body);
  console.log("add Assignatura!");
  dbconfig.connection.query( //Afegir assignatura
    "INSERT INTO `assignatures` (`id`, `codi`, `nom`, `unitat_id`, `tamany`, `unitatstamany`) " +
    "VALUES (NULL, '"+req.body.codi+"', '"+req.body.nom+"','"+req.body.unitat_id+"', '"+req.body.tamany+"', '"+req.body.unitatstamany+"');",
    (errorinsert) =>{
      if (!errorinsert){
        res.status(200).json({message: 'Fet!'});
      } else {
        res.status(500).json({message: "No s'ha pogut insertar l'assigantura en la BBDD"});
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
  dbconfig.connection.query( //Afegir assignatura
      "SELECT SUM(`quota`) as consumits FROM `grups` WHERE assignatura_id="+req.body.id+";",
      (errorSel, consulta) => {
      if (!errorSel){
        res.status(200).json({message: 'Fet!', consulta});
      } else {
        res.status(500).json({message: "No s'ha pogut consultar els minuts consumits!"});
      }
    });
}
