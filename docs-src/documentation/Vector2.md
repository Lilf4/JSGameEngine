# Vector2 Class

## Overview

The `Vector2` class represents a 2D vector with basic vector operations such as addition, subtraction, multiplication, division, normalization, and dot product. This class is useful for handling positions, velocities, and directions in 2D space.


## Static Properties

- `Vector2.Up`: A vector pointing up (0, 1).
- `Vector2.Down`: A vector pointing down (0, -1).
- `Vector2.Left`: A vector pointing left (-1, 0).
- `Vector2.Right`: A vector pointing right (1, 0).
- `Vector2.Zero`: A vector with zero magnitude (0, 0).

## Constructor

### `new Vector2(x, y)`

Creates an instance of a 2D vector with the given coordinates.

  - `x` (number): The x-coordinate of the vector.
  - `y` (number): The y-coordinate of the vector.

## Static Methods

### `Vector2.add(a, b)`

Adds vector **a** to vector **b**.

  - `a` (Vector2): The first vector.
  - `b` (Vector2): The second vector.
- **Returns:** `Vector2` - The resulting vector.

### `Vector2.sub(a, b)`

Subtracts vector **b** from vector **a**.

  - `a` (Vector2): The first vector.
  - `b` (Vector2): The second vector.
- **Returns:** `Vector2` - The resulting vector.

### `Vector2.mult(a, x)`

Multiplies vector **a** with scalar **x**.

  - `a` (Vector2): The vector.
  - `x` (number): The scalar value.
- **Returns:** `Vector2` - The resulting vector.

### `Vector2.div(a, x)`

Divides vector **a** by scalar **x**.

  - `a` (Vector2): The vector.
  - `x` (number): The scalar value.
- **Returns:** `Vector2` - The resulting vector.

### `Vector2.magnitude(a)`

Calculates the magnitude of vector **a**.

  - `a` (Vector2): The vector.
- **Returns:** `number` - The magnitude of the vector.

### `Vector2.normalize(a)`

Normalizes vector **a**.

  - `a` (Vector2): The vector.
- **Returns:** `Vector2` - The normalized vector.

### `Vector2.dot(a, b)`

Calculates the dot product of vector **a** and vector **b**.

  - `a` (Vector2): The first vector.
  - `b` (Vector2): The second vector.
- **Returns:** `number` - The dot product.

## Instance Methods

### `add(b)`

Adds vector **b** to the current vector.

  - `b` (Vector2): The vector to add.
- **Returns:** `Vector2` - The resulting vector.

### `sub(b)`

Subtracts vector **b** from the current vector.

  - `b` (Vector2): The vector to subtract.
- **Returns:** `Vector2` - The resulting vector.

### `mult(x)`

Multiplies the current vector with scalar **x**.

  - `x` (number): The scalar value.
- **Returns:** `Vector2` - The resulting vector.

### `div(x)`

Divides the current vector by scalar **x**.

  - `x` (number): The scalar value.
- **Returns:** `Vector2` - The resulting vector.

### `magnitude()`

Calculates the magnitude of the current vector.

- **Returns:** `number` - The magnitude of the vector.

### `normalize()`

Normalizes the current vector.

- **Returns:** `Vector2` - The normalized vector.

### `dot(b)`

Calculates the dot product of the current vector and vector **b**.

  - `b` (Vector2): The vector to dot with.
- **Returns:** `number` - The dot product.