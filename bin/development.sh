
redis1() {
  result=`redis-cli $*`
  >&2 echo "$*" 
  if [ "$result" -ne 1 ] 
  then
    >&2 echo "result: $result"
  fi
}

redise() {
  >&2 echo "$*"
  redis-cli $*
}

  redis-cli keys 'mk:*' | xargs redis-cli del

  ( 
    curl -d '{"name":"evan"}' -H "Content-Type: application/json" localhost:8888/post 
  ) &
  sleep .1
  ( 
    curl -d '{"name":"evan"}' -H "Content-Type: application/json" localhost:8888/post 
  ) &

  sleep .1

  redis-cli keys '*' 

  redis-cli hkeys mk:hreq:1:h

  redis-cli hget mk:hreq:1:h body | jq '.'

  sleep .1 
 
  redise brpoplpush mk:hreq:q mk:hreq:p:q 1
  redis1 hset mk:hres:1:h status 200
  redis1 hset mk:hres:1:h body 'hello1'
  redis1 publish mk:hres:ch 1

  redise brpoplpush mk:hreq:q mk:hreq:p:q 1
  redis1 hset mk:hres:2:h status 200
  redis1 hset mk:hres:2:h body 'hello2'
  redis1 publish mk:hres:ch 2

  sleep 3


