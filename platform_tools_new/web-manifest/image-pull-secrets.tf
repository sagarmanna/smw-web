data "kubernetes_secret_v1" "ghcr_secret" {
  metadata {
    name      = "ghcr-secret"
    namespace = data.kubernetes_namespace_v1.smw_namespace.metadata[0].name
  }
} 