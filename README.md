# remake


## Design ideas 

### Example routes

#### News application

/article
  - POST - create
  - GET - query/find

/article/:id
  - GET - retrieve
  - PUT - update/replace
  - PATCH - update/modify
  - DELETE

/article/:id/publish

#### Retail application

#### Cloud application 

/services {name, }

/services/:id/tasks { gitrepo, env, count } 


### Access control

/articles
- Create article
- View article
- Delete article
- Publish article

### client-directed query 

Client-directed redis query specified in JSON issued over HTTP.

#### Design notes

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
  
- command: hmget
  fields: 
  - id
  - name
  
  
```
