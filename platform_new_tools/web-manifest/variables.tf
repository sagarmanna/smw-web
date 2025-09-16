# Application Name
variable "app_name" {
  description = "Name of the Web Application"
  type        = string
  default     = "smw-web"
}

# Environment
variable "env" {
  description = "Environment to deploy the resources"
  type        = string
}
variable "enviroment" {
  description = "Environment to deploy the resources"
  type        = string
}

# Application Namespace
variable "namespace" {
  description = "Namespace of the application"
  type        = string
  default     = "smw-v2"
}

# Kubernetes Context
variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "default"
}

# Github Username
variable "github_username" {
  description = "Github Username to pull the image from GHCR"
  type        = string
}

# Github PAT Token
variable "github_pat_token" {
  description = "Github PAT Token to pull the image from GHCR"
  type        = string
}

# Github Email ID
variable "github_email_id" {
  description = "Github Email ID to pull the image from GHCR"
  type        = string
}

# Web Domain Name
variable "web_domain" {
  description = "Domain for the web application"
  type        = string
}

# API Domain Name (for frontend to backend communication)
variable "api_domain" {
  description = "Domain for the API application (used by frontend)"
  type        = string
}

# Web Resource Configuration
variable "web_resource_config" {
  description = "Resource configuration for CPU and memory limits and requests"
  type = object({
    limits = object({
      cpu    = string
      memory = string
    })
    requests = object({
      cpu    = string
      memory = string
    })
  })
  default = {
    limits = {
      cpu    = "500m"
      memory = "512Mi"
    }
    requests = {
      cpu    = "250m"
      memory = "256Mi"
    }
  }
}

# Web Docker Image
variable "web_docker_image" {
  description = "Docker Image with repository name and tag for Web"
  type        = string
  default     = "ghcr.io/your-org/smw-web:latest"
}

# Web Port
variable "web_port" {
  description = "Port for the web service"
  type        = number
  default     = 3000
}

# Web Replicas
variable "web_replicas" {
  description = "Number of replicas for the web deployment"
  type        = number
  default     = 1
} 