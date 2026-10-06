# Test info

- Name: Add to cart >> asks for a city and a store before adding a grocery product

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('dialog').filter({ hasText: '¿Cómo quieres recibir tu pedido?' }).getByRole('combobox').nth(1)
Expected: disabled
Error: element(s) not found
```

# Page snapshot

```yaml
- dialog:
    - combobox
    - button "Confirmar"
```
