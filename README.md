# Full-Stack-Flask-Angular Application

## Current implementation

Tech stack

Frontend
 - PrimeNG
 - 

Backend

## Setup

### Python
```
cd backend

python3 -m venv venv 
source venv/bin/activate

python3 -m pip install -r requirements.txt
```

### Create .env file
```
cd backend
touch .env
```

```javascript
FLASK_ENV="'development' or 'production' or 'staging'"

// OWASP ASVS compatible secrets v2.6.2
// at least 112 bits of entropy 2^112

JWT_SECRET_KEY="<secret>" // https://jwtsecret.com/generate
SECRET_KEY="<secret>"

SQLALCHEMY_DATABASE_URI="<database_url>"
```

# Start

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

# DB Migrations

### Clean setup
```
rm -rf migrations/

python3 -m flask --app src/main.py db init
python3 -m flask --app src/main.py db migrate -m "Task Migration"
python3 -m flask --app src/main.py db upgrade
```

### Apply migrations
```
python3 -m flask --app src/main.py db upgrade
```