#!/bin/bash

# 2019 © Postgres.ai

set -x

install_gettext() {
  if [[ "$OSTYPE" == "darwin"* ]]; then  # Mac OSX
    brew install gettext
    brew link --force gettext
  else  # Linux
    if [[ "$(command -v apk)" != "" ]]; then
      apk add gettext
    elif [[ "$(command -v apt-get)" != "" ]]; then
      apt-get update
      apt-get install gettext-base
    fi
  fi
}

subs_envs() {
  rm -f $2

  if [[ "$(command -v envsubst)" == "" ]]; then
    install_gettext
  fi

  # Import additional envs from file specified in second arg.
  if [ ! -z ${ENV+x} ]; then
    source "./deploy/configs/${ENV}.sh"
  fi

  cat $1 | envsubst > $2
}

run_local() {
  docker rm --force postgres-ai-local-docs

  source ./deploy/configs/local.sh

  docker build \
    --tag postgres-ai-local/docs:dev \
    --build-arg ARG_URL="${URL}" \
    --build-arg ARG_BASE_URL="${BASE_URL}" \
    --build-arg ARG_SIGN_IN_URL="${SIGN_IN_URL}" \
    .

  docker run \
    --name postgres-ai-local-docs \
    --publish 3000:3000 \
    postgres-ai-local/docs:dev
}

is_command_defined() {
    type $1 2>/dev/null | grep -q 'is a function'
}

# Parse command and arguments.
COMMAND=$1
shift
ARGUMENTS=${@}

# Run command.
is_command_defined $COMMAND
if [ $? -eq 0 ]; then
  $COMMAND $ARGUMENTS
else
  echo "Command not found"
fi
