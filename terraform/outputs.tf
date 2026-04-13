output "cluster_name" {
  description = "GKE Cluster Name"
  value       = google_container_cluster.polymer2parquet_cluster.name
}

output "cluster_location" {
  description = "GKE Cluster Location"
  value       = google_container_cluster.polymer2parquet_cluster.location
}

output "registry_url" {
  description = "Artifact Registry URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/polymer2parquet"
}

output "registry_backend_image" {
  description = "Backend image URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/polymer2parquet/polymer2parquet-backend:latest"
}

output "registry_frontend_image" {
  description = "Frontend image URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/polymer2parquet/polymer2parquet-frontend:latest"
}