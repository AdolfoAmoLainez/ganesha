const SelfApiController = require("./selfapi");
var cas = require('connect-cas');
var url = require('url');

cas.configure({ 'host': 'sacnt.uab.cat', 'protocol': 'https',
paths: {
        validate: '/validate',
        serviceValidate: '/p3/serviceValidate', // CAS 3.0
        proxyValidate: '/p3/proxyValidate', // CAS 3.0
        proxy: '/proxy',
        login: '/login',
        logout: '/logout'
    }
});


/**
 * Request:
 *  username: Niu de la persona a validar
 */

exports.getUserData = (req, res) => {


  if (req.session.cas && req.session.cas.attributes.niu) {
    const usuari = req.session.cas.attributes.niu;

    SelfApiController.getUserData(usuari, (codi, perfils) => {
      switch (codi) {
        case 200:
          res.status(200).json({username:usuari,message: "Usuari validat correctament!", perfils});
          break;
        case 401:
          res.status(401).json({username:usuari,message: "L'usuari no té permís per fer servir aquesta aplicació!"});
          break;
        case 500:
          res.status(401).json({username:usuari,message: "No s'ha pogut validar l'usuari!"});
          break;
      }
    });
} else {
    res.status(401).json({message: 'Usuari no valid!'});
}

}

exports.login = (req, res) => {
  console.log("\nloginapi.login!");

  const usuari = req.session.cas.attributes.niu;

  SelfApiController.getUserData(usuari, (codi, perfils) => {
    switch (codi) {
      case 200:
        // Guardem dades a l'ldap
        const { stdout, stderr, code } = shell.exec('sudo /usr/local/sbin/ganesha-set-ldap-info ' + usuari + " " +
        "\"" + req.session.cas.attributes.givenName + "\" " +
        "\"" + req.session.cas.attributes.sn + "\" " +
        req.session.cas.attributes.mail, {silent: true});

        res.redirect(302,'/login').json(stdout);
        break;
      case 401:
        res.status(401).json({username:usuari,message: "L'usuari no té permís per fer servir aquesta aplicació!"});
        break;
      case 500:
        res.status(401).json({username:usuari,message: "No s'ha pogut validar l'usuari!"});
        break;
    }
  });

}

exports.logout = (req, res) => {
  if (!req.session) {
    return res.redirect('/loginapi/login');
  }
  // Forget our own login session
  if (req.session.destroy) {
    req.session.destroy();
  } else {
    // Cookie-based sessions have no destroy()
    req.session = null;
  }
  // Send the user to the official campus-wide logout URL
  var options = cas.configure();
  options.pathname = options.paths.logout;
  return res.redirect(url.format(options));
}

exports.serCas = (cas) => {
  this.cas=cas;
}
