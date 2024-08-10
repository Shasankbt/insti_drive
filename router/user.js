import express from 'express';

const router = express.Router();

import {getDirContentsList} from "../server.js"

router.post('/load-directory-contents', async (req, res) => {
    const directory_path = req.body.path;
    const dir_contents_list = await getDirContentsList(directory_path)
    // console.log(dir_contents_list)
    res.json(dir_contents_list)
})

export default router;
