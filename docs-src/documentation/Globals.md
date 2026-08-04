# Globals

This document outlines the globally available properties and functions provided by the code. These include predefined shapes, utility functions, and the resource manager.

## Global Constants

### `BasicSquarePath`
A predefined `Path2D` object representing a square centered at `(0,0)`, with a width and height of `10` units.

### `BasicSpherePath`
A predefined `Path2D` object representing a circle (sphere) centered at `(0,0)`, with a radius of `5`.

### `BasicTrianglePath`
A predefined `Path2D` object representing an upward-facing triangle centered at `(0,0)` with a width and height of `10` units.

## Utility Functions

### `GetUUID()`
Generates a random unique identifier.

**Returns:**  
- `{string}` A random UUID-like string.

## Resource Management

### `resManager`
An instance of `ResourceManager`, responsible for handling image loading and caching.
