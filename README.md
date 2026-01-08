# FlyAway

FlyAway es una aplicación web para planificar viajes que permite gestionar usuarios y viajes.



## Arquitectura

La aplicación está basada en una arquitectura de **microservicios**:

- **API Gateway** (Node.js + Express)
- **User Trips Service** (NestJS + MySQL)
- **External Data Service** (FastAPI + MongoDB)
- **Frontend** (React + Vite)

La comunicación entre servicios se realiza a través del API Gateway.

## Configuración de variables de entorno (.env)

### Gateway
```
PORT=3030
USERS_TRIPS_SERVICE=http://localhost:3001
EXTERNAL_DATA_SERVICE=http://localhost:3002
```

### External Data Service
```
MONGO_URI=mongodb://localhost:27017
```

### User Trips Service
```
DB_NAME=flyaway
DB_USER=root
DB_PASS=root
DB_HOST=localhost
JWT_SECRET=supersecreto
PORT=3001

GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3030/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```
#### Google OAuth

1. Ve a la Google Cloud Console: https://console.cloud.google.com/apis/dashboard
2.  Credenciales → Crear credenciales → OAuth Client ID → Web application.
3. Añade:
    - Orígenes autorizados de JavaScript: http://localhost:5173

    - URIs de redireccionamiento autorizados: http://localhost:3030/api/auth/google/callback


## Ejecución con Docker

### Requisitos
- Docker
- Docker Compose

### Arranque de la aplicación

Desde la raíz del proyecto:

```
docker compose up --build
```

## Ejecución manual

### Requisitos
- Node.js (v18+)
- npm
- Python 3.10+
- pip

### API Gateway
```
cd api-gateway
npm install
npm start
```

### External Data Service
```
cd external-data-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3002
```

### Users Trips Service
```
cd user-trips-service
npm install
npm run start:dev
```

### Frontend
```
cd flyaway-frontend
npm install
npm run dev
```

### Base de datos
#### MySQL
Instalar MySQL o usar Docker: 
```
docker run -d --name flyaway-mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8
```
Crear la base de datos:
```
CREATE DATABASE flyaway;
```

#### MongoDB
Instalar MongoDB o usar Docker: 
```
docker run -d --name flyaway-mongo -p 27017:27017 -v mongo_data:/data/db mongo:6
```

## Acceso
Frontend: http://localhost:5173

API Gateway: http://localhost:3030/api
