from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerSeasonViewSet

router = DefaultRouter()
router.register(r"", PlayerSeasonViewSet, basename="playerseason")

urlpatterns = [
    path("", include(router.urls)),
]