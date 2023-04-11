const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.contructReactAdminCdn = async function () {
  // construct cdn urls
  let openstadReactAdminCdn =
    process.env.OPENSTAD_REACT_ADMIN_CDN ||
    'https://cdn.jsdelivr.net/npm/openstad-react-admin@{version}/dist';
  if (openstadReactAdminCdn.match('{version}')) {
    try {
      let tag = await getTag();

      // get current published version
      ({ stdout, stderr } = await exec('npm view --json openstad-react-admin'));
      let info = stdout && stdout.toString();
      info = JSON.parse(info);
      let version = info['dist-tags'][tag];
      if (!version) {
        // fallback
        let packageFile =
          await fs.readFile(`${__dirname}/../package.json`).toString() || '';
        let match =
          packageFile &&
          packageFile.match(
            /"openstad-react-openstadComponentsCdn":\s*"(?:[^"\d]*)((?:\d+\.)*\d+)"/
          );
        version = (match && match[1]) || '';
      }
      openstadReactAdminCdn = openstadReactAdminCdn.replace(
        '@{version}',
        version ? `@${version}` : ''
      );
    } catch (err) {
      console.log('Error constructing cdn url', err);
    }
  }

  return openstadReactAdminCdn;
};

async function getTag() {
  let branch = '';
  let tag = 'alpha';

  try {
    let { stdout, stderr } = await exec('git rev-parse --abbrev-ref HEAD');
    branch = stdout && stdout.toString().trim();
  } catch (error) {
    // As a fallback we check for the CDN_DIST_TAG env variable
    if (process.env.CDN_DIST_TAG) {
      tag = process.env.CDN_DIST_TAG;
    }
    console.warn(`Could not get branch via git; fallback to ${tag}`);
  }

  if (branch == 'release') tag = 'beta';
  if (branch == 'master') tag = 'latest';

  return tag;
}
