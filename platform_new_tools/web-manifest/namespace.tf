# Note: This namespace should already exist from the API manifest
# We're referencing it here to ensure consistency
data "kubernetes_namespace_v1" "smw_namespace" {
  metadata {
    name = var.namespace
  }
} 