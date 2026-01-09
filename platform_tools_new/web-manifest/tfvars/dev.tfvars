# Development Environment Configuration for Web
env        = "dev"
enviroment = "development"

# Web Domain
web_domain = "dev2.studiomanagerweb.com"

# API Domain (for frontend to backend communication)
api_domain = "api.dev2.studiomanagerweb.com"


# Web Docker Image
web_docker_image = "ghcr.io/arcadia-music-academy/smw-web:latest"

# Web Replicas
web_replicas = 1

# Resource Configuration - Increased for Next.js build
web_resource_config = {
  limits = {
    cpu    = "2000m"
    memory = "4Gi"
  }
  requests = {
    cpu    = "1000m"
    memory = "2Gi"
  }
}

#Open replay
openreplay_project_key  = "ynaB5AYYp4ypy8aRX6NU"
openreplay_ingest_point = "https://openreplay.studiomanagerweb.com/ingest"
