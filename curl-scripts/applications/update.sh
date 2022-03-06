#!/bin/bash

API="http://localhost:4741"
URL_PATH="/applications"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "application": {
      "company": "'"${COMPANY}"'",
      "role": "'"${ROLE}"'",
      "salary": "'"${SALARY}"'",
      "status": "'"${STATUS}"'"
    }
  }'

echo
