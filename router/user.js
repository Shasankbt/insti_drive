import express from 'express';
import { exec } from 'child_process'
import path from 'path'

const router = express.Router();

import {getDirContentsList, dataDir} from "../server.js"

router.post('/load-directory-contents', async (req, res) => {
    const directoryDetails = req.body['req-details'];
    const dir_contents_list = await getDirContentsList(directoryDetails)
    // console.log(dir_contents_list)
    res.json(dir_contents_list)
})

router.post("/download-current-dir", async (req, res)=>{
    
    const directoryDetails = req.body['req-details']
    exec(`bash ./shellScripts/zip_directory.sh ${dataDir} ${directoryDetails.user} DATA ${directoryDetails.path} BUFFER`, (error, stdout, stderr)=>{
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            res.status(500).send(`Error executing script: ${stderr}`);
            return;
        }
        const filePath = path.join(`${dataDir}${directoryDetails.user}/BUFFER`,stdout.trim());
        console.log("file", filePath)
        res.download(filePath)
    })
})

export default router;
