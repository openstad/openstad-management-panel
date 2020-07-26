const fs = require('fs').promises;
const {createReadStream} = require('fs');
const tar = require('tar');
const fetch = require('node-fetch');

const merge            = require('merge');
const multer            = require('multer');
const upload            = multer();

//middleware
const ideaMw            = require('../../middleware/idea');
const siteMw            = require('../../middleware/site');
const voteMw            = require('../../middleware/vote');
const userClientMw      = require('../../middleware/userClient');

//services
const userClientApi     = require('../../services/userClientApi');
const siteApi           = require('../../services/siteApi');
const ideaApi           = require('../../services/ideaApi');
const choicesGuideApi   = require('../../services/choicesGuideApi');
const exportDb          = require('../../services/mongo').export;
const queryDb           = require('../../services/mongo').query;
const importDb          = require('../../services/mongo').import;

const cleanUrl = (url) => {
  return url ? url.replace('^https?://', '').replace(/\/$/, "") : '';
}

const addHttp = (url) => {
	if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    	url = "http://" + url;
	}
	return url;
}

//utils
const pick              = require('../../utils/pick');
//ENV constants
const apiUrl                   = process.env.API_URL;
const appUrl                   = process.env.APP_URL;
const defaulFrontendUrl        = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : false;
const siteId                   = process.env.SITE_ID;
const tmpDir                   = process.env.TMPDIR || './tmp';


