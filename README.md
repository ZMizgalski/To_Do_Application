# To-Do Application

A modern task management web application combining Angular frontend with secure WebSocket-powered backend for real-time task updates. Featuring intuitive task creation, editing, and deletion in a clean interface.

Security is paramount with comprehensive protections including CSRF tokens, input sanitization against XSS attacks, Content Security Policy enforcement, and rate limiting to prevent DoS attempts.

The application's WebSocket architecture delivers instant task updates via dedicated background threads, ensuring responsive performance without blocking the main application thread. 

## Authors

- [@ZMizgalski](https://github.com/ZMizgalski)

## Required Tasks

I've implemented whole application for this showcase.

### RxJS Integration

I implemented NgRx architecture instead of using a single REST endpoint which was already provided @Get /api/tasks. I used NgRx/Effects and NgRx/Store to handle separate socket events ('add', 'delete', 'update') combined through RxJS's merge() operator.

Each event maps to specific actions processed through dedicated reducers, which significantly enhances my application's scalability.

Also to relieve the component of responsibility I created 'add', 'update', 'delete' actions which connects provided endpoints in separate effects.

Reducer layer contains all the logic for state manipulation based on the mapped socket events and task actions. This creates a clean separation of concerns and provides a solid foundation for adding future features.

When a user submits a task request, my system follows this process:

  1. Verifies the CSRF token and CSP and common vulnerabilities using (flask-talisman, flask-WTF)
  2. Validates the payload through Marshmallow schema (TaskDTOSchema, TaskDTOUpdateSchema)
  3. Updates the database synchronously
  4. After successful database update, I dispatch new socket event to the background task queue for laster asynchronous execution, keeping my main thread performant.

For new clients, my backend transmits all tasks sorted by task_id when a socket connection is established. This prevents task reordering during page refreshes and works perfectly with Angular's @for trackBy directive with task.id tracking.

For UI I was using the PrimeNG component library

## API Reference

#### Authorize

```http
  POST /api/tasks
```

| Parameter   | Type      | Description                                                                               |
| :---------- | :-------- | :---------------------------------------------------------------------------------------- |
| `title`     | `string`  | **Required** The title of the task.                                                       |
| `completed` | `boolean` | **Required** The status of the task (True for completed, False otherwise).                |
| `due_date	` | `string`  | **Required** The due date of the task in the format YYYY-MM-DD. It must be a future date. |

#### Register

```http
  PUT /api/tasks/<int:task_id>
```

| Parameter   | Type      | Description                                                                               |
| :---------- | :-------- | :---------------------------------------------------------------------------------------- |
| `title`     | `string`  | **Required** The title of the task.                                                       |
| `completed` | `boolean` | **Required** The status of the task (True for completed, False otherwise).                |
| `due_date	` | `string`  | **Required** The due date of the task in the format YYYY-MM-DD. It must be a future date. |
| `task_id`   | `integer` | **Required** The unique ID of the task to update.                                         |

#### Delete Task

```http
  DELETE /api/tasks/<int:task_id>
```

| Header    | Type      | Description                                       |
| :-------- | :-------- | :------------------------------------------------ |
| `task_id` | `integer` | **Required** The unique ID of the task to update. |

#### Get news

```http
  GET /api/getNews/:id
```

| Header          | Type     | Description                |
| :-------------- | :------- | :------------------------- |
| `Authorization` | `string` | **Required**. Bearer token |

| Parameter | Type     | Description          |
| :-------- | :------- | :------------------- |
| `id`      | `string` | **Required** User id |


## Tech stack

#### Frontend
 - PrimeNG
 - Angular
 - @tailwindcss
 - socket.io-client
 - rxjs
 - eslint
 - @ngrx/effects
 - @ngrx/store

#### Backend
 - Python
 - Flask
 - Flask-WTF
 - Flask-Compress
 - Flask-Limiter
 - Flask-Migrate
 - Flask-SQLAlchemy
 - Flask-Talisman
 - marshmallow
 - PostgreSQL

## Application Setup

### 1. Python

From root directory

```
cd backend

python3 -m venv venv 
source venv/bin/activate

python3 -m pip install -r requirements.txt
```

### 2. Create .env file

In backend directory

```
touch .env
```

Example Config

```javascript
FLASK_ENV="'development' or 'production' or 'staging'"

// OWASP ASVS compatible secrets v2.6.2
// At least 112 bits of entropy 2^112
// https://jwtsecret.com/generate

JWT_SECRET_KEY="<secret>"
SECRET_KEY="<secret>"

// Database URL example "postgresql://postgres:postgres@localhost:5432/tasks"

SQLALCHEMY_DATABASE_URI="<database_url>"
```

### 3. Init Database

In backend directory

#### Clean setup

```
rm -rf migrations/

python3 -m flask --app src/main.py db init
python3 -m flask --app src/main.py db migrate -m "Task Migration"
python3 -m flask --app src/main.py db upgrade
```

#### Apply existing migrations

```
python3 -m flask --app src/main.py db upgrade
```

### 4. Install node_modules

From root directory

```javascript
cd frontend

// https://classic.yarnpkg.com

yarn
```

# Deployment

From root directory

```
cd backend
```

### Development
```
FLASK_ENV=development python -m src.main
```

### Stage for demo purposes
```
FLASK_ENV=staging python -m src.main
```

### Production
```
FLASK_ENV=production python -m src.main
```

### Production with gunicorn

NGINX configuration required

```
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:8000 src.main:app
```

## Screenshots