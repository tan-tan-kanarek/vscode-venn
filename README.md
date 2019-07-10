# Venn Diagram Generator

A javascript library for laying out area proportional venn and euler diagrams, based on [venn.js](https://github.com/benfred/venn.js).

## Features

* Preview Diagram
  * Instance preview
  * Auto update
  * List items

## File Format

File extension should be .vnn or .venn. and the format is simle JSON.

The following properties are required:
* groups (object)

  The object keys will be used to identify the groups later in the items.
  The values are also objects, may be empty.
  If name proerty supplied it will be used in the view instead of the key.

* items (array)
  * object
    * name (string)
    * groups (array of strings) groups keys names that this item is associated with.

### Example:

*test.venn*
```JSON
{
    "groups": {
        "AAA": {},
        "BBB": {
            "name": "B B B"
        },
        "CC": {}
    },
    "items": [ 
        {"name": "test1", "groups": ["AAA"]},
        {"name": "test 2", "groups": ["BBB"]},
        {"name": "Test 3", "groups": ["CC","BBB"]},
        {"name": "Test 4", "groups": ["CC","BBB", "AAA"]}
    ]
}
```