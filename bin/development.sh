
  redis-cli keys 'test:remake:*' | xargs redis-cli del

  ( 
    curl -d '{"name":"evan"}' -H "Content-Type: application/json" localhost:8888/post 
    echo
  ) &
  ( 
    curl -d '{"name":"evan"}' -H "Content-Type: application/json" localhost:8888/post 
    echo
  ) &

  sleep 1

  redis-cli keys '*' 

  redis-cli hkeys test:remake:hreq:1:h

  redis-cli hget test:remake:hreq:1:h body | jq '.'

  sleep 1 

  redis-cli hset test:remake:hres:1:h status 200
  redis-cli hset test:remake:hres:1:h body 'hello1'
  redis-cli lpush test:remake:hres:1:q ''

  redis-cli hset test:remake:hres:2:h status 200
  redis-cli hset test:remake:hres:2:h body 'hello2'
  redis-cli lpush test:remake:hres:2:q ''

  sleep 1


