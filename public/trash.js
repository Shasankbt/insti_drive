import {
    DIRECTORY_TYPES,
    getDirectoryDetails,
    renderDirectoryContents,
    backTrackURL
} from "./commonFunctions.js";

document.addEventListener("DOMContentLoaded", async ()=>{
    await renderDirectoryContents(getDirectoryDetails(DIRECTORY_TYPES.trash));
    const back_url = backTrackURL();
    if(back_url.pathname === new URL(window.location.href).pathname){
        // disable the button
        console.log("this is root dir")
    } else {
        document.querySelector(".back-button").addEventListener("click", ()=>{
            window.location.href = back_url
        })
    }
    
})





