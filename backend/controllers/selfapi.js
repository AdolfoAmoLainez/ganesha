
exports.crearGrups = (req, res) => {
  console.log("Creació de grups!");
  res.status(200).json({message: 'Fet!'});
}

exports.addAlumneGrup = (req, res) => {
  console.log("Assignar usuari grup'!");
  res.status(200).json({message: 'Fet!'});
}

exports.deleteAlumneGrup = (req, res) => {
  console.log("Esborrar usuari grup'!");
  res.status(200).json({message: 'Fet!'});
}

exports.esborrarGrup = (req, res) => {
  console.log("Esborrar grup'!");
  res.status(200).json({message: 'Fet!'});
}

