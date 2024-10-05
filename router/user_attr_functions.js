import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

import { SERVER_DIRECTORY_TYPES } from "./user.js"
import { dataDir} from "../server.js"

function generateHashID(input){
    return crypto.createHash('sha256')  // Use 'sha256' algorithm
                 .update(`${input}-${Date.now()}`)          // Update with input data
                 .digest('hex');         // Convert to hex format
}

export function updateFileHashmap(user, filename, filedir){
    const hashMapFileLocation = path.join(dataDir, user, SERVER_DIRECTORY_TYPES.attrs, "file_hashmap.json")

    fs.readFile(hashMapFileLocation, 'utf-8', (err, data)=>{
        if(err){
            console.err("unable to read file_hashmap");
            return;
        }
        let hashMap;
        try {
            hashMap = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            return;
        }

        const full_path = path.join(user, filedir, filename);
        let new_hash_id = generateHashID(full_path);
        while(Object.keys(hashMap).includes(new_hash_id)){
            new_hash_id = generateHashID(full_path);
        }
        hashMap[new_hash_id] = full_path;
        console.log("written data : ", hashMap)
        fs.writeFileSync(hashMapFileLocation, JSON.stringify(hashMap));
    })  
}

