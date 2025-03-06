# VisibleObject Class  
**_(Extends [`GameObject`](GameObject.md))_**

## Overview

The `VisibleObject` class extends [`GameObject`](GameObject.md) and introduces rendering properties. It is designed for objects that can be drawn on the screen. Subclasses such as images, text, and shapes inherit from this class.

## Constructor

### `new VisibleObject(options)`

Creates a new instance of `VisibleObject`.

- `options` (Object) - Inherits all options from [`GameObject`](GameObject.md), plus:
  - `layer` (number, default: `0`) - The rendering layer of the object.
  - `visible` (boolean, default: `true`) - Whether the object is visible.

## Properties

- `layer` (number) - The object's rendering layer.
- `visible` (boolean) - Whether the object is visible.

## Instance Methods

### `draw(dt, ctx)`

!!! warning
    **This method is managed by the engine and should not be called directly.**  
    The engine calls `draw()` after applying transformations to the canvas.

- `dt` (number) - Time since the last frame.
- `ctx` (CanvasRenderingContext2D) - The canvas rendering context.

- **Throws:** `Error` if not implemented in a subclass.