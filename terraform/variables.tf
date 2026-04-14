variable "project_id" {
  description = "GCP Project ID"
  default     = "polymer2parquet"
}

variable "region" {
  description = "GCP Region"
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  default     = "us-central1-f"
}

variable "cluster_name" {
  description = "GKE Cluster Name"
  default     = "polymer2parquet-cluster"
}

variable "django_secret_key" {
  description = "Django Secret Key"
  sensitive   = true
}

variable "postgres_user" {
  description = "PostgreSQL Username"
  sensitive   = true
  default     = "polymer2parquetuser"
}

variable "postgres_password" {
  description = "PostgreSQL Password"
  sensitive   = true
}

variable "postgres_db" {
  description = "PostgreSQL Database Name"
  default     = "polymer2parquetdb"
}