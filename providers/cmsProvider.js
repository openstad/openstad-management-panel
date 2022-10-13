const {createReadStream, createWriteStream} = require('fs');
const BSON = require('bson');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs').promises;
const BSONStream = require('bson-stream');
const { Transform, PassThrough } = require('stream')
const { pipeline } = require('stream/promises')

const mongoService = require('../services/mongo');

/**
 * Generate a Cms id
 *
 * @param
 *
 * @returns {id<String>}
 */

const generateId = (params = {}) => {

  var token = '';

  params.chars = params.chars || 'abcdefghijklmnopqrstuvwxyz0123456789';
  params.length = params.length || 25;

  for (let i = 0; i < params.length; i++) {
    const rnd = Math.floor(params.chars.length * Math.random());
    const chr = params.chars.substring(rnd, rnd + 1);
    token = token + chr;
  }

  return token;
  
  
}

/**
 * Get Cms Attachments
 *
 * @param dbName
 *
 * @returns {Promise<Array>}
 */
const getAttachments = async (dbName) => {

  const aposDocuments = await mongoService.query(dbName, 'aposDocs');
  const aposAttachments = await mongoService.query(dbName, 'aposAttachments');

  const files = [];
  aposDocuments.forEach((entry) => {
    if (entry.published === true && entry.trash === false) {
      if (entry.type === 'apostrophe-file' || entry.type === 'apostrophe-image') {
        files.push(entry.attachment._id + '-' + entry.attachment.name + '.' + entry.attachment.extension);
      }
      if (entry.type === 'apostrophe-image') {
        ['.full', '.max', '.one-half', '.one-sixth', '.one-third', '.two-thirds'].forEach((size) => {
          files.push(entry.attachment._id + '-' + entry.attachment.name + size + '.' + entry.attachment.extension);
        });
      }
    }
  });

  aposAttachments.forEach((entry) => {
    files.push(entry._id + '-' + entry.name + '.' + entry.extension);
    if (entry.extension.toLowerCase().match(/jpe?g|svg|png|gif/)) {
      ['.full', '.max', '.one-half', '.one-sixth', '.one-third', '.two-thirds'].forEach((size) => {
        files.push(entry._id + '-' + entry.name + size + '.' + entry.extension);
      });
    }
  });

  return files;
};

/**
 * Export mongo database
 *
 * @param uniqueSiteId
 * @param dbName
 *
 * @returns {Promise<string>}
 */
const exportDatabase = async (uniqueSiteId, dbName) => {
  const tmpDir = process.env.TMPDIR || './tmp';
  const mongoPath = tmpDir + '/' + uniqueSiteId;
  await mongoService.export(dbName, mongoPath);

  return `${mongoPath}/${dbName}`;
};

/**
 * Import mongo database from directory
 *
 * @param newSite
 * @param mongoPath
 *
 * @returns {Promise<void>}
 */
const importCmsDatabase = async (newSite, mongoPath) => {
  console.log('import cms database');
  return mongoService.import(newSite.getCmsDatabaseName(), mongoPath)
};

/**
 * Import attachments: rename and upload attachments and update the data in a directory
 *
 * @param cmsData
 * @param attachmentsDir
 * @param mongoPath
 *
 * @returns {Promise<void>}
 */
