document.addEventListener("DOMContentLoaded", ()=>{
    const downloadButton = document.querySelector(".download-button")

    function getDirectoryPath(){
    
        const url = new URL(window.location.href);
        const pathSegments = url.pathname.split('/').filter(segment => segment);
    
        const userId = pathSegments[1];
        const pathId = pathSegments.slice(3).join("/") || "";
    
        console.log(userId + "/" + pathId, ":" , window.location.href)
        return {
            "user" : userId,
            "path" : pathId
        };
    }

    downloadButton.addEventListener("click",async ()=>{
        fetch("/user/download-current-dir", {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "req-details" : getDirectoryPath()
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();  // Convert the response to a Blob (binary large object)
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'your_filename.zip';  // Set the desired file name here
            document.body.appendChild(a);
            a.click();
            a.remove();  // Clean up after the click
            window.URL.revokeObjectURL(url);  // Release memory
        })
        .catch(error => console.error('Download failed:', error));
    })
})  