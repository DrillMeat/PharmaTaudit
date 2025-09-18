from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('tasks/', views.task_list, name='task_list'),
    path('pharmacies/', views.pharmacy_list, name='pharmacy_list'),
    path('tasks/<int:task_id>/', views.task_detail, name='task_detail'),
]
