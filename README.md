# polymer2parquet
TO-DO: Live Custom Domain
## Overview

**polymer2parquet** is a full-stack, containerized web application for exploring NBA and ABA historical player statistics, as well as current player statistics. The name references the ABA's well-known red, white, and blue **polymer** rubber ball and the NBA's iconic **parquet** hardwood floors. The **2** in the name **polymer2parquet** symbolizes the two indelibly linked leagues at the forefront of professional basketball history in the United States.

## Features
What it does:

- Browse and search 5,416 NBA and ABA players with full career stat tables, bio info, and career trajectory charts
- Filter players by position, league, era, and status
- Compare up to 3 players side-by-side across per-game, shooting, advanced, and accolade stats with weighted career averages
- Browse all 104 NBA and ABA franchises with season-by-season roster views
- One of the few platforms that treats NBA and ABA data as a unified dataset

Tech stack:

- Frontend: React + TypeScript (Vite) + Tailwind CSS, served via NGINX
- Backend: Python (Django) + Django REST Framework
- Database: PostgreSQL 16
- Containerization: Docker (multi-stage builds)
- Local dev: Docker Compose
- Orchestration: Kubernetes (GKE)
- Traffic routing: Kubernetes Gateway API + NGINX Gateway Fabric
- Cloud: GCP (GKE, Artifact Registry, Secret Manager)
- Infrastructure as Code: Terraform with remote state in GCS, in tandem with Ansible for Configuration Management
- Data visualization: Recharts
- Data source: Kaggle NBA/ABA datasets enriched via management commands

## Navigation Preview

Homepage
<img width="1920" height="901" alt="polymer2parquet - Homepage" src="https://github.com/user-attachments/assets/7be2a419-6a26-4b07-a84d-e4177d168a75" />

Player Encyclopedia
<img width="1903" height="901" alt="polymer2parquet - Player Encyclopedia" src="https://github.com/user-attachments/assets/7ef6a188-c99b-42e9-b478-c407b6c2e083" />

Player Details
<img width="1903" height="1024" alt="polymer2parquet - Player Details" src="https://github.com/user-attachments/assets/cc44db03-e6e1-433b-82f6-eda96e7944a9" />

Career Trajectory Chart
<img width="1903" height="908" alt="polymer2parquet - Career Trajectory Chart" src="https://github.com/user-attachments/assets/08a3b515-8b36-4551-bbae-31a809737434" />

Team Encyclopedia
<img width="1920" height="901" alt="polymer2parquet - Teams Encyclopedia" src="https://github.com/user-attachments/assets/61617a46-f296-4a2e-892b-ed4fa4596240" />

Team Details
<img width="1903" height="1387" alt="polymer2parquet - Teams Details" src="https://github.com/user-attachments/assets/90cd1d80-f72b-4876-a4ed-f1dfca8eb30f" />
