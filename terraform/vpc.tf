resource "google_compute_network" "polymer2parquet_vpc" {
  name                    = "polymer2parquet-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "polymer2parquet_subnet" {
  name          = "polymer2parquet-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.polymer2parquet_vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}