#!/bin/bash

# moves the uploaded files in buffer to the location
# files to be moved are semi-colon ';' seperated

database_dir=$1
user=$2
user_database_dir=$3
path=$4
user_buffer_dir=$5
files=$6

source_dir="${database_dir}/${user}/${user_buffer_dir}/"
dest_dir="${database_dir}/${user}/${user_database_dir}/${path}/"
IFS=';' read -r -a file_array <<< "$files"

for file in ${file_array[@]}; do 
    file_path="${source_dir}/${file}"
    if [ -e $file_path ] ; then 
        echo "moving ${file_path} to ${dest_dir}"
        cp "$file_path" "$dest_dir"
    else
        echo "unable to find ${file_path}"
    fi
done


