#!/bin/bash


echo "***** Validating arguments *****"

if [ $# -eq 4 ]
    then
        echo "Number of arguments is valid."
    else
            echo "Invalid number of arguments provided!"
            echo "Expected: 4"
            echo "Provided: $#"
            exit 1
fi


ADMIN_SECRET=$1
ADMIN_EMAIL_ADDRESS=$2
SUPPORT_EMAIL_ADDRESS=$3
SUPPORT_EMAIL_PW=$4


echo "***** Generating Dockerfile *****"


cp Dockerfile-template  Dockerfile


echo "*****************************************"
echo "** Injecting environment configuration **"
echo "*****************************************"


sed -i "s,<ADMIN_SECRET>,${ADMIN_SECRET},g" Dockerfile
sed -i "s,<ADMIN_EMAIL_ADDRESS>,${ADMIN_EMAIL_ADDRESS},g" Dockerfile
sed -i "s,<SUPPORT_EMAIL_ADDRESS>,${SUPPORT_EMAIL_ADDRESS},g" Dockerfile
sed -i "s,<SUPPORT_EMAIL_PW>,${SUPPORT_EMAIL_PW},g" Dockerfile


echo "*****************************************"
echo "******* Configuration successful ********"
echo "*****************************************"

