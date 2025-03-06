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
        printf "+--------------------------------------------+\n"
        printf "| ProjectInit arguments:                     |\n"
        printf "+--------------------------------------------+\n"
        printf "| short | long        | Description          |\n"
        printf "+--------------------------------------------+\n"
        printf "| -n=   | --name=     | pre-set name         |\n"
        printf "| -t=   | --template= | pre-set template     |\n"
        printf "| -t    | --help      | display this message |\n"
        printf "+--------------------------------------------+\n"
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

printf "\nCopying template files...\n"
cp -a "Templates/$template" "Projects/$name"

templateName=".template.config"
shouldDelete=0
if [ -f "Projects/$name/$templateName" ]; then
	printf "\nFound template file.\n"
	while IFS="" read -r p || [ -n "$p" ]
	do
		val="${p#*=}"
		case "$p" in
		EnginePath=*)
			printf "Copying game engine to: Projects/%s/%s\n" $name $val
			cp "GameEngine.js" "Projects/$name/$val"
		;;
		DeleteOnInit=*)
			shouldDelete=$val
		;;
		*)
		printf "Invalid argument: \"$p\"\n"
		exit 1
		esac
	done < "Projects/$name/$templateName"

	if [ "$shouldDelete" -eq 1 ]; then
		printf "Deleting template config from project folder\n"
		rm -f "Projects/$name/$templateName"
	fi
fi

printf "\nProject %s created successfully.\n" $name