import express from 'express';
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import multer from 'multer';

const fs_promises = fs.promises;

const router = express.Router();

import { dataDir} from "../server.js"
import { time } from 'console';
import { updateFileHashmap } from './user_attr_functions.js';
const shellScriptsDir = "./shellScripts/"

export const SERVER_DIRECTORY_TYPES = {
    "path" :"DATA",
    "files" : "DATA",
    "trash" : "TRASH",
    "attrs" : "ATTRS",
    "buffer" : "BUFFER"
}

async function updateAttrsFile(){
    exec(`bash ${shellScriptsDir}update_attrs.sh ${dataDir} testuser1 DATA ATTRS ha`, (error, stdout, stderr)=>{
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            res.status(500).send(`Error executing script: ${stderr}`);
            return;
        }
        console.log("file", stdout)
    })
}

async function getDirLastUpdate(directoryDetails){
    await updateAttrsFile();
    return new Promise(async (resolve, reject)=> {
        console.log(directoryDetails)
        const directory_user = directoryDetails.user;
        const directory_path = directoryDetails.path;
        try{
            const filePath = path.join(dataDir, directory_user, SERVER_DIRECTORY_TYPES.attrs, "server_sync.json");
            const serverSyncFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));

            const server_sync = serverSyncFile[path.join(directory_user,SERVER_DIRECTORY_TYPES.files, directory_path)]
            resolve(server_sync)
        } catch (error) {
            console.error("Error reading sync file:", error);
            res.status(500).send("Error reading sync file");
        }
    })
}

async function generateHashID(filename_str) {
    const timestamp = Date.now().toString();
    const dataToHash = `${filename_str}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    const uniqueKey = `<${timestamp}>${hash}`;

    return uniqueKey;
}
async function getDirContentsList(directoryDetails){    
    const directory_path = path.join(dataDir,directoryDetails.user, SERVER_DIRECTORY_TYPES[directoryDetails.type], directoryDetails.path);
    console.log("reading dir :", directory_path);
    try{
        const filenames = await fs_promises.readdir(directory_path);
        const metadata_promises = filenames.map(async (filename) => {
            const fullPath = path.join(directory_path, filename);
            const stats = await fs.promises.stat(fullPath);
            return {
                filename: filename,
                directory: stats.isDirectory() ? "yes" : "no"
            };
        })
        const files_fulldata = await Promise.all(metadata_promises)
        console.log(files_fulldata)
        return {
            "response" : "ok",
            "server-sync" : Date.now(),
            "res-data" : files_fulldata,
        }    
    } catch(error) {
        return {
            "response" : "error",
            "server-sync": Date.now(),
            "error-message": error.message
        };
    }
}

router.post("/get-server-sync", async(req, res)=>{
    res.json({
        "server-sync" : await getDirLastUpdate(req.body["req-details"])
    })

})

router.post('/load-directory-contents', async (req, res) => {
    const directoryDetails = req.body['req-details'];
    const dir_contents_list = await getDirContentsList(directoryDetails)
    // console.log(dir_contents_list)
    res.json(dir_contents_list)
})

router.post("/download-current-dir", async (req, res)=>{
    
    const directoryDetails = req.body['req-details']
    exec(`bash ./shellScripts/zip_directory.sh ${dataDir} ${directoryDetails.user} ${SERVER_DIRECTORY_TYPES.files} ${directoryDetails.path} BUFFER`, (error, stdout, stderr)=>{
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            res.status(500).send(`Error executing script: ${stderr}`);
            return;
        }
        const filePath = path.join(`${dataDir}${directoryDetails.user}/BUFFER`,stdout.trim());
        console.log("file", filePath)
        res.setHeader("filename", stdout.trim())
        res.download(filePath)
    })
})

router.post("/delete-files", async( req, res)=>{
    // user delete command, deletes the files by running a shell script
    // the files are mapped to timestamps to avoid collisions and passed to sh 
    // concatenated with ";" where IFS=';'. 
    const directoryDetails = req.body['req-details'];
    const selectedItems = req.body['selected-items'];

    function generateKey(filename){
        const timestamp = Date.now();
        return "<" + timestamp + ">" + filename
    }

    console.log(directoryDetails)
    console.log(selectedItems)
    console.log("deleting", selectedItems.map(filename=>generateKey(filename)).join(';'))

    async function updateTrashStack(selectedItems, directoryDetails, timestamp){
        try {
            const trashStackFilePath = path.join(dataDir,directoryDetails.user, SERVER_DIRECTORY_TYPES.attrs, "trash_files_stack.json");            
            const fileContent = await fs_promises.readFile(trashStackFilePath, 'utf8');            
            const trashStack = JSON.parse(fileContent);
            
            selectedItems.forEach(item => {
                trashStack[`<${timestamp}>${item}`] = {
                    "filename": item,
                    "path": directoryDetails.path,
                    "deleted-time": timestamp
                };
            });
            console.log(trashStack)
            await fs_promises.writeFile(trashStackFilePath, JSON.stringify(trashStack, null, 4), 'utf8');
            //                                                                         ^^^^^^^ provides indentation
        } catch (error) {
            console.error("Error updating trash stack:", error);
        }
    }
    const TIMESTAMP = Date.now()
    const command = `bash ./shellScripts/delete_files.sh ${dataDir} ${directoryDetails.user} ${SERVER_DIRECTORY_TYPES.files} "${directoryDetails.path}" ${SERVER_DIRECTORY_TYPES.trash} '${selectedItems.join(';')}' '${TIMESTAMP}'`;
    updateTrashStack(selectedItems, directoryDetails, TIMESTAMP);
    exec(command, (error, stdout, stderr)=>{
        if (error) {
            console.error(`Error executing sript: ${stderr}`);
            res.status(500).send(`Error executing script: ${stderr}`);
            return;
        }
        console.log(stdout);
        res.json({
            "response": "ok"
        })
        
    })
})

// const upload = multer({dest: "upload_buffer"});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDirectory = path.join(dataDir, req.headers.user, SERVER_DIRECTORY_TYPES.buffer, "uploads");

        // Create the directory if it doesn't exist
        if (!fs.existsSync(userDirectory)) {
            fs.mkdirSync(userDirectory, { recursive: true });
        }
        cb(null, userDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});


const upload = multer({ storage: storage });

router.post("/upload-files", upload.array("files[]"), (req, res)=>{
    const user = req.headers.user;
    const path = req.headers.path;
    // console.log(req.headers)
    // console.log("uploading files:", req.files);
    req.files.forEach(file => {
        const filename = file.originalname; // Get the original filename
        // Call updateFileHashmap with user, filename, and path
        updateFileHashmap(user, filename, path);
    });
    console.log("updated hashes");
    const selected_items = req.files.map(item => item.originalname)
    const command = `bash ./shellScripts/manage_uploads_buffer.sh ${dataDir} ${user} ${SERVER_DIRECTORY_TYPES.files} "${path}" ${SERVER_DIRECTORY_TYPES.buffer}/uploads '${selected_items.join(';')}'`;
    exec(command, (error, stdout, stderr)=>{
        if (error) {
            console.error(`Error executing sript: ${stderr}`);
            res.status(500).send(`Error executing script: ${stderr}`);
            return;
        }
        console.log(stdout);
        res.json({
            "response": "ok"
        })
    })
    
})


export default router;
