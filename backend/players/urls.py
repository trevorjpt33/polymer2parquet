from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, AwardViewSet

router = DefaultRouter()
router.register(r"", PlayerViewSet, basename="player")
router.register(r"awards", AwardViewSet, basename="award")

urlpatterns = [
    path("", include(router.urls)),
]