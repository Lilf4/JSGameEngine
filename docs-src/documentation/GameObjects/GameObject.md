# GameObject Class

## Overview

The `GameObject` class is the base class for all entities in the scene. It provides essential transformation properties such as position, rotation, scale, and optional collision handling. Other game objects extend from this class.

## Constructor

### `new GameObject(options)`

Creates a new instance of `GameObject`.

- `options` (Object) - Configuration options for the game object.
  - `position` (Vector2, default: `new Vector2(0,0)`) - The object's position.
  - `rotation` (number, default: `0`) - The rotation angle of the object in degrees.
  - `scale` (Vector2, default: `new Vector2(1,1)`) - The scale of the object.
  - `colliderSize` (Vector2, default: `new Vector2(10,10)`) - The collider size.
  - `colliderOffset` (Vector2, default: `new Vector2(0,0)`) - The offset of the collider relative to position.
  - `drawCollider` (boolean, default: `false`) - Whether to visually draw the collider for debugging.
  - `name` (string, default: `'GameObject'`) - The name of the game object.
  - `tags` (string[], default: `[]`) - An array of tags for categorization.

## Properties

- `id` (number) - Unique identifier for the object.
- `position` (Vector2) - The object's position.
- `rotation` (number) - The rotation angle of the object.
- `scale` (Vector2) - The scale of the object.
- `colliderSize` (Vector2) - The collider size.
- `colliderOffset` (Vector2) - The offset of the collider relative to position.
- `drawCollider` (boolean) - Whether the collider is drawn for debugging.
- `tags` (string[]) - An array of tags assigned to the object.

## Instance Methods

### `localUp()`

Gets the current up vector based on the object's rotation.

- **Returns:** `Vector2` - The up vector.

### `localRight()`

Gets the current right vector based on the object's rotation.

- **Returns:** `Vector2` - The right vector.

### `movedColliderPosition()`

Gets the position of the object's collider after applying rotation and offset.

- **Returns:** `Vector2` - The adjusted collider position.

### `scaledColliderSize()`

Gets the collider size after applying the object's scale.

- **Returns:** `Vector2` - The adjusted collider size.