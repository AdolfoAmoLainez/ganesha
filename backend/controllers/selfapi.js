
/**
 * Request:
 *  assignatura
 *  quantitat de grups
 *  quota en Gb
 */
exports.crearGrups = (req, res) => {
  console.log(req.body);
  console.log("Creació de grups!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  llista de grups
 */

exports.esborrarGrups = (req, res) => {
  console.log(req.body);
  console.log("Esborrar grups'!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  grup
 *  niu a afegir
 */
exports.addAlumneGrup = (req, res) => {
  console.log(req.body);
  console.log("Assignar usuari grup'!");
  res.status(200).json({message: 'Fet!'});
}

/**
 * Request:
 *  llista d'alumnes
 */

exports.deleteAlumnesGrup = (req, res) => {
  console.log(req.body);
  console.log("Esborrar alumnes grup'!");
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


