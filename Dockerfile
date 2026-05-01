# Stage 1: Build React frontend
FROM --platform=linux/amd64 node:18-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Flask backend
FROM --platform=linux/amd64 python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=build-stage /app/frontend/dist ./static

# Expose port
EXPOSE 5000

# Command to run
CMD ["python", "app.py"]
