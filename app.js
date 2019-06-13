// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();
const express           = require('express');
const isDev             = process.env.ENVIRONMENT === 'development';
const Site              = require('./models').Site;
const bodyParser        = require('body-parser');
const cookieParser      = require('cookie-parser');
const expressSession    = require('express-session')
const nunjucks          = require('nunjucks');
const flash             = require('express-flash');
const app               = express();
const FileStore         = require('session-file-store')(expressSession);
const ideaMw            = require('./middleware/idea');
const siteMw            = require('./middleware/site');
const enrichMw          = require('./middleware/enrich');
const authMw            = require('./middleware/auth');

const userClientApi     = require('./services/userClientApi');
const siteApi           = require('./services/siteApi');

const dateFilter                  = require('./nunjucks/dateFilter');
const currencyFilter              = require('./nunjucks/currency');
const limitTo                     = require('./nunjucks/limitTo');
const jsonFilter                  = require('./nunjucks/json');
const timestampFilter             = require('./nunjucks/timestamp');
const replaceIdeaVariablesFilter  = require('./nunjucks/replaceIdeaVariables');

const cleanUrl = (url) => {
  return url.replace(['http://', 'https://'], '');
}

const ensureUrlHasProtocol = (url) => {
  if (!url.startsWith('http://') || !url.startsWith('https://')) {
    // if no protocol, assume https
    url = 'https://' + url;
  }

  return url;
}

const apiUrl = process.env.API_URL;
const appUrl = process.env.APP_URL;
const siteId = process.env.SITE_ID;

const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

//app.set('views', __dirname + '/templates');

const nunjucksEnv = nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

app.use((req, res, next) => {
  dateFilter.setDefaultFormat('DD-MM-YYYY HH:mm');
  nunjucksEnv.addFilter('date', dateFilter);
  nunjucksEnv.addFilter('currency', currencyFilter);
  nunjucksEnv.addFilter('limitTo', limitTo);
  nunjucksEnv.addFilter('json', jsonFilter);
  nunjucksEnv.addFilter('timestamp', timestampFilter);
  nunjucksEnv.addFilter('replaceIdeaVariables', replaceIdeaVariablesFilter);
  next();
});

const copyDb = require('./services/mongo').copyMongoDb;
const dbExists = require('./services/mongo').dbExists;
const deleteMongoDb =  require('./services/mongo').deleteDb;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use(cookieParser(process.env.COOKIE_SECRET, {
  path: '/',
  maxAge:  3600000 * 24 * 7 ,
  secure: process.env.COOKIE_SECURE_OFF === 'yes' ? false : true,
  httpOnly: true,
  sameSite: false
}));

// Session Configuration
app.use(expressSession({
  saveUninitialized : true,
  resave            : true,
  secret            : process.env.SESSION_SECRET,
  //store             : new MemoryStore(),
  key               : 'authorization.sid',
  cookie            : {
    maxAge:  3600000 * 24 * 7 ,
//    secure: process.env.COOKIE_SECURE_OFF === 'yes' ? false : true,
//    httpOnly: true,
    sameSite: false,
    path: '/'
  },
  store: new FileStore({
    ttl: 3600 * 24 * 31
  }),

}));
app.use(flash());

app.use(enrichMw.run);

// redirect the index page to the admin section
app.get('/', (req, res) => {
  res.redirect('/admin');
});

/**
 * Check if user is isAuthenticated and fetch data
 */
app.use(
  authMw.check,
  authMw.fetchUserData
);

/**
 * Make sure user is isAuthenticated & has rights to access
 */
app.use('/admin',
  authMw.ensureAuthenticated,
  authMw.ensureRights
);


/**
 * Display admin start page
 */
app.get('/admin',
  siteMw.withAll,
  (req, res) => {
    console.log('aaaa');
  res.render('overview.html', {
    sites: req.sites
  });
});

/**
 * Required main routes.
 */
require('./routes/site')(app);
require('./routes/user')(app);
require('./routes/auth')(app);

/**
 * Helper url
 */
app.get('/admin/copy/:oldName/:newName', (req, res) => {
  copyDb(req.params.oldName, req.params.newName)
    .then(() => {
      res.status(200).json({ success: 'Copied DB'});
    })
    .catch((e) => {
      res.status(500).json({ error: 'An error occured: ' + e });
    });
});

app.listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});

module.exports = app;
