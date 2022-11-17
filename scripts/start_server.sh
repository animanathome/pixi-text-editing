#!/bin/bash

pid=$(lsof -ti tcp:8080)
if ! [[ $pid ]]; then
  echo "starting server"
  http-server -p 8080 &
else
  echo "server running"
fi