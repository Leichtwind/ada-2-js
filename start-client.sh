#!/usr/bin/env sh

docker run --rm --network ada-2-js --env="RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672" "$(docker build -q .)" "$@"