module.exports = function(app){

  /**
   * Show form
   */
  app.get('/admin/site-import',
    siteMw.withAll,
    (req, res, next) => {
      res.render('site/import-form.html');
    }
  );

  /**
   * Import
   */
  app.post(
    '/admin/site/import',
    siteMw.withAll,
    userClientMw.withAll,
    upload.single('import_file'),
    //Todo: prepareImport
    //Todo: getData from files
    //Todo: insertData

    // check if fileUrl isset then download the file
    // otherwise assume file is upload and use multer to process local upload
    (req, res, next) => {

      if (req.body.fileUrl) {
        const fileUrl = req.body.fileUrl;
        let id = Math.round(new Date().getTime() / 1000);

        fetch(fileUrl)
        .then(res => res.buffer())
        .then(buffer => {
          req.file = {
            originalname: id + '.tgz', // get file name from url
            buffer: buffer
          }

          next();
        })
        .catch(next);
      } else {
        return next();
      }
    },
    (req, res, next) => {
      // prepare
      console.log('Import prepare');
      let id = Math.round(new Date().getTime() / 1000);
      req.import = {
        id,
        dir: tmpDir + '/' + id,
        filename: tmpDir + '/' + id + '/' + req.file.originalname,
        protocol: process.env.FORCE_HTTP ? 'http' : 'https',  // todo: dit zou met  req.protocol moeten werken maar pas alle proxy headers goed staan,
        domain: cleanUrl(req.body.domain),
        fromEmail: req.body.fromName ? `${req.body.fromName} <${req.body.fromEmail}>` : req.body.fromEmail,
      };

      fs.mkdir(req.import.dir)
        .then(res => {
          // write upload
          return fs.writeFile(req.import.filename, req.file.buffer)
        })
        .then(res => next())
        .catch(next)
    },
    (req, res, next) => {
      // untar
      tar.extract(
        {
          cwd: req.import.dir,
          file: req.import.filename,
        })
        .then(next)
        .catch(next)
    },
    (req, res, next) => {
      // read site.json
      fs.readFile(req.import.dir + '/api/site.json')
        .then(data => {
          try {
            req.import.site = JSON.parse(data.toString());
          } catch (err) {
            return next('Site not found');
          }
          return next();
        })
        .catch(next)
    },
    (req, res, next) => {
      // rename
      req.import.dbName = `${req.import.id}${req.import.site.title}`;
      req.import.dbName = req.import.dbName.replace(/ |	/g, '')
      return next()
    },
    (req, res, next) => {
      // oauth
      console.log('Import oauth');
      let oauthConfigs = {};
      return fs.readdir(req.import.dir + '/oauth')
        .then(data => {
          let promises = [];
          data.forEach((filename) => {
            promises.push(
              fs.readFile(req.import.dir + '/oauth/' + filename)
                .then(data => {
                  data = JSON.parse(data);
                  let client = {
                    name: data.name,
                    description: data.description,
                    authTypes: data.authTypes,
                    requiredUserFields: data.requiredUserFields,
                    exposedUserFields: data.exposedUserFields,
                    siteUrl: data.siteUrl.replace(/^https?:\/\/[^\/]+/, req.import.protocol + '://' + req.import.domain),
                    redirectUrl: data.siteUrl.replace(/^https?:\/\/[^\/]+/, req.import.protocol + '://' + req.import.domain),
                    allowedDomains: [
                      req.import.domain,
                      process.env.API_URL.replace(/^https?:\/\//, ''),
                    ],
                    config: data.config,
                  }
                  if ( client.config && client.config.backUrl ) {
                    client.config.backUrl = client.config.backUrl.replace(/^https?:\/\/[^\/]+/, req.import.protocol + '://' + req.import.domain);
                  }
                  let key = filename.replace(/.json$/, '');
                  return userClientApi
                    .create(client)
                    .then(result => {
                      oauthConfigs[key] = {
                        'id': result.id,
                        'auth-client-id': result.clientId,
                        'auth-client-secret': result.clientSecret,
                      }
                    });
                })
            )
          });
          return promises;
        })
        .then(promises => {
          return Promise
            .all(promises)
            .then(res => {
              req.import.site.config.oauth = oauthConfigs;
            })
            .then(res => next())
        })
        .catch(next)
    },
    (req, res, next) => {
      // create mongo db
      console.log('Import mongo db');
      importDb(req.import.dbName, req.import.dir + '/mongo')
        .then(next)
        .catch(next)
    },
    (req, res, next) => {
      // create site in API
      console.log('Import site in API');
      let siteConfig = req.import.site.config;
      siteConfig.cms.dbName = req.import.dbName;
      siteConfig.allowedDomains.push(req.import.domain); // TODO
      siteConfig = merge.recursive(siteConfig, {
        "email": {
          siteaddress: req.import.fromEmail,
          thankyoumail: {
            from: req.import.fromEmail,
          }
        },
        "notifications": {
          "from": req.import.fromEmail,
          "to": req.import.fromEmail
        },
        "ideas": {
          "feedbackEmail": {
            "from": req.import.fromEmail,
          }
        },
        "newslettersignup": {
          "confirmationEmail": {
            "from": req.import.fromEmail,
          }
        },
      });
      return siteApi
        .create({
          domain: req.import.domain,
          name: req.import.id + req.import.site.title,
          title: req.import.site.title,
          config: siteConfig,
        })
        .then(result => {
          req.import.site = result;
          return next();
        })
        .catch(next);
    },
    (req, res, next) => {
      // make the current user admin
      if (!req.import.site.config.oauth.default) return next();
      const url = process.env.USER_API + '/api/admin/user/' + req.user.externalUserId;
      let body = {
        client_id:  process.env.USER_API_CLIENT_ID,
        client_secret: process.env.USER_API_CLIENT_SECRET,
        roles: {},
      }
      body.roles[req.import.site.config.oauth.default.id] = 1;
      return fetch(
        url,
        {
	        headers: { "Content-type": "application/json" },
	        method: 'POST',
	        body: JSON.stringify(body)
        })
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            throw Error('Update user failed');
          }
          return next();
        })
        .catch(next)
    },
    (req, res, next) => {
      // choices-guides
      console.log('Import choices-guides');
      return fs.readdir(req.import.dir + '/api')
        .then(data => {
          let promises = [];
          data.forEach((filename) => {
            if (filename.match(/^choicesguide-/)) {
              promises.push(
                fs.readFile(req.import.dir + '/api/' + filename)
                  .then(result => {
                    let json = JSON.parse(result);
                    choicesGuideApi
                      .create(req.session.jwt, req.import.site.id, json)
                  })
              )
            }
          });
          return promises;
        })
        .then(promises => {
          return Promise
            .all(promises)
            .then(res => next())
        })
        .catch(next)

    },
    async (req, res, next) => {
      // cms attachments
      console.log('Import cms attachments');

      const cmsDomain  = defaulFrontendUrl ? defaulFrontendUrl : req.import.domain;

      const cmsDomainIsUp = await lookupPromise(cmsDomain);
      if(! cmsDomainIsUp) {
        throw new Error('Not able to reach the server');
      }

      let paths = [];
      fs.readdir(req.import.dir + '/attachments')
        .then(data => {

          if (!data.length) return next();

          const FormData = require('form-data');
          const formData = new FormData();
          data.forEach((entry) => {
            formData.append('files', createReadStream(req.import.dir + '/attachments/' + entry));
          });

          return fetch(req.import.protocol + '://' + cmsDomain + '/attachment-upload', {
	          headers: { "X-Authorization": process.env.SITE_API_KEY },
	          method: 'POST',
	          body: formData
          })
	          .then((response) => {
		          if (!response.ok) {
                console.log(response);
                throw Error(JSON.stringify(response))
              }
		          return response.json();
	          })
	          .then( json => {
              return next()
	          })
            .catch(next)

        })
        .catch(next)

    },
    (req, res, next) => {
      // todo: cleanup
      res.redirect('/admin/site/' + req.import.site.id)
    },
  );
}

const dns = require('dns');
const lookupPromise = async (domain) => {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if(err) reject(err);
      resolve(address);
    });
  });
};
