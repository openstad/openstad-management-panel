# An implentation of apostrophecms for Amsterdam open democracy

## Prerequisites
 - [Git](https://git-scm.com/)
 - [Node.js and npm](https://nodejs.org/en/)
 - [Mongodb](https://www.mongodb.com/)


#### 1. Set .env values
```
PORT=7777
PRODUCTION_SERVER_IP=132.123123 #For d
WILDCARD_HOST=cms.staging.amsterdam.nl
API_URL=
APP_URL= 
USER_API=http://localhost:4000/api/admin
USER_API_CLIENT_ID=ccc
USER_API_CLIENT_SECRET=ccccc
COOKIE_SECURE_OFF=yes
SESSION_SECRET=XXXXXAAAADDDD!!!@E@WE
SITE_ID=6 #site Id from the opensta api
SITE_API_KEY=xxxxxxx #site Id from the api
BASIC_AUTH_USER= #basic auth pass
BASIC_AUTH_PASSWORD=

```

#### 2. Run NPM install

```
npm i
```


#### 3. Run dev server

```
npm run dev
```
