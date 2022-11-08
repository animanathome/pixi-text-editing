#!/bin/bash

FILE=./dist/test.js
if [ -f "$FILE" ]; then
    echo "$FILE exists."
else
    echo "$FILE does not exist."
fi
