# Venn Diagram Generator

A javascript library for laying out area proportional venn and euler diagrams, based on [venn.js](https://github.com/benfred/venn.js).

## Known Limitation

* Works online only


## Features

* Preview Diagram
  * Instance preview
  * Auto update
  * List items
  * Zoom (Ctrl +/-)
* Multiple Diagrams
  * Different diagrams side by side
  * Different diagrams that share groups
  * Clicking on group that appears in one diagram will trigger listing all items of identical groups in all diagrams.

## File Format

File extension should be .vnn or .venn. and the format is simle JSON.

Properties reference:
* groups (object) - optional

  The object keys will be used to identify the groups later in the items.
  The values are also objects, may be empty.
  If name proerty supplied it will be used in the view instead of the key.

* items (array) - required, unless charts is defined
  * object
    * name (string)
    * groups (array of strings) groups keys names that this item is associated with.

* charts (array) - required, unless items is defined
  * object
    * name (string)
    * items (array of strings) see items above.

### Example:

*single.venn*
```JSON
{
    "groups": {
        "BBB": {
            "name": "B B B"
        }
    },
    "items": [ 
        {"name": "test1", "groups": ["AAA"]},
        {"name": "test 2", "groups": ["BBB"]},
        {"name": "Test 3", "groups": ["CC","BBB"]},
        {"name": "Test 4", "groups": ["CC","BBB", "AAA"]}
    ]
}
```


*multiple.venn*
```JSON
{
    "charts": [
        {
            "name": "objects",
            "items": [ 
                {"name": "User-Role-Cache", "groups": ["TTL", "Key-Value", "Fast"]},
                {"name": "User-Role", "groups": ["Numeric-Filter"]},
                {"name": "Asset", "groups": ["Inherited","Key-Value", "Fast", "Nested"]},
                {"name": "Searchable-Asset", "groups": [
                    "Text-Search",
                    "Numeric-Filter", 
                    "Nested",
                    "Inherited"
                ]}
            ]
        },
        {
            "name": "data",
            "items": [ 
                {"name": "Couchbase", "groups": [
                    "TTL", 
                    "Key-Value", 
                    "Consistent", 
                    "Nested",
                    "Inherited",
                    "Free"
                ]},
                {"name": "MongoDB", "groups": [
                    "TTL", 
                    "Key-Value", 
                    "Consistent", 
                    "Nested",
                    "Inherited",
                    "Free"
                ]},
                {"name": "Redis", "groups": [
                    "TTL", 
                    "Fast",
                    "Key-Value", 
                    "Consistent", 
                    "Nested",
                    "Inherited",
                    "Binary",
                    "Free"
                ]},
                {"name": "Memcache", "groups": [
                    "TTL", 
                    "Key-Value", 
                    "Fast", 
                    "Consistent",
                    "Nested",
                    "Inherited",
                    "Binary",
                    "Free"
                ]},
                {"name": "ElasticSearch", "groups": [
                    "Consistent",
                    "Numeric-Filter",
                    "Nested",
                    "Text-Search",
                    "Inherited",
                    "Free"
                ]},
                {"name": "MS-SQL", "groups": [
                    "Consistent",
                    "Numeric-Filter"
                ]},
                {"name": "MySql", "groups": [
                    "Consistent",
                    "Numeric-Filter",
                    "Nested",
                    "Binary",
                    "Free"
                ]},
                {"name": "S3", "groups": [
                    "Consistent",
                    "Key-Value",
                    "Nested",
                    "TTL",
                    "Inherited",
                    "Binary"
                ]},
                {"name": "DynamoDB", "groups": [
                    "Consistent",
                    "Key-Value",
                    "Numeric-Filter",
                    "Nested",
                    "TTL",
                    "Inherited"        
                ]}        
            ]
        }
    ]
}
```

## Issues

Please report [here](https://github.com/tan-tan-kanarek/vscode-venn/issues).

## TODO

* Export as HTML
* Export as image
* Reference item to group in a different diagram
* CSS Style
  * Global
  * Per chart
  * Per group
  * Per list
  * Per item