const renameAttachments = async ({ cmsData, domain, attachmentsDir, mongoPath }) => {

  console.log('import attachments in data');

  try {

    // collect attachements - without derived
    let attachmentNames = {};
    for (let attachment of cmsData.attachments) {
      let match = attachment.match(/^([^.]+)(?:\.(?:full|max|one-half|one-sixth|one-third|two-thirds))?\.([^.]+)$/i);
      if (!match) throw new Error('Attachment name not found for' + attachment);
      if (!attachmentNames[ match[1] ]) {
        let oldId = match[1].replace(/^([^-]*).*$/, '$1');
        let newId = generateId();
        let newName = match[1].replace(oldId, newId)
        attachmentNames[ match[1] ] = { oldId, newId, newName, extension: match[2] };
      }
    }

    // rename files
    let attachmentFiles = await fs.readdir(attachmentsDir);
    for ( let attachmentFile of attachmentFiles ) {
      let oldName = attachmentFile;
      let newName = oldName;
      for (let attachmentName of Object.keys(attachmentNames)) {
        newName = newName.replace( new RegExp(attachmentName, 'g'), attachmentNames[attachmentName].newName );
      }
      let err = await fs.rename(`${attachmentsDir}/${oldName}`, `${attachmentsDir}/${newName}`);
      if (err) throw err;
    }

    // rename attachments in cmsData
    for ( var i=0; i < cmsData.attachments.length; i++ ) {
      for (let attachmentName of Object.keys(attachmentNames)) {
        cmsData.attachments[i] = cmsData.attachments[i].replace( new RegExp(attachmentName, 'g'), attachmentNames[attachmentName].newName )
      }
    }

    let files = [];

    // Convert older export to new supported format (mongodump)
    let subdirs = await fs.readdir(mongoPath, {
      withFileTypes: true,
    })
    subdirs = subdirs.filter(file => file.isDirectory()).map(folder => folder.name);

    for (let subdir of subdirs) {
      const collection = subdir

      let subFiles = await fs.readdir(`${mongoPath}/${subdir}`);
      for (let file of subFiles) {
        // concatenate bson files into single collection bson
        const bson = createWriteStream(`${mongoPath}/${collection}.bson`, {
          flags: 'a+', // create and append
        });
        await pipeline(fs.readFile(`${mongoPath}/${subdir}/${file}`), bson);
      }

      // remove subdir
      await fs.rm(`${mongoPath}/${subdir}`, {
        recursive: true,
        force: true,
      });
    }
    
    // replace ids in the data
    files = await fs.readdir(`${mongoPath}`);
    for (let file of files.filter(file => file.endsWith('.bson'))) {
      await pipeline(
        createReadStream(`${mongoPath}/${file}`),
        new BSONStream(),
        new Transform({
          objectMode: true,
          transform(chunk, encoding, callback) {
            try {
              content = JSON.stringify(chunk);
              for (let attachmentName of Object.keys(attachmentNames)) {
                content = content.replace(
                  new RegExp(attachmentNames[attachmentName].oldId, 'g'),
                  attachmentNames[attachmentName].newId
                );
              }
              const serialized = BSON.serialize(JSON.parse(content));
              callback(null, serialized);
            } catch (err) {
              callback(err);
            }
          },
        }),
        createWriteStream(`${mongoPath}/${file}.new`)
      );

      await fs.rm(`${mongoPath}/${file}`);
      await fs.rename(`${mongoPath}/${file}.new`, `${mongoPath}/${file}`);
    }

  } catch(err) {
    console.log('Error renaming attachments');
    console.log(err);
    return err
  }

};

/**
 * Import a single cms attachment to a cms
 *
 * @param domain: string
 * @param dir
 * @param attachment
 *
 * @returns {Promise<void>}
 */
const uploadAttachments = async ({ targetUrl, attachmentsDir, attachments }) => {

  console.log('import cms attachments', targetUrl);
  const formData = new FormData();
  console.log('Attachments', attachments)
  console.log('dir', attachmentsDir)

  attachments.forEach(async function(attachment) {
    formData.append('files', createReadStream(attachmentsDir + '/' + attachment));
  });

  console.log(targetUrl + '/attachment-upload');
  let response = await fetch(targetUrl + '/attachment-upload', {
    headers: {"X-Authorization": process.env.SITE_API_KEY},
    method: 'POST',
    body: formData
  });

};

/**
 * Rename the siteTitle field of the imported site and update it in the database
 * 
 * @param newSite
 * @param mongoPath
 */
 const renameSiteTitleInDatabase = async (newSite) => {
  console.log(`renaming the site title to ${newSite.title}`);
  return mongoService.editSiteTitle(newSite.title, newSite.getCmsDatabaseName(), "aposDocs");
};

module.exports = exports = {
  generateId,
  getAttachments,
  exportDatabase,
  importCmsDatabase,
  renameAttachments,
  uploadAttachments,
  renameSiteTitleInDatabase,
}
