# CustomShapeObject Class  
**_(Extends [`VisibleObject`](VisibleObject.md))_**

## Overview  
The `CustomShapeObject` class represents a game object that renders custom vector shapes.  
It supports both filled and outlined shapes, allowing for flexible shape customization.

## Constructor

### `new CustomShapeObject(options)`

Creates an instance of `CustomShapeObject`.

- `options` (Object) - Inherits all options from [`VisibleObject`](VisibleObject.md), plus:
  - `shape` (Path2D, default: `new Path2D()`) - The shape to be drawn.
  - `color` (string, default: `'white'`) - The fill color of the shape.
  - `drawAsOutline` (boolean, default: `false`) - Whether to draw the shape as an outline.
  - `outlineThickness` (number, default: `1`) - The thickness of the outline.

## Properties

- `shape` (Path2D) - The custom shape to be drawn.
- `color` (string) - The color of the shape.
- `drawAsOutline` (boolean) - Whether the shape is drawn as an outline.
- `outlineThickness` (number) - The thickness of the outline.

## Instance Methods

### `draw(dt, ctx)`

!!! warning
    **This method is managed by the engine and should not be called directly.**  
    The engine calls `draw()` after applying transformations to the canvas.

- `dt` (number) - Time since last frame.
- `ctx` (CanvasRenderingContext2D) - The canvas rendering context.