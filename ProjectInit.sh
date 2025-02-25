#!/bin/bash

ErrorCodes=("Name Already Used" "Unkown Template")
ErrorFn() {
	printf "Error: %s\n" "${ErrorCodes[$error]}"
	exit 1
}
if [ ! -d "Projects" ]; then
	mkdir "Projects"
fi

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

nameArr=()
nameArr+=('default')

for dir in Templates/*/; 
do 
	formattedName=$(basename -- "$dir") 
	if [ ! "$formattedName" = "default" ]; then
		nameArr+=($formattedName)
	fi
done

if [ ! -v template ]; then
	i=0;
	printf "Detected templates:\n"
	for dirName in "${nameArr[@]}";
	do
		printf "%d - %s\n" "$i" "${nameArr[$i]}"
		i=$(($i+1))
	done

	read -p "Enter name of template to use (default=0): " template
	if [ -z ${template} ]; then
		template="0"
	fi
fi

re='^[0-9]+$'
if [[ $template =~ $re ]]; then
	if [ "${template}" -gt "$((${#nameArr[@]} - 1))" ]; then
		error=1
		ErrorFn
	fi
	template="${nameArr[$template]}"	
fi

if [ ! -d "Templates/$template" ]; then
	error=1
	ErrorFn
fi

cp -a "Templates/$template" "Projects/$name"

if [ -f "Projects/$name/TEMPLATE_CONFIG" ]; then
	printf "found template file.\n"
	while IFS="" read -r p || [ -n "$p" ]
	do
		val="${p#*=}"
		case "$p" in
		EnginePath=*)
			printf "%s\n" $val
			cp "GameEngine.js" "Projects/$name/$val"
		;;
		*)
		printf "Invalid argument: \"$p\"\n"
		exit 1
		esac
	done < "Projects/$name/TEMPLATE_CONFIG"

	rm -f "Projects/$name/TEMPLATE_CONFIG"
fi

