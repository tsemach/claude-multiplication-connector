### build the docker file
````
docker build -f apps/backend/Dockerfile -t claude-backend:latest .
````

### run the image
````
docker run -p 3000:3000 -e PORT=3000 -e CORS_ORIGINS=http://*:3002 claude-backend:latest
````

### run deployment script to gcp
````
./deploy.sh your-project-id
```