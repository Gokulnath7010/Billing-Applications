from django.urls import path

from .views import create_invoice, product_list

urlpatterns = [
    path('products/', product_list, name='billing_products'),
    path('invoice/', create_invoice, name='billing_invoice'),
]
