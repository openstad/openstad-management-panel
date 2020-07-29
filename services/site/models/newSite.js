const cleanUrl = require('../../../utils/cleanUrl');
const tmpPath = process.env.TMPDIR || './tmp';
const protocol = process.env.FORCE_HTTP ? 'http' : 'https';

//Todo: Move to utils?
const ensureUrlHasProtocol = (url) => {
  if (!url.startsWith('http://') || !url.startsWith('https://')) {
    // if no protocol, assume https
    url = protocol+ '://' + url;
  }

  return url;
}

module.exports = function NewSite(domain, title, fromEmail, fromName) {
  this.uniqueSiteId = Math.round(new Date().getTime() / 1000) + domain.replace(/\./g, '').slice(0,99);
  this.domain = cleanUrl(domain);
  this.domainWithProtocol = ensureUrlHasProtocol(this.domain);
  this.cmsDatabaseName = (this.uniqueSiteId + title).replace(/ |	/g, '').replace(/[^0-9a-zA-Z]+/g, '');// Remove spaces and special characters
  this.tmpDir = tmpPath + this.uniqueSiteId;
  this.fromEmail = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  this.title = title;

  this.getUniqueSiteId = () => this.uniqueSiteId;
  this.getDomain = () => this.domain;
  this.getDomainWithProtocol = () => this.domainWithProtocol;
  this.getCmsDatabaseName = () => this.cmsDatabaseName;
  this.getTmpDir = () => this.tmpDir;
  this.getFromEmail = () => this.fromEmail;
  this.getTitle = () => this.title;
};