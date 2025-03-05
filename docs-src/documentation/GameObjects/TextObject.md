# TextObject Class  
**_(Extends [`VisibleObject`](VisibleObject.md))_**  

## Overview  
The `TextObject` class represents a visible game object that renders text.  
It supports customizable fonts, colors, alignment, line height, and optional outline rendering.  
This is useful for UI elements, dialogue, or in-game labels.

## Constructor  

### `new TextObject(options)`

Creates an instance of `TextObject`.

- `options` (Object) - Inherits all options from [`VisibleObject`](VisibleObject.md), plus:
  - `text` (`string`, default: `"new text!"`) - The text content.
  - `color` (`string`, default: `'white'`) - The text color.
  - `drawAsOutline` (`boolean`, default: `false`) - Whether to draw the text as an outline.
  - `outlineThickness` (`number`, default: `1`) - The thickness of the text outline.
  - `font` (`string`, default: `"30px Verdana"`) - The font styling.
  - `alignment` (`string`, default: `"left"`) - The text alignment (`"left"`, `"center"`, `"right"`).
  - `lineHeight` (`number`, default: `30`) - The line height for multi-line text.

## Properties  

- `text` (`string`) - The text content.
- `color` (`string`) - The text color.
- `font` (`string`) - The font styling.
- `alignment` (`string`) - The text alignment.
- `lineHeight` (`number`) - The spacing between lines.

## Instance Methods  

### `draw(dt, ctx)`

!!! warning
    **This method is engine-managed and should not be called manually.**  
    The engine calls `draw()` after applying transformations to the canvas.

Renders the text onto the canvas.

- `dt` (`number`) - Delta time since the last frame.
- `ctx` (`CanvasRenderingContext2D`) - The rendering context.