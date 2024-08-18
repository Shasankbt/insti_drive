import express from 'express';
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
const fs_promises = fs.promises;

const router = express.Router();

import { dataDir} from "../server.js"

const userDataDir = "DATA"
const userAttrDir = "ATTRS"

async function updateAttrsFile(){
    exec(`bash ./shellScripts/update_attrs.sh ${dataDir} testuser1 DATA ATTRS ha`, (error, stdout, stderr)=>{
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
            const filePath = path.join(dataDir, directory_user, userAttrDir, "server_sync.json");
            const serverSyncFile = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));

            const server_sync = serverSyncFile[path.join(directory_user,userDataDir, directory_path)]
            resolve(server_sync)
        } catch (error) {
            console.error("Error reading sync file:", error);
            res.status(500).send("Error reading sync file");
        }
    })
}

async function getDirContentsList(directoryDetails){
    const directory_path = path.join(dataDir,directoryDetails.user, "DATA", directoryDetails.path);
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
    exec(`bash ./shellScripts/zip_directory.sh ${dataDir} ${directoryDetails.user} ${userDataDir} ${directoryDetails.path} BUFFER`, (error, stdout, stderr)=>{
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

export default router;
