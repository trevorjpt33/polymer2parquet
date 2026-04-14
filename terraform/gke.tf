resource "google_container_cluster" "polymer2parquet_cluster" {
  name     = var.cluster_name
  location = var.zone

  network    = google_compute_network.polymer2parquet_vpc.name
  subnetwork = google_compute_subnetwork.polymer2parquet_subnet.name

  # Remove default node pool and create a custom one
  remove_default_node_pool = true
  initial_node_count       = 1

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  deletion_protection = false

  timeouts {
    create = "60m"
    update = "60m"
    delete = "60m"
  }
}

resource "google_container_node_pool" "polymer2parquet_nodes" {
  name     = "polymer2parquet-node-pool"
  location = var.zone
  cluster  = google_container_cluster.polymer2parquet_cluster.name

  node_count = 2

  node_config {
    machine_type    = "e2-small"
    disk_size_gb    = 30
    service_account = google_service_account.polymer2parquet_sa.email

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 3
  }
}
