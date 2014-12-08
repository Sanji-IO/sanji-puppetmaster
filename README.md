sanji-puppetmaster [![Build Status](https://travis-ci.org/Sanji-IO/sanji-puppetmaster.svg)](https://travis-ci.org/Sanji-IO/sanji-puppetmaster) [![Coverage Status](https://coveralls.io/repos/Sanji-IO/sanji-puppetmaster/badge.png?branch=develop)](https://coveralls.io/r/Sanji-IO/sanji-puppetmaster?branch=develop)
==================

```
                  ___  _  _ ___  ___  ____ ___ _  _ ____ ____ ___ ____ ____ 
                  |__] |  | |__] |__] |___  |  |\/| |__| [__   |  |___ |__/ 
                  |    |__| |    |    |___  |  |  | |  | ___]  |  |___ |  \ 
                                                                      
```

Process batch command/data/event from server to clients.

Endpoints
---------
- **/jobs** [GET] [POST] List/Create current jobs.
- **/jobs/:id** [GET] [DELETE] `?collection=true` to embedded requests in `collection`.
- **/jobs/:id/ws** WebSocket for job's realtime information.
- **/requests/:id** [GET] Get request information.

RESTful API
-----------

## Job Collection [/jobs]
A set of jobs meta information.

### Create a job [POST]
The request for POST has following attributes:
- **timeout** (optional, integer, `infinity`): Set job's timeout (unit: seconds).
- **batch[].method** (required, enum): Http methods (GET, POST, PUT, DELETE)
- **batch[].resource** (required, string): Http uri
- **batch[].data** (optional, object): Request content.
- **batch[].__request.__destination** (required, array|string): Create job for whom. If passed an array it will automatically expand for you and create requests per destination.

The response for POST has following attributes:
- **requests** (array): IDs of requests belongs to this job.

Reboot 3 devices `00:0c:29:1c:e8:01`, `00:0c:29:1c:e8:02`, `00:0c:29:1c:e8:03` at once.

+ Request  (application/json)

        {
          "batch": [
            {
              "method": "post",
              "resource", "/system/reboot",
              "data": {},
              "__request": {
                "destination": ["00:0c:29:1c:e8:01", "00:0c:29:1c:e8:02", "00:0c:29:1c:e8:03"]
              }
            }
          ]
        }

+ Response 200 (application/json)

        {
          "id": 123145,
          "createdAt": "2011-12-19T15:28:46.493Z",
          "finishedAt": null,
          "timeout": 36000,
          "status": "dispatching",
          "progress": 0,
          "totalCount": 3,
          "finishCount": 0,
          "errorCount": 0,
          "requests": [3452, 365, 546345]
        }


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

    + Header

            X-My-Header: The Value

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
              "requests": [
                {
                  "id": 5648943,
                  "method": "post",
                  "resource", "/system/reboot",
                  "tunnel": "/remote",
                  "data": {},
                  "__request": {
                    "destination": "00:0c:29:1c:e8:01",
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishedAt": null,
                    "status": "sent",
                    "progress": 0,
                    "result": {}
                  }
                },
                {
                  "id": 5648944,
                  "method": "post",
                  "resource", "/system/reboot",
                  "tunnel": "/remote",
                  "data": {},
                  "__request": {
                    "destination": "00:0c:29:1c:e8:02",
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishedAt": null,
                    "status": "sent",
                    "progress": 0,
                    "result": {}
                  }
                },
                {
                  "id": 5648945,
                  "method": "post",
                  "resource", "/system/reboot",
                  "tunnel": "/remote",
                  "data": {},
                  "__request": {
                    "destination": "00:0c:29:1c:e8:03",
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishedAt": null,
                    "status": "sent",
                    "progress": 0,
                    "result": {}
                  }
                }
              ]
            }

## Job WebSocket[/jobs/ws[/:id]]
If a job object changed, it will sends job object immediately.

+ Response 200 (application/json)

    + Body

        {
          "id": 123145,
          "createdAt": "2011-12-19T15:28:46.493Z",
          "finishedAt": null,
          "timeout": 36000,
          "status": "dispatching",
          "progress": 0,
          "totalCount": 3,
          "finishCount": 0,
          "errorCount": 0,
          "requests": [3452, 365, 546345]
        }

## Request [/request/:id]

Request is a command/data/event from server to client (one-to-one).

### Retrieve a job information [GET]

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

    + Header

            X-My-Header: The Value

    + Body

            {
              "id": 5648943,
              "method": "post",
              "resource", "/system/reboot",
              "data": {},
              "__request": {
                "destination": "00:0c:29:1c:e8:01",
                "createdAt": "2011-12-19T15:28:46.493Z",
                "finishedAt": null,
                "status": "sent",
                "progress": 0,
                "result": {}
              }
            }


