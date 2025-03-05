# Custom Template

In this section, we will explain how to create a custom template.

## Creating a Basic Custom Template

Creating a custom template is simple. To get started, create a new folder in the `Templates\` directory and name it according to your template. 

Once the folder is created, you have your custom template. If you want to include the current game engine in your template, refer to the next section on [`Advanced Templating`](#advanced-templating) for more details.

## Advanced Templating

To take full advantage of custom templates, you can use a `.template.config` file to define more advanced behavior when initializing your template.

### Creating the Template Config File

In your template folder, create a new file named `.template.config`.

### Template Config Options

The following configuration options are currently supported:

- `EnginePath=`: Specifies the location where the game engine should be copied when the template is initialized.
- `DeleteOnInit=`: If set to `1`, the configuration file will be deleted after initialization.

### Example

Here’s an example of a `.template.config` file:

```config
EnginePath=.
DeleteOnInit=1
```
When a template with this config file is initialized it will copy the game engine to the project root folder and then delete the config file