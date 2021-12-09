from django.urls import path
from django.conf.urls import handler404

from . import views

urlpatterns = [
    path(r'', views.index.as_view(), name='index'),
    path(r'login', views.index.as_view(), name='index'),
    path(r'select', views.index.as_view(), name='index'),
    path(r'dashboard', views.index.as_view(), name='index'),
]

handler404 = views.handler404