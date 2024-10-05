#!/bin/bash

set -x

if [ "$#" -ne 7 ]; then
    echo "Usage: $0 database_dir user user_database_dir path trash_dir files"
    exit 1
fi

database_dir=$1
user=$2
user_database_dir=$3
path=$4
trash_dir=$5
files=$6
timestamp=$7


echo $files

source_dir="${database_dir}/${user}/${user_database_dir}/${path}"
dest_dir="${database_dir}/${user}/${trash_dir}"

# files=$(echo "$files" | sed 's/^"//;s/"$//')

IFS=';' read -r -a file_array <<< "$files"
echo $file_array

for file in "${file_array[@]}"; do
    file_path="${source_dir}/${file}"
    dest_filename="<${timestamp}>${file}"
    echo $file_path
    if [ -e "$file_path" ]; then
        cp -r -v "$file_path" "$dest_dir/$dest_filename"
        echo "Moved $file_path to $trash_dir/"
    else
        echo "File does not exist: $file_path"
    fi
done