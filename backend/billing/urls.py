from django.urls import path

from .views import billing_page, create_invoice, product_list

urlpatterns = [
    path('', billing_page, name='billing_page'),
    path('products/', product_list, name='billing_products'),
    path('invoice/', create_invoice, name='billing_invoice'),
]
