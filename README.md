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
* [Room for Improvement](#room-for-improvement)
* [Showcase](#showcase)

## Authors

[@ZMizgalski](https://github.com/ZMizgalski)

## ! Deliverables and Evaluation Criteria !

I have implemented the entire application for this showcase as Corrected / Improved

### Asynchronous Notification

(Security) - I have included sanitation and application vulnerabilities protection mechanisms, such as CSRF, CSP, etc.

#### Changes made for asynchronous notifications

(BackgroundTaskQueue) - To prevent the main thread from being blocked, I implemented BackgroundTaskQueue class, which handles background tasks in the queue using python threading. After each request, new (background task) is appended to the queue using the add_task function. These tasks are then executed in the background. To enhance efficiency and reduce unnecessary CPU usage, task_queue.get utilizes a timeout of 0.5, which can minimize excessive waiting. The BackgroundTaskQueue allows for the configuration of num_workers, thereby enabling the management of a specified number of background workers for task execution.

#### Streaming updates

When a user submits a task request, my system follows this process:
  1. Verifies the CSRF token, CSP and common vulnerabilities using (flask-talisman, flask-WTF, Flask-Limiter)
  2. Validates the payload through Marshmallow schema (TaskDTOSchema, TaskDTOUpdateSchema)
  3. Updates the database synchronously
  4. After the update, the system reliably adds a new socket event to the (background tasks) queue for asynchronous execution in the _worker_loop, ensuring optimal performance in the main thread. (BackgroundTaskQueue)
  5. Events are populated to the connected clients

For new clients, the backend fires a 'tasks' event that sends all recent tasks sorted_by task_id when a socket connection is established. This ensures that tasks are kept in order during page refreshes and integrates seamlessly with Angular's @for (...; trackBy: task.id) functionality.

#### Key concepts

State Order List:
  1. The CSRF_TOKEN cookie is sent to the user for each request
  2. CSP policy is applied with all scripts being nonced. The flask renders template with render_template function and nonce is applied to ngCspDirective and the meta="nonce" tag in index.html.
  3. New client initiates a socket connection via flask-socketIO.
  4. Using 'tasks' socket event all latests tasks are sended to the client as (background task) instead of using provided (@GET /api/tasks) only on 'connect'
  5. Each task modification from request is added to the (background tasks) queue for subsequent execution. (add, remove, update)

### RxJS Integration

(Security) - CSP_NONCE is applied with ngCspDirective and the CSRF token is retrieved from the cookie and appended to the headers on each request.

#### Streaming updates

I employed NgRx/Effects and NgRx/Store to manage distinct socket events ('add', 'delete', 'update') (FASocketService) through RxJS's merge() operator and task management actions with http calls. Each event is mapped to specific action processed through a dedicated reducer (FATasksEffects), enhancing the application's scalability for future expansion.

(FATasksEffects) - This system is responsible for managing all actions related to tasks, including actions dispatched in components related to task management and socket events, such as loading notifications, tasks loading, and tasks management.

(FASocketService) - Oversees the management of socket connections and socket events in the constructor during the 'connect' event with teardown, as provided by socket.io-client. It also dispatches loadTasksAction and loadNotificationAction to maintain application state using state management. The reconnect option is set to true and the delay is specified. To enhance cross-platform compatibility, two transports [ 'pooling', 'websocket' ] are employed as a fallback mechanism.

In order to alleviate the component's responsibility, I have developed three actions (addTaskAction, updateTaskAction, and deleteTaskAction) that are linked to the provided REST endpoints in separate effects. This approach enables the reducer layer to contain all the logic for state manipulation based on the mapped socket events and user task actions. This approach fosters a clean separation of concerns and establishes a solid foundation for future feature development.

### Key Concepts

For UI, I used the PrimeNG component library and all components have onPush change detection and no view encapsulation, and all paths and routes implement lazy loading.

For smaller bundle size build optimizations are applied in the angular.json file.

State Order List:
  1. After refreshing the page, the socket establishes a connection with backend and executes the loadTasksAction and loadNotificationAction actions. If this attempt is unsuccessful, the socket will attempt to reconnect with a delay of 300
  2. If attempt is successful, the "tasks" event is retrieved from the socket and caught by the loadTasks$ effect then all tasks are populated in the tasks application state using the tasksReducer
  3. In this example, TasksSelector is utilized in a component to retrieve all tasks$ from the store. It is then subscribed with the async pipe in the template to retrieve the latest updates
  4. The user initiates a particular action within the component, which subsequently triggers a specific endpoint. In this scenario, the reducer oversees the application's state, specifically for the tasks associated with it
  5. Specific sendNotificationAction is called from socket ('add', 'remove', 'delete') event, merged into one observable in sendNotification$ effect
  6. Reducer handles specific action sent with notification payload from sendNotification$ effect and updates tasks in application state. At the same time, primeNG Toast is added to the view
  7. Cycle is repeated for new users. For existing users we start at 4.

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

## Tech stack

#### Frontend
 - PrimeNG
 - Angular
 - @tailwindcss
 - socket.io-client
 - rxjs
 - lodash-es
 - eslint
 - @ngrx/effects
 - @ngrx/store
 - ts-xor

#### Backend
 - Python
 - Flask
 - Flask-Cors
 - Gunicorn
 - python-dotenv
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

## Room for Improvement
- Tests

## Showcase

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
