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
  res.status(200).json({message: 'Fet!'});

}
