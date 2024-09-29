#!/bin/bash
SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$0")")

# load methodss we need...
. "$SCRIPT_DIR/docker.sh"
. "$SCRIPT_DIR/../.env"


if [ -z "$API_KEY" ]; then
    echo "Error: API KEY is required." >&2
    return 1
fi

if [ -z "$API_PORT" ]; then
    echo "Error: API PORT is required." >&2
    return 1
fi



DATA_DIR="$HOME/typesense-data"
CONTAINER_NAME='typesense'

if [ -n "$RECREATE" ]; then
    stop_and_remove "$CONTAINER_NAME"
fi

echo "DATA_DIR: $DATA_DIR\nCONTAINER_NAME: $CONTAINER_NAME\nAPI KEY: $API_KEY\nAPI PORT:$API_PORT\nRECREATE: $RECREATE\n"


# Start Tor container
if ! container_exists "$CONTAINER_NAME"; then
    echo "Creating and starting $CONTAINER_NAME container..."

    mkdir -p "$DATA_DIR"

    docker run -d --restart unless-stopped \
        --name typesense \
        -p "$API_PORT":8108 \
        -v "$DATA_DIR":/data \
        typesense/typesense:27.1 \
        --data-dir /data \
        --api-key=$API_KEY \
        --enable-cors

elif ! container_running "$CONTAINER_NAME"; then
    echo "Starting existing $CONTAINER_NAME container..."
    docker start "$CONTAINER_NAME"
else
    echo "$CONTAINER_NAME container is already running."
fi

#
