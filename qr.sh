#!/bin/bash

ngrok http 3000 > /dev/null &

sleep 2

url=$(curl -s http://127.0.0.1:4040/api/tunnels \
    | grep -o '"public_url":"https:[^"]*' \
    | sed -e 's/"public_url":"//')

echo "scan this qr code to open the controller: $url"
echo "$url" | qrencode -t ANSIUTF8
