## routes

| path                      | auth     | description            |
| ------------------------- | -------- | ---------------------- |
| /                         | any      | landing page           |
| /login                    | ❌       | login page             |
| /login                    | ✅       | redirect to /dashboard |
| /register                 | ❌       | register page          |
| /register                 | ✅       | redirect to /dashboard |
| /dashboard                | ✅       | dashboard              |
| /jobs                     | any      | list of jobs           |
| /jobs/[id]                | any      | job details            |
| /jobs/[id]/apply          | ✅ appl  | application form       |
| /jobs/[id]/applications   | ✅ recr  | list of applications   |
| /jobs/new                 | ✅ admin | new job form           |
| /applications             | ✅       | list of applications   |
| /applications/[id]        | ✅       | application details    |
| /applications/[id]/edit   | ✅ appl  | edit application       |
| /applications/[id]/review | ✅ recr  | review application     |
| /profile                  | ✅       | profile                |
| /profile/edit             | ✅       | edit profile           |
| /settings                 | ✅       | settings               |

## server

| method | path            | auth     | description  |
| ------ | --------------- | -------- | ------------ |
| GET    | /api/jobs       | any      | list jobs    |
| POST   | /api/jobs       | ✅ admin | create job   |
| GET    | /api/jobs/[id]  | any      | job details  |
| PUT    | /api/jobs/[id]  | ✅ admin | update job   |
| DELETE | /api/jobs       | ✅ admin | delete job   |
| GET    | /api/users      | ✅ admin | list users   |
| GET    | /api/users/[id] | ✅ admin | user details |
