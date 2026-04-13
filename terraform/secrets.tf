resource "google_secret_manager_secret" "django_secret_key" {
  secret_id = "django-secret-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "django_secret_key_version" {
  secret      = google_secret_manager_secret.django_secret_key.id
  secret_data = var.django_secret_key
}

resource "google_secret_manager_secret" "postgres_password" {
  secret_id = "postgres-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "postgres_password_version" {
  secret      = google_secret_manager_secret.postgres_password.id
  secret_data = var.postgres_password
}

resource "google_secret_manager_secret" "postgres_user" {
  secret_id = "postgres-user"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "postgres_user_version" {
  secret      = google_secret_manager_secret.postgres_user.id
  secret_data = var.postgres_user
}