# redis-client-query

Client-directed redis query specified in JSON issued over HTTP.

# Design notes

```yaml

  params: 
  - name: index
    type: integer
  - name: section
    type: string

commands:
- command: get  
  key: article:{index}
  type: string
  set: name


  each:
    iterator: id
    key: {article}
    value: {article}
    prop: {article}
    item: {articles}
    key: article:{id}
    type: json
  
  command: hmget
  fields: 
  - id
  - name 
```
