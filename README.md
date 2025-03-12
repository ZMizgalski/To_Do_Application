# To-Do Application

A modern task management web application combining Angular frontend with secure WebSocket-powered backend for real-time task updates. Featuring intuitive task creation, editing, and deletion in a clean interface.

Security is paramount with comprehensive protections including CSRF tokens, input sanitization against XSS attacks, Content Security Policy enforcement, and rate limiting to prevent DoS attempts.

The application's WebSocket architecture delivers instant task updates via dedicated background threads, ensuring responsive performance without blocking the main application thread.

## Table of Contents
* [Authors](#authors)
* [Deliverables and Evaluation Criteria](#deliverables-and-evaluation-criteria)
* [API Reference](#api-reference)
* [Tech stack](#tech-stack)
* [Setup](#setup)
* [Usage](#usage)
* [Screenshots](#screenshots)

## Authors

[@ZMizgalski](https://github.com/ZMizgalski)

## ! Deliverables and Evaluation Criteria !

I have implemented the entire application for this showcase.

### Asynchronous Notification

(BackgroundTaskQueue) - To prevent the main thread from being blocked, I implemented BackgroundTaskQueue, which handles background tasks in the queue. After each request, new (background task) is appended to the queue using the add_task function. These tasks are then executed in the background. To enhance efficiency and reduce unnecessary CPU usage, task_queue utilizes a timeout of 0.5, which can minimize excessive waiting. The BackgroundTaskQueue feature allows for the configuration of num_workers, thereby enabling the management of a specified number of background workers for task execution.

(Security) - I have included sanitation and application vulnerabilities protection mechanisms, such as CSRF, CSP, etc.

When a user submits a task request, my system follows this process:
  1. Verifies the CSRF token, CSP and common vulnerabilities using (flask-talisman, flask-WTF, Flask-Limiter)
  2. Validates the payload through Marshmallow schema (TaskDTOSchema, TaskDTOUpdateSchema)
  3. Updates the database synchronously
  4. After the update, the system reliably dispatches a new socket event to the background task queue for asynchronous execution in _worker_loop, ensuring optimal performance in the main thread. (BackgroundTaskQueue)

For new clients, backend transmits all latest tasks sorted_by task_id when socket connection is established. This ensures that tasks remain ordered during page refreshes and seamlessly integrates with Angular's @for (...; trackBy: task.id) functionality.

### RxJS Integration

I implemented NgRx architecture integrated with socket events instead of using a single REST endpoint, which was already provided (@GET /api/tasks). I employed NgRx/Effects and NgRx/Store to manage distinct socket events ('add', 'delete', 'update') (FASocketService) through RxJS's merge() operator. Each event is mapped to specific actions processed through a dedicated reducer (FATasksEffects), enhancing the application's scalability for future expansion.

(FATasksEffects) - This system is responsible for managing all actions related to tasks, including actions dispatched in components related to task management and socket events, such as task loading notifications, task loading, and task management.

(FASocketService) - Oversees the management of socket connections and socket events in the constructor during the 'connect' event with teardown, as provided by socket.io-client. It also dispatches loadTasksAction and loadNotificationAction to maintain application connectivity in the event of connection issues or reconnection. The reconnect option is set to true and the delay is specified. To enhance cross-platform compatibility, two transports [ 'pooling', 'websocket' ] are employed as a fallback mechanism. 

In order to alleviate the component's responsibility, I have developed three actions (addTaskAction, updateTaskAction, and deleteTaskAction) that are linked to the provided REST endpoints in separate effects. This approach enables the reducer layer to contain all the logic for state manipulation based on the mapped socket events and user task actions. This approach fosters a clean separation of concerns and establishes a solid foundation for future feature development.

For user interface design, I implemented the PrimeNG component library.

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

## Setup

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

## Usage

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

### 1.

<img width="1127" alt="1" src="https://github.com/user-attachments/assets/93bfc9b4-2f6a-46db-8a64-63a0295ee764" />

### 2.

<img width="1081" alt="2" src="https://github.com/user-attachments/assets/07075e79-954f-4b5c-818b-5ba262e50640" />

### 3.

<img width="1106" alt="3" src="https://github.com/user-attachments/assets/b7ebc68e-af8d-4272-a3e5-7554261407d7" />

### 4.

<img width="816" alt="4" src="https://github.com/user-attachments/assets/d3bd20ea-dad4-4c5d-b58b-387be83bf785" />

### 5.

<img width="1085" alt="5" src="https://github.com/user-attachments/assets/8e28ba65-4b93-4a0c-9964-afa49febbfc0" />

### 6.

https://github.com/user-attachments/assets/1597b441-24c7-41c1-954b-1fa0e9071d6b
