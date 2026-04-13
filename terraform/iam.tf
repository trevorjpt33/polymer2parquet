resource "google_service_account" "polymer2parquet_sa" {
  account_id   = "polymer2parquet-sa"
  display_name = "polymer2parquet Service Account"
}

resource "google_project_iam_member" "artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.polymer2parquet_sa.email}"
}

resource "google_project_iam_member" "secret_manager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.polymer2parquet_sa.email}"
}