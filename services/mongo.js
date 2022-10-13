const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

function getMongoDbConnectionString(database) {
  // Allow the connection string builder to be overridden by an environment variable
  // We replace '{database}' in this connection string with the database we are looking for
  if (process.env.MONGO_DB_CONNECTION_STRING) {
    return process.env.MONGO_DB_CONNECTION_STRING.replace(
      '{database}',
      database || ''
    );
  }

  const host = process.env.MONGO_DB_HOST || 'localhost';
  const port =
    process.env.MONGODB_PORT_27017_TCP_PORT ||
    process.env.MONGO_DB_PORT ||
    27017;
  const user = process.env.MONGO_DB_USER || '';
  const password = process.env.MONGO_DB_PASSWORD || '';
  const authSource = process.env.MONGO_DB_AUTHSOURCE || '';

  const useAuth = user && password;

  return `mongodb://${useAuth ? `${user}:${password}@` : ''}${host}:${port}/${
    database ? database : ''
  }${authSource ? `?authSource=${authSource}` : ''}`;
}

const url = getMongoDbConnectionString();

exports.copyMongoDb = (oldDbName, newDbName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        reject(err);
      } else {
        var mongoCommand = {
          copydb: 1,
          fromhost: "localhost",
          fromdb: oldDbName,
          todb: newDbName
        };
        var admin = db.admin();

        admin.command(mongoCommand, function(commandErr, data) {
          if (!commandErr) {
            console.log(data);
            resolve(data)
          } else {
            reject(commandErr.errmsg);
          }
          db.close();
        });
      }
    });
  });
}

exports.dbExists = (dbName) => {

  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        reject(err);
      } else {
        var adminDb = db.admin();

        // List all the available databases
        adminDb.listDatabases(function(err, dbs) {
          const found = dbs.databases.find((dbObject) => {
            return dbName === dbObject.name;
          });

          db.close();
          resolve(!!found)
        });
      }
    });
  });
}

exports.deleteDb = (dbName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(getMongoDbConnectionString(dbName), (err, client) => {
      if (err) {
        return reject(err);
      }
      
      // drop the database
      client.dropDatabase(function(err, result) {
        client.close();
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

exports.query = (dbName, collectionName) => {

  return new Promise((resolve, reject) => {

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection(collectionName).find({}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        resolve(result)
      });
    });

  });

}

exports.export = (dbName, dirname) => {

  return new Promise((resolve, reject) => {
    let uri = getMongoDbConnectionString(dbName);
    dirname = dirname || './tmp';

    import(`execa`)
      .then(({ execa }) => execa(`mongodump`, ['--uri', uri, '-o', dirname, '-v']))
      .then((result) => {
        console.log({ mongodump: result });
        resolve(result)
      })
      .catch(reject)
  });
}

exports.import = (dbName, dirname) => {

  return new Promise((resolve, reject) => {

    let uri = getMongoDbConnectionString(dbName);
    dirname = dirname || './tmp';

    import(`execa`)
      .then(({ execa }) => execa(`mongorestore`, ['--uri', uri, dirname, '-v']))
      .then((result) => {
        console.log({ mongorestore: result })
        resolve(result)
      })
      .catch(reject);
  });
}

exports.editSiteTitle = (siteTitle, dbName, collectionName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
        var dbo = db.db(dbName);
        dbo.collection(collectionName).updateMany({type: {$regex : /global/}}, {$set: {siteTitle}});
        db.close();
        resolve();
    });
  });
}