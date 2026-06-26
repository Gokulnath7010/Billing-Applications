import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


@csrf_exempt
@require_POST
def login_view(request):
    
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return JsonResponse({ 'error': 'Username and password are required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({ 'error': 'Invalid credentials'}, status=401)

    login(request, user)
    return JsonResponse({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
    })


@csrf_exempt
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({ 'success': True})
