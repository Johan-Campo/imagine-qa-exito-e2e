# Test info

- Name: Add to cart >> adds a product after choosing a pickup location

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.

Call log:
  - waiting for getByRole('dialog').filter({ hasText: '¿Cómo quieres recibir tu pedido?' }).getByRole('combobox').first()
```

# Page snapshot

```yaml
- banner:
    - button "1 Carrito"
    - button "¿ Cómo quieres recibir tu pedido ?"
```
