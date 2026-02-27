# Production Environment Configuration for Web
env        = "prod"
enviroment = "production"

# Web Domain
web_domain = "smw.arcadiamusicacademy.com"

# API Domain (for frontend to backend communication)
api_domain = "prod-api.studiomanagerweb.com"

# Web Docker Image
web_docker_image = "ghcr.io/arcadia-music-academy/smw-web:latest"

# Web Replicas
web_replicas = 2

# Resource Configuration
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
openreplay_project_key  = "9kqcrYpTgvDj9lHXx7yG"
openreplay_ingest_point = "https://openreplaynew.studiomanagerweb.com/ingest"