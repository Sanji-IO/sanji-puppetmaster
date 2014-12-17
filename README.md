<a href="//github.com/Sanji-IO/sanji-puppetmaster">
    <img src="http://upload.wikimedia.org/wikipedia/commons/1/16/Godfather_puppetmaster.jpg" align="right" />
</a>

sanji-puppetmaster [![Build Status](https://travis-ci.org/Sanji-IO/sanji-puppetmaster.svg)](https://travis-ci.org/Sanji-IO/sanji-puppetmaster) [![Coverage Status](https://coveralls.io/repos/Sanji-IO/sanji-puppetmaster/badge.png?branch=develop)](https://coveralls.io/r/Sanji-IO/sanji-puppetmaster?branch=develop)
==================

Process batch command/data/event from server to clients.

Endpoints
---------
### [Jobs](#job-collection-jobs)
- **/jobs** [GET] List current jobs.
- **/jobs** [POST] Create a job.
- **/jobs/:id** [GET] Get a job's information by id.

### [Requests](#requests-collection-requests)
- **/requests** [GET] List current requests.
- **/requests** [POST] Create request information.
- **/requests/:id** [GET] Get a request's information by id.

RESTful API
-----------

## Job Collection [/jobs]
A set of jobs meta information.

### Retrieve jobs [GET]
Get all current exist jobs.

+ Response 200 (application/json)

          [
            {
              "id": 123145,
              "createdAt": "2014-12-17T06:27:58.220Z",
              "finishedAt": null,
              "timeout": 36000,
              "status": "dispatching",
              "progress": 0,
              "totalCount": 3,
              "finishCount": 0,
              "errorCount": 0,
              "requests": [/** request objects **/]
            },
            {
              "id": 345235,
              "createdAt": "2014-12-17T06:27:58.220Z",
              "finishedAt": null,
              "timeout": 36000,
              "status": "dispatching",
              "progress": 0,
              "totalCount": 3,
              "finishCount": 0,
              "errorCount": 0,
              "requests": [/** request objects **/]
            }
          ]

### Create a job [POST]
The request for POST has following attributes:

- **destinations** (required, array|string): Create job for whom. If passed an array it will automatically expand for you and create requests per destination.
- **message** (required, SanjiMessage): A standard Sanji Message(request) must include `method`, `resource`

The response for POST has following attributes:
- **requests** (array): IDs of requests belongs to this job.

Reboot 3 devices `00:0c:29:1c:e8:01`, `00:0c:29:1c:e8:02`, `00:0c:29:1c:e8:03` at once.

+ Request  (application/json)

    + Body

        {
          "destinations": ["00:0c:29:1c:e8:01", "00:0c:29:1c:e8:02", "00:0c:29:1c:e8:03"],
          "message": [
            {
              "method": "post",
              "resource": "/system/reboot"
            }
          ]
        }

+ Response 200 (application/json)

    + Body

        [
          {
            "id": 123145,
            "createdAt": "2014-12-17T06:27:58.220Z",
            "finishedAt": null,
            "timeout": 36000,
            "status": "dispatching",
            "progress": 0,
            "totalCount": 3,
            "finishCount": 0,
            "errorCount": 0,
            "requests": [
              {
                "id": 8330,
                "method": "post",
                "resource": "/system/reboot",
                "__request": {
                  "destination": "00:0c:29:1c:e8:01",
                  "createdAt": "2014-12-17T06:27:58.220Z",
                  "finishedAt": null,
                  "timeout": 36000,
                  "status": "created",
                  "progress": 0,
                  "result": {}
                }
              }
            ]
          },
          {
            "id": 345235,
            "createdAt": "2014-12-17T06:27:58.220Z",
            "finishedAt": null,
            "timeout": 36000,
            "status": "dispatching",
            "progress": 0,
            "totalCount": 3,
            "finishCount": 0,
            "errorCount": 0,
            "requests": [
              {
                "id": 34534,
                "method": "post",
                "resource": "/system/reboot",
                "__request": {
                  "destination": "00:0c:29:1c:e8:02",
                  "createdAt": "2014-12-17T06:27:58.220Z",
                  "finishedAt": null,
                  "timeout": 36000,
                  "status": "created",
                  "progress": 0,
                  "result": {}
                }
              }
            ]
          },
          {
            "id": 324234,
            "createdAt": "2014-12-17T06:27:58.220Z",
            "finishedAt": null,
            "timeout": 36000,
            "status": "dispatching",
            "progress": 0,
            "totalCount": 3,
            "finishCount": 0,
            "errorCount": 0,
            "requests": [
              {
                "id": 2323,
                "method": "post",
                "resource": "/system/reboot",
                "__request": {
                  "destination": "00:0c:29:1c:e8:03",
                  "createdAt": "2014-12-17T06:27:58.220Z",
                  "finishedAt": null,
                  "timeout": 36000,
                  "status": "created",
                  "progress": 0,
                  "result": null
                }
              }
            ]
          }
        ]


## Job [/jobs/:id]
Single job information

### Retrieve a job information [GET]

The response for GET has following attributes:

- **progress** (integer, `0`): Current progres of all requests in this job.
- **status** (string, `pending`): Job's current status.
- **timeout** (integer, `infinity`): Set job's timeout.
- **createdAt** (string, `currenttime`): Job's creation time.
- **finishedAt** (string, `null`): Job's finish time.
- **totalCount** (integer): Total count of requests.
- **doneCount** (integer): Done count of requests.
- **errorCount** (integer): Error count of requests.
- **requests** (array): Requests in this job.

+ Response 200 (application/json)

    + Body

            {
              "id": 123145,
              "createdAt": "2011-12-19T15:28:46.493Z",
              "finishedAt": "2011-12-19T15:55:46.493Z",
              "timeout": 36000,
              "status": "dispatching",
              "progress": 100,
              "totalCount": 5,
              "finishCount": 3,
              "errorCount": 2,
              "requests": [/** request objects **/]
            }

## Request Collection [/requests]
A set of Requests meta information.


### Retrieve jobs [GET]
Get all current exist jobs.

+ Response 200 (application/json)

    + Body

            [
              {
                "id": 2323,
                "method": "post",
                "resource": "/system/reboot",
                "__request": {
                  "destination": "00:0c:29:1c:e8:03",
                  "createdAt": "2014-12-17T06:27:58.220Z",
                  "finishedAt": null,
                  "timeout": 36000,
                  "status": "created",
                  "progress": 0,
                  "result": null
                }
              },
              {
                "id": 12414,
                "method": "post",
                "resource": "/system/reboot",
                "__request": {
                  "destination": "00:0c:29:1c:e8:04",
                  "createdAt": "2014-12-17T06:27:58.220Z",
                  "finishedAt": null,
                  "timeout": 36000,
                  "status": "created",
                  "progress": 0,
                  "result": null
                }
              }
            ]


## Request [/request/:id]
Request is a command/data/event from server to client (one-to-one).

### Create a request [POST]
The request for POST has following attributes:
- **destination** (required, string): Create request for whom (one). If you want to send to many please create a **Job**.
- **message** (required, SanjiMessage): A standard Sanji Message(request) must include `method`, `resource`

The response for POST has following attributes:
- **requests** (array): IDs of requests belongs to this job.


### Retrieve a request information [GET]

The response for GET has following attributes:

Basically, just extend original *Sanji Message (one-to-one)* with adding a property: `__request` for dispatching/monitoring it.

- **id** (integer): Sanji Message ID.
- **method** (enum): Sanji Message's method field.
- **resource** (string): Sanji Message's resource field.
- **data** (object): Sanji Message's data field.
- **__request.destination** (string): This Sanji Message is belong to whom.
- **__request.createdAt** (object): Creatation time of request.
- **__request.finishedAt** (object): Finish time of request.
- **__request.status** (object): Current status.
- **__request.progress** (object): Progress.
- **__request.result** (object): Result of this request.


+ Response 200 (application/json)

    + Body

            {
              "id": 2323,
              "method": "post",
              "resource": "/system/reboot",
              "__request": {
                "destination": "00:0c:29:1c:e8:03",
                "createdAt": "2014-12-17T06:27:58.220Z",
                "finishedAt": null,
                "timeout": 36000,
                "status": "created",
                "progress": 0,
                "result": null
              }
            }
