#!/bin/bash

ErrorCodes=("Name Already Used" "Unkown Template")
ErrorFn() {
	printf "Error: %s\n" "${ErrorCodes[$error]}"
	exit 1
}
while [ $# -gt 0 ]; do
  case "$1" in
    -n=*|--name=*)
      name="${1#*=}"
      ;;
    -t=*|--template=*)
      template="${1#*=}"
      ;;
    -\?|--help)
        printf "+----------------------------------------+\n"
        printf "| ProjectInit arguments:                 |\n"
        printf "+----------------------------------------+\n"
        printf "| short | long        | Description      |\n"
        printf "+----------------------------------------+\n"
        printf "| -n=   | --name=     | pre-set name     |\n"
        printf "| -t=   | --template= | pre-set template |\n"
        printf "+----------------------------------------+\n"
        exit 0
      ;;
    *)
      printf "Invalid argument: \"$1\"\n"
      exit 1
  esac
  shift
done

#Start
if [ ! -v name ]; then
	#Set name
	read -p "Enter name of project: " name
fi

if [ -d "Projects/$name" ]; then
	error=0
	ErrorFn
fi

if [ ! -v template ]; then
	#Set name
	read -p "Enter name of template to use: " template
fi

if [ ! -d "Templates/$template" ]; then
	error=1
	ErrorFn
fi

cp -a "Templates/$template" "Projects/$name"

