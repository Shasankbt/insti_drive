# database_dir , user, user_database_dir , path represent 
# master folder of data, user , master folder where user's data will
# be accessable for the client and the path relative to this 

database_dir=$1
user=$2
user_database_dir=$3
path=$4
user_buffer_dir=$5

input_directory="${database_dir}/${user}/${user_database_dir}/${path}"
output_directory="${database_dir}/${user}/${user_buffer_dir}"
dir_name=$(basename "${input_directory}")

zip -r "${output_directory}/${dir_name}.zip" "${input_directory}"  > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "${dir_name}.zip"
else 
    echo "Error: Failed to compress $directory_to_compress" >&2
    exit 1
fi