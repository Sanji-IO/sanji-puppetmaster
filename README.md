<a href="//github.com/Sanji-IO/sanji-puppetmaster">
    <img src="http://upload.wikimedia.org/wikipedia/commons/1/16/Godfather_puppetmaster.jpg" align="right" />
</a>

sanji-puppetmaster
==================
[![Build Status](https://travis-ci.org/Sanji-IO/sanji-puppetmaster.svg)](https://travis-ci.org/Sanji-IO/sanji-puppetmaster) [![Coverage Status](https://coveralls.io/repos/Sanji-IO/sanji-puppetmaster/badge.png?branch=develop)](https://coveralls.io/r/Sanji-IO/sanji-puppetmaster?branch=develop)

[![NPM](https://nodei.co/npm/sanji-puppetmaster.png)](https://nodei.co/npm/sanji-puppetmaster/)

Process batch command/data/event from server to clients.

REST API Endpoints
------------------
**Read on [APIARY](http://docs.sanjigeneric.apiary.io/#remoteasync)**

### [Jobs](#job-collection-jobs)
- **/jobs** [GET] List current jobs.
- **/jobs** [POST] Create a job.
- **/jobs/:id** [GET] Get a job's information by id.

### [Requests](#requests-collection-requests)
- **/requests** [GET] List current requests.
- **/requests** [POST] Create a request to destination.
- **/requests/:id** [GET] Get a request's information by id.
