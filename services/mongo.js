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

  return `mongodb://${useAuth ? `${user}:${password}@` : ''}${host}:${port}/${authSource ? `?authSource=${authSource}` : ''}`;
}

const url = getMongoDbConnectionString();

exports.deleteDb = (dbName) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(getMongoDbConnectionString(), (err, client) => {
      if (err) {
        return reject(err);
      }
      
      // drop the database
      let db = client.db(dbName);
      db.dropDatabase(function(err, result) {
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

exports.export = async (dbName, dirname) => {
  let uri = getMongoDbConnectionString(dbName);
  dirname = dirname || './tmp';
  
  const { execa } = await import('execa');
  return await execa(`mongodump`, [
    '--uri', uri,
    '-o', dirname,
    '-v'
  ])
}

exports.import = async (dbName, dirname) => {
  let uri = getMongoDbConnectionString(dbName);
  dirname = dirname || './tmp';

  const { execa } = await import('execa')
  return await execa(`mongorestore`, [
    '-v',
    '-d', dbName,
    '--uri', uri,
    dirname
  ])
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
