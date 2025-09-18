from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import Task, Pharmacy, TaskComment

def home(request):
    """Home page view"""
    tasks = Task.objects.all()[:5]  # Show latest 5 tasks
    pharmacies = Pharmacy.objects.all()
    context = {
        'tasks': tasks,
        'pharmacies': pharmacies,
    }
    return render(request, 'tasks/home.html', context)

def task_list(request):
    """List all tasks"""
    tasks = Task.objects.all()
    context = {
        'tasks': tasks,
    }
    return render(request, 'tasks/task_list.html', context)

def pharmacy_list(request):
    """List all pharmacies"""
    pharmacies = Pharmacy.objects.all()
    context = {
        'pharmacies': pharmacies,
    }
    return render(request, 'tasks/pharmacy_list.html', context)

def task_detail(request, task_id):
    """Show details of a specific task"""
    task = get_object_or_404(Task, id=task_id)
    comments = task.comments.all()
    context = {
        'task': task,
        'comments': comments,
    }
    return render(request, 'tasks/task_detail.html', context)
