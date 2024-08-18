# database_dir , user, user_attr_dir , attr_filename represent 
# master folder of data, user , master folder where user's data will
# be accessable for the client and the path relative to this 
#!/bin/bash 

database_dir=$1
user=$2
user_database_dir=$3
user_attr_dir=$4
attr_filename=$5

json_file="${database_dir}/${user}/${user_attr_dir}/server_sync.json"

json="{"

mapfile -t attrs < <(find "${database_dir}/${user}/${user_database_dir}" -type d -name "*" -exec stat -c "%Y %n" {} \;)

pwd
for attr in "${attrs[@]}"; do
    time=$(echo "$attr" | awk '{print $1}')
    dir=$(echo "$attr" | awk '{print $2}')
    normalized_path=$(realpath -m --relative-to="./${database_dir}" "$dir")
    # echo $dir
    # dir=${dir#${database_dir}/${user}/${user_database_dir}/}
    json="${json}\"${normalized_path}\": ${time},"
done

json="${json::-1}}"


echo $json 
echo "${json}" > $json_file


