# Stage 1: Build React frontend
FROM node:20-slim AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Flask backend
FROM python:3.12-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1 to backend's static folder
# Note: We'll update Flask to serve these files
COPY --from=build-stage /app/frontend/dist ./static

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
