resource "kubernetes_deployment_v1" "web_deployment" {
  metadata {
    name      = "${var.app_name}-deployment"
    namespace = data.kubernetes_namespace_v1.smw_namespace.metadata[0].name
  }

  spec {
    progress_deadline_seconds = 900
    replicas                  = var.web_replicas

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.app_name
        }
        annotations = {
          "kubernetes.io/change-cause" = "Terraform deployment at ${timestamp()}"
        }
      }

      spec {
        image_pull_secrets {
          name = data.kubernetes_secret_v1.ghcr_secret.metadata[0].name
        }

        container {
          image             = var.web_docker_image
          name              = var.app_name
          image_pull_policy = "Always"

          port {
            container_port = var.web_port
          }

          resources {
            limits = {
              cpu    = var.web_resource_config.limits.cpu
              memory = var.web_resource_config.limits.memory
            }
            requests = {
              cpu    = var.web_resource_config.requests.cpu
              memory = var.web_resource_config.requests.memory
            }
          }

          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = "https://${var.api_domain}"
          }

          env {
            name  = "NEXT_PUBLIC_LEGACY_URL"
            value = "https://${var.web_domain}/admin"
          }
          env {
            name  = "NEXT_PUBLIC_ENV"
            value = var.enviroment
          }
          env {
            name  = "NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY"
            value = var.openreplay_project_key
          }
          env {
            name  = "NEXT_PUBLIC_OPENREPLAY_INGEST_POINT"
            value = var.openreplay_ingest_point
          }

          liveness_probe {
            http_get {
              path = "/admin/v2/api/health"
              port = var.web_port
            }
            initial_delay_seconds = 30
            period_seconds        = 30
            timeout_seconds       = 5
          }

          readiness_probe {
            http_get {
              path = "/admin/v2/api/health"
              port = var.web_port
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
          }
        }
      }
    }
  }
  timeouts {
    create = "15m"
    update = "15m"
  }
} 