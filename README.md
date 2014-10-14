sanji-puppetmaster
==================

Process batch command/data/event from server to clients.

Task
----
Task is a command/data/event from server to client (one-to-one).
```json
{
  "id": 5648943,
  "method": "post",
  "resource", "/system/reboot",
  "tunnel": "/remote",
  "data": {},
  "__task": {
    "createdAt": "2011-12-19T15:28:46.493Z",
    "finishAt": undefined,
    "timeout": 3600,
    "status": "sent",
    "progress": 0,
    "result": {}
  }
}
```
Basically, extend original *Sanji Message (one-to-one)* with `__task` property.


Job
---
Job is a collection of tasks.

```json
{
  "id": 123145,
  "createdAt": "2011-12-19T15:28:46.493Z",
  "finishAt": "2011-12-19T15:28:46.493Z",
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
      "__task": {
        "createdAt": "2011-12-19T15:28:46.493Z",
        "finishAt": undefined,
        "timeout": 3600,
        "status": "sent",
        "progress": 0,
        "result": {}
      }
    }
  ]
}
```

Endpoints
---------
- **/jobs** [GET] [POST]
- **/jobs/:id** [GET] [DELETE] `?collection=true` to embedded tasks in `collection`
- **/jobs/:id/ws** WebSocket for job's realtime information
