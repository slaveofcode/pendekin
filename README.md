# Pendekin
Simple self-hosted shorthener url app that produce short url with primary service based on RESTful API

## Features
- Shorten url based on RESTful
- Simple Dashboard to manage existing shortened urls
- One-time usage for shorten url after visit (will be deleted)
- Checking availibility for custom-requested shortener code
- Password-protected shorten url
- Auto remove shortened url after expired time raised
- Multi url listing with one shortened url
- Prefix shortened code
- Categorized shorten urls (on your dashboard)
- Bulk shorten urls
- Side-effects trigger on url visitting (http request, email notification, push notification, slack webhook)
- Changing existing destination url on shortened url
- Optional using redis for booster performance

## Requirements
- Redis (optional)
- Postgreql
- Nodejs >= 7.6
- Nginx

## Installation

