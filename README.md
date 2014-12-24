<a href="//github.com/Sanji-IO/sanji-puppetmaster">
    <img src="http://upload.wikimedia.org/wikipedia/commons/1/16/Godfather_puppetmaster.jpg" align="right" />
</a>

sanji-puppetmaster
==================
[![Build Status](https://travis-ci.org/Sanji-IO/sanji-puppetmaster.svg)](https://travis-ci.org/Sanji-IO/sanji-puppetmaster) [![Coverage Status](https://coveralls.io/repos/Sanji-IO/sanji-puppetmaster/badge.png?branch=develop)](https://coveralls.io/r/Sanji-IO/sanji-puppetmaster?branch=develop)

[![NPM](https://nodei.co/npm/sanji-puppetmaster.png)](https://nodei.co/npm/sanji-puppetmaster/)

Process batch command/data/event from server to clients.

Endpoints
---------
### [Jobs](#job-collection-jobs)
- **/jobs** [GET] List current jobs.
- **/jobs** [POST] Create a job.
- **/jobs/:id** [GET] Get a job's information by id.

### [Requests](#requests-collection-requests)
- **/requests** [GET] List current requests.
- **/requests** [POST] Create a request to destination.
- **/requests/:id** [GET] Get a request's information by id.

RESTful API
-----------
**Read on [APIARY](http://docs.sanjigeneric.apiary.io/#remoteasync)**

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
            "totalCount": 2,
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
              },
              {
                "id": 4444,
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
          },
          {
            "id": 345235,
            "createdAt": "2014-12-17T06:27:58.220Z",
            "finishedAt": null,
            "timeout": 36000,
            "status": "dispatching",
            "progress": 0,
            "totalCount": 1,
            "finishCount": 0,
            "errorCount": 0,
            "requests": [
              {
                "id": 5111,
                "method": "get",
                "resource": "/network/cellulars",
                "__request": {
                  "destination": "01:0c:29:1c:e8:04",
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

### Create a job [POST]
The request for POST has following attributes:

- **destinations** (required, array|string): Create job for whom. If passed an array it will automatically expand for you and create requests per destination.
- **message** (required, SanjiMessage): A standard Sanji Message(request) must include `method`, `resource`

Reboot 3 devices `00:0c:29:1c:e8:01`, `00:0c:29:1c:e8:02`, `00:0c:29:1c:e8:03` at once.

+ Request (application/json)

        {
          "destinations": ["00:0c:29:1c:e8:01", "00:0c:29:1c:e8:02", "00:0c:29:1c:e8:03"],
          "message": {
            "method": "post",
            "resource": "/system/reboot"
          }
        }

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
                  "result": null
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
                  "result": null
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

## Job [/jobs/{id}]
Single job information

+ Parameters
    + id (string) ... ID of the job in the form of a integer

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

### Retrieve a job information [GET]
Get job's current status and requests contains.

+ Response 200 (application/json)

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

## Request Collection [/requests]
A set of Requests meta information.

### Retrieve Request [GET]
Get all current exist requests.

+ Response 200 (application/json)

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


## Request [/requests/{id}]
Request is a command/data/event from server to client (one-to-one).

+ Parameters
    + id (string) ... ID of the request in the form of a integer

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

### Create a request [POST]
The request for POST has following attributes:

- **destination** (optional, string): Create request for whom (default: localhost). If you want to send to many please create a **Job**.
- **message** (required, SanjiMessage): A standard Sanji Message(request) must include `method`, `resource`

The response for POST has following attributes:
- **requests** (array): IDs of requests belongs to this job.

+ Request (application/json)

        {
          "destination": "AA-BB-CC-DD-11-22",
          "message": {
            "method": "get",
            "resource": "/system/status",
            "data": {
              "test": "reqRequestData"
            }
          }
        }

+ Response 200 (application/json)

        {
          "id": 2323,
          "method": "get",
          "resource": "/system/status",
          "data": {
            "test": "reqRequestData"
          }
          "__request": {
            "destination": "AA-BB-CC-DD-11-22",
            "createdAt": "2014-12-17T06:27:58.220Z",
            "finishedAt": null,
            "timeout": 36000,
            "status": "created",
            "progress": 0,
            "result": null
          }
        }
