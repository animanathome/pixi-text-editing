#!/bin/bash

FILE=./dist/test.js
if [ -f "$FILE" ]; then
    echo "$FILE exists."
else
    echo "$FILE does not exist."
fi

if ! command -v floss &> /dev/null
then
    echo "floss could not be found"
else
    echo "floss exist"
fi