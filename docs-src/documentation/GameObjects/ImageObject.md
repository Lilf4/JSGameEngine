# ImageObject Class  
**_(Extends [`VisibleObject`](VisibleObject.md))_**  

## Overview  
The `ImageObject` class represents a visible game object that renders an image.  
It supports image repetition, scaling, and source cropping overrides.

## Constructor  

### `new ImageObject(options)`  

Creates an instance of `ImageObject`.  

- `options` (Object) - Inherits all options from [`VisibleObject`](VisibleObject.md), plus:
  - `image` (`HTMLImageElement`, default: `new Image()`) - The image to be displayed.
  - `imageUrl` (`string|null`, default: `null`) - URL to load an image asynchronously.
  - `repeat` (`boolean`, default: `false`) - Whether the image should repeat as a pattern.
  - `overrideDisplaySize` (`Vector2|null`, default: `null`) - Custom display size for the image.
  - `overrideImgSourceSize` (`Vector2|null`, default: `null`) - Custom source size for the image.
  - `overrideImgSourcePosition` (`Vector2|null`, default: `null`) - Custom source position for the image.

## Properties  

- `image` (`HTMLImageElement`) - The image displayed by the object.
- `repeat` (`boolean`) - Whether the image is repeated as a pattern.
- `overrideDisplaySize` (`Vector2|null`) - Custom display size for the image.
- `overrideImgSourceSize` (`Vector2|null`) - Custom source size for cropping.
- `overrideImgSourcePosition` (`Vector2|null`) - Custom source position for cropping.

## Instance Methods  

### `imageUrl` (Getter & Setter)  

- **Getter:** Returns the current image URL.  
- **Setter:** Loads an image from the provided URL asynchronously.  

### `draw(dt, ctx)`

!!! warning
    **This method is engine-managed and should not be called manually.**  
    The engine calls `draw()` after applying transformations to the canvas.

Renders the image to the canvas, considering cropping, scaling, and repetition.

- `dt` (`number`) - Delta time since the last frame.
- `ctx` (`CanvasRenderingContext2D`) - The rendering context.