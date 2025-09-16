resource "kubernetes_service_v1" "web_service" {
  metadata {
    name      = "${var.app_name}-service"
    namespace = data.kubernetes_namespace_v1.smw_namespace.metadata[0].name
  }

  spec {
    selector = {
      app = var.app_name
    }

    port {
      port        = var.web_port
      target_port = var.web_port
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
} 