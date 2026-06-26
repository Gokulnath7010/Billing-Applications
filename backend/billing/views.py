import json
from decimal import Decimal

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Invoice, InvoiceItem, Product


def _product_data(product):
    return {
        'id': product.id,
        'name': product.name,
        'price': str(product.price),
        'description': product.description,
    }


def _invoice_data(invoice):
    return {
        'id': invoice.id,
        'created_at': invoice.created_at.isoformat(),
        'total': str(invoice.total),
        'items': [
            {
                'product_id': item.product.id,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'unit_price': str(item.price),
                'line_total': str(item.line_total),
            }
            for item in invoice.items.all()
        ],
    }


def billing_page(request):
    return render(request, 'billing/billing_page.html')


@require_GET
def product_list(request):
    if Product.objects.count() == 0:
        Product.objects.bulk_create([
            Product(name='Product A', price=Decimal('9.99'), description='Basic item'),
            Product(name='Product B', price=Decimal('19.99'), description='Standard item'),
            Product(name='Product C', price=Decimal('29.99'), description='Premium item'),
        ])

    products = Product.objects.all()
    return JsonResponse({'products': [_product_data(product) for product in products]})


@csrf_exempt
@require_POST
def create_invoice(request):
    try:
        data = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON payload.'}, status=400)

    items = data.get('items')
    if not isinstance(items, list) or len(items) == 0:
        return JsonResponse({'error': 'Provide an "items" list with product_id and quantity.'}, status=400)

    if len(items) > 3:
        return JsonResponse({'error': 'A maximum of 3 products can be added to an invoice.'}, status=400)

    validated_items = []
    total = Decimal('0.00')

    for entry in items:
        if not isinstance(entry, dict):
            return JsonResponse({'error': 'Each item must be an object with product_id and quantity.'}, status=400)

        product_id = entry.get('product_id')
        quantity = entry.get('quantity', 1)

        try:
            product_id = int(product_id)
            quantity = int(quantity)
        except (TypeError, ValueError):
            return JsonResponse({'error': 'product_id and quantity must be integers.'}, status=400)

        if quantity < 1:
            return JsonResponse({'error': 'Quantity must be at least 1.'}, status=400)

        product = Product.objects.filter(pk=product_id).first()
        if product is None:
            return JsonResponse({'error': f'Product with id {product_id} was not found.'}, status=404)

        line_total = product.price * quantity
        total += line_total
        validated_items.append((product, quantity, product.price))

    invoice = Invoice.objects.create(total=total)
    for product, quantity, price in validated_items:
        InvoiceItem.objects.create(invoice=invoice, product=product, quantity=quantity, price=price)

    return JsonResponse({'success': True, 'invoice': _invoice_data(invoice)})
