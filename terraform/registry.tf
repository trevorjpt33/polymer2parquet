resource "google_artifact_registry_repository" "polymer2parquet_registry" {
  location      = var.region
  repository_id = "polymer2parquet"
  format        = "DOCKER"
  description   = "Docker registry for polymer2parquet images"
}