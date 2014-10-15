sanji-puppetmaster
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
- **/jobs/:id** [GET] [DELETE] `?collection=true` to embedded tasks in `collection`.
- **/jobs/:id/ws** WebSocket for job's realtime information.
- **/tasks/:id** [GET] Get task information.

REST API
--------

## Job Collection [/jobs]
A set of jobs meta information

### Create a job [POST]

The request for POST has following attributes:
- **timeout** (optional, integer, `infinity`): Set job's timeout.
- **batch[].method** (required, enum): Http method (GET, POST, PUT, DELETE)
- **batch[].resource** (required, string): Http uri
- **batch[].data** (optional, object): Request content.
- **batch[].__destination** (required, array|string): Create job for whom. If passed an array it will automatically expand for you and create tasks per destination.

The response for POST has following attributes:
- **collection** (array): IDs of tasks belongs to this job.

Reboot 3 devices `00:0c:29:1c:e8:01`, `00:0c:29:1c:e8:02`, `00:0c:29:1c:e8:03` at once.

+ Request  (application/json)

        {
          "batch": [
            {
              "method": "post",
              "resource", "/system/reboot",
              "data": {},
              "__destination": ["00:0c:29:1c:e8:01", "00:0c:29:1c:e8:02", "00:0c:29:1c:e8:03"]
            }
          ]
        }

+ Response 200 (application/json)

        {
          "id": 123145,
          "createdAt": "2011-12-19T15:28:46.493Z",
          "finishAt": null,
          "timeout": 36000,
          "status": "dispatching",
          "progress": 0,
          "totalCount": 3,
          "finishCount": 0,
          "errorCount": 0,
          "collection": [3452, 365, 546345]
        }


## Job [/jobs/:id]
Single job information

### Retrieve a job information [GET]

The response for GET has following attributes:

- **progress** (integer, `0`): Current progres of all tasks in this job.
- **status** (string, `pending`): System timezone settings.
- **timeout** (integer, `infinity`): Set job's timeout.
- **createdAt** (string, `currenttime`): Job's creation time.
- **finishAt** (string, `null`): Job's finish time.
- **totalCount** (integer): Total count of tasks.
- **doneCount** (integer): Done count of tasks.
- **errorCount** (integer): Error count of tasks.
- **collection** (array): Tasks in this job.


+ Response 200 (application/json)

    + Header

            X-My-Header: The Value

    + Body

            {
              "id": 123145,
              "createdAt": "2011-12-19T15:28:46.493Z",
              "finishAt": "2011-12-19T15:55:46.493Z",
              "timeout": 36000,
              "status": "dispatching",
              "progress": 100,
              "totalCount": 5,
              "finishCount": 3,
              "errorCount": 2,
              "collection": [
                {
                  "id": 5648943,
                  "method": "post",
                  "resource", "/system/reboot",
                  "tunnel": "/remote",
                  "data": {},
                  "__destination": "00:0c:29:1c:e8:01",
                  "__task": {
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishAt": null,
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
                  "__destination": "00:0c:29:1c:e8:02",
                  "__task": {
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishAt": null,
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
                  "__destination": "00:0c:29:1c:e8:03",
                  "__task": {
                    "createdAt": "2011-12-19T15:28:46.493Z",
                    "finishAt": null,
                    "status": "sent",
                    "progress": 0,
                    "result": {}
                  }
                }
              ]
            }

## Job WebSocket[/jobs/:id/wc]

## Task [/task/:id]

Task is a command/data/event from server to client (one-to-one).

### Retrieve a job information [GET]

The response for GET has following attributes:

Basically, just extend original *Sanji Message (one-to-one)* with adding two properties: `__task`, `__destination` for dispatching/monitoring it.

- **id** (integer): Sanji Message ID.
- **method** (enum): Sanji Message's method field.
- **resource** (string): Sanji Message's resource field.
- **data** (object): Sanji Message's data field.
- **__destination** (string): This Sanji Message is belong to whom.
- **__task.createdAt** (object): Creatation time of task.
- **__task.finishAt** (object): Finish time of task.
- **__task.status** (object): Current status.
- **__task.progress** (object): Progress.
- **__task.result** (object): Result of this task.


+ Response 200 (application/json)

    + Header

            X-My-Header: The Value

    + Body

            {
              "id": 5648943,
              "method": "post",
              "resource", "/system/reboot",
              "data": {},
              "__destination": "00:0c:29:1c:e8:01",
              "__task": {
                "createdAt": "2011-12-19T15:28:46.493Z",
                "finishAt": null,
                "status": "sent",
                "progress": 0,
                "result": {}
              }
            }


