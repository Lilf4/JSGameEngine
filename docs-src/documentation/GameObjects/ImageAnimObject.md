# ImageAnimObject Class  
**_(Extends [`VisibleObject`](VisibleObject.md))_**  

## Overview  
The `ImageAnimObject` class represents an animated game object using a sprite sheet.  
It supports frame-based animation, playback direction, looping, and sprite sheet configuration.

## Constructor  

### `new ImageAnimObject(options)`

Creates an instance of `ImageAnimObject`.

- `options` (Object) - Inherits all options from [`VisibleObject`](VisibleObject.md), plus:
  - `image` (`HTMLImageElement`, default: `new Image()`) - The sprite sheet image.
  - `imageUrl` (`string|null`, default: `null`) - URL to load a sprite sheet asynchronously.
  - `horizontalStacked` (`boolean`, default: `true`) - Whether frames are stacked horizontally.
  - `spriteColRowCount` (`Vector2`, default: `new Vector2(0,0)`) - Column and row count in the sprite sheet.
  - `spriteSize` (`Vector2`, default: `new Vector2(0,0)`) - The size of each sprite frame.
  - `overrideDisplaySize` (`Vector2|null`, default: `null`) - Custom display size for the sprite.
  - `spriteAmount` (`number`, default: `0`) - Total number of animation frames.
  - `currentFrame` (`number`, default: `0`) - The current frame index.
  - `fps` (`number`, default: `24`) - Frames per second for animation playback.
  - `stopAtEnd` (`boolean`, default: `false`) - Stops animation when it reaches the last frame.
  - `reverseAtEnd` (`boolean`, default: `false`) - Reverses playback direction at the last frame.
  - `animDirection` (`number`, default: `1`) - Animation direction (`1` forward, `-1` reverse).
  - `colRowStartOffset` (`Vector2`, default: `new Vector2(0,0)`) - Start position in the sprite sheet.

## Properties  

- `isPlaying` (`boolean`) - Whether the animation is currently playing.
- `timePassed` (`number`) - The elapsed time since animation start.
- `totalAnimDuration` (`number`) - The total duration of the animation.

## Instance Methods  

### `Play()`  
Starts playing the animation.  

### `Pause()`  
Pauses the animation.  

### `Reset()`  
Resets the animation to its starting frame.  

### `SetSpriteDataByColRowCount(ColRowCount, SpriteAmount = -1, ColRowStartOffset = new Vector2(0,0))`  
Sets the sprite sheet configuration using column and row count.  

- `ColRowCount` (`Vector2`) - Column and row count in the sprite sheet.  
- `SpriteAmount` (`number`, default: `-1`) - Number of frames in the animation.  
- `ColRowStartOffset` (`Vector2`) - Offset for animation start position.  

### `AddTime(delta)`  
Advances animation time and updates the frame index.  

- `delta` (`number`) - Time to add to animation progress.  

### `draw(dt, ctx)`

!!! warning
    **This method is engine-managed and should not be called manually.**  
    The engine calls `draw()` after applying transformations to the canvas.

Renders the current animation frame to the canvas.

- `dt` (`number`) - Delta time since the last frame.
- `ctx` (`CanvasRenderingContext2D`) - The rendering context.