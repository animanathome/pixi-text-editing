#!/bin/bash

if curl --head --silent --fail http://127.0.0.1:8080/resources/grid.png 2> /dev/null;
 then
  echo "This server is up and running exists."
 else
  echo "Unable to reach file at http://127.0.0.1:8080"
fi