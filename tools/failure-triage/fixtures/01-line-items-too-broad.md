# Test info

- Name: Add to cart >> adds a product after choosing a pickup location

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator: getByRole('listitem').filter({ has: getByRole('textbox') })
Expected: 1
Received: 2
Timeout: 10000ms

Call log:
  - waiting for getByRole('listitem').filter({ has: getByRole('textbox') })
    23 × locator resolved to 2 elements
       - unexpected value "2"

  38 |
  39 |   await cart.open();
> 40 |   await expect(cart.lineItems).toHaveCount(1);
```

# Page snapshot

```yaml
- complementary:
    - list:
        - listitem:
            - text: $ 40.750
            - textbox: '1'
```
