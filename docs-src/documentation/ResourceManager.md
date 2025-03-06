# ResourceManager Class

## Overview

**Important!**<br>A `ResourceManager` object is automatically instanced as `resManager` when the engine code gets loaded.<br><br>
The `ResourceManager` class handles resources such as loaded images and allows for caching of these resources.

## Constructor

### `new ResourceManager()`

Creates an instance of the `ResourceManager` class.

## Instance Methods

### `LoadImage(path)`

Loads an image and saves it to the cache.

- `path` (String): The image path or URL.
- **Returns:** `Promise<Image>` - A promise that resolves to the loaded image.

### `ClearCache()`

Clears the cache of the resource manager.