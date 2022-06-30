from django.urls import path

from . import views

urlpatterns = [
    path('devices/', views.pull_inventory, name='inventory'),
    path('devices/locate/', views.locate, name='locate'),
    path('devices/unlocate/', views.unlocate, name='locate'),
    path('devices/claim/', views.claim_devices, name='claim'),
    path('devices/unclaim/', views.unclaim_device, name='unclaim'),
    path('devices/provision/', views.provision_device, name='provision'),
    path('login/', views.login, name='login'),
    path('sites/', views.sites, name='sites'),    
    path('sites/installer/', views.changeInstaller, name='change installer access'),    
    path('maps/', views.maps, name='maps'),    
    path('script', views.script, name="googlemaps"),
    path('gap', views.gap, name="gap"),
    path('disclaimer', views.disclaimer, name="disclaimer"),
    path('hosts', views.hosts, name="hosts"),
]

