# Pendekin
Simple self-hosted shorthener url app that produce short url with primary service based on RESTful API

## Features
- Shorten url based on RESTful
- Simple Dashboard to manage existing shortened urls
- One-time usage for shorten url after visit (will be deleted)
- Checking availibility for custom-requested shortener code
- Password-protected shorten url
- Multi url listing with one shortened url
- Prefix shortened code
- Bulk shorten urls
- Changing existing destination url on shortened url
- Optional using redis for boosting performance
- Categorized shorten urls (on your dashboard) **(soon..)**
- Side-effects trigger on url visitting (http request, email notification, push notification, slack webhook) **(soon..)**

## Requirements
- Redis (optional)
- Postgreql
- Nodejs >= 7.6

## Installation
- Install node `>= 8` (LTS is preferred)
- Install redis (optional)
- Setup the database configuration on `config/database.json` 
- Setup the site configuration on `config/site.json`, set `use_redis` to `false` if you prefer to not using redis, and change all the settings that matched with yours
- Run the migration by `npm run db:migrate`
- Run the seeds by `npm run db:seed:all`
- That's it. check your client table to get `client_key` and `client_secret` to start creating shortener of url

## Rest & Site Redirection
Soon...

## License
MIT