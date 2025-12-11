resource "kubernetes_ingress_v1" "web_ingress" {
  metadata {
    name      = "${var.app_name}-ingress"
    namespace = data.kubernetes_namespace_v1.smw_namespace.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                    = "nginx"
      "nginx.ingress.kubernetes.io/ssl-redirect"       = "true"
      "nginx.ingress.kubernetes.io/proxy-body-size"    = "50m"
      "nginx.ingress.kubernetes.io/proxy-send-timeout" = "300"
      "nginx.ingress.kubernetes.io/proxy-read-timeout" = "300"
      "cert-manager.io/cluster-issuer"                 = "letsencrypt-prod"

      # CRITICAL: Forward Next.js RSC (React Server Components) headers for client-side navigation
      # Without these, Next.js will fall back to full page reloads
      # This ensures RSC headers are forwarded to the backend
      "nginx.ingress.kubernetes.io/add-response-header-x-nextjs-data" = "1"

      # Don't cache RSC data requests - they must be fresh
      "nginx.ingress.kubernetes.io/proxy-no-cache"     = "1"
      "nginx.ingress.kubernetes.io/proxy-cache-bypass" = "1"
    }
  }

  spec {
    ingress_class_name = "nginx"
    tls {
      hosts = [
        var.web_domain
      ]
      secret_name = "${var.app_name}-tls"
    }

    rule {
      host = var.web_domain
      http {
        path {
          path      = "/admin/v2"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.web_service.metadata[0].name
              port {
                number = kubernetes_service_v1.web_service.spec.0.port.0.port
              }
            }
          }
        }
        path {
          path      = "/admin/v2/_next/static"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.web_service.metadata[0].name
              port {
                number = kubernetes_service_v1.web_service.spec.0.port.0.port
              }
            }
          }
        }
        path {
          path      = "/admin/v2/_next/image"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.web_service.metadata[0].name
              port {
                number = kubernetes_service_v1.web_service.spec.0.port.0.port
              }
            }
          }
        }
        path {
          path      = "/admin/v2"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.web_service.metadata[0].name
              port {
                number = kubernetes_service_v1.web_service.spec.0.port.0.port
              }
            }
          }
        }
      }
    }
  }
}
