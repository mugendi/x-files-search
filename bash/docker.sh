# Copyright (c) 2024 Anthony Mugendi
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

# Function to check if a container exists
container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# Function to check if a container is running
container_running() {
    docker ps --format '{{.Names}}' | grep -q "^$1$"
}

# Function to stop a container if it exists and is running
stop_container() {
    if container_exists "$1"; then
        if docker ps -q -f name="$1" | grep -q .; then
            echo "Stopping $1 container..."
            docker stop "$1"
        else
            echo "$1 container is not running."
        fi
    else
        echo "$1 container does not exist."
    fi
}

# Function to stop and remove a container if it exists
stop_and_remove() {
    if container_exists "$1"; then
        echo "Stopping and removing $1 container..."
        docker stop "$1" 2>/dev/null
        docker rm "$1"
    else
        echo "$1 container does not exist."
    fi
}
