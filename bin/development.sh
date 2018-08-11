
  redis-cli keys 'test:remake:*' | xargs redis-cli del

  curl -d '{"name":"evan"}' -H "Content-Type: application/json" localhost:8888/post; echo

  redis-cli keys '*' 

  redis-cli hgetall test:remake:hreq:1:h

  redis-cli hget test:remake:hreq:1:h body | jq '.'


