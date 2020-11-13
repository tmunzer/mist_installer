from django.urls import path

from . import views

urlpatterns = [
    path('devices/', views.pull_inventory, name='inventory'),
    path('devices/claims/', views.claim_devices, name='claim'),
    path('devices/unclaim/', views.unclaim_device, name='unclaim'),
    path('devices/provision/', views.provision_device, name='provision'),
    path('login/', views.login, name='login'),
    path('sites/', views.sites, name='sites'),    
]

