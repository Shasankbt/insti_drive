export function getSessionDirectoryContents(directory_path){
    const session_directory_contents = JSON.parse(sessionStorage.getItem(directory_path));
    if(session_directory_contents === null || session_directory_contents.response === "error"){
        console.log("no local session storage for", directory_path)
        const empty_template = {
            "res-data" : [],
            "response" : 'ok',
            "server-sync" : 0
        }
        sessionStorage.setItem(directory_path, empty_template)
        return empty_template;
    }
    console.log(session_directory_contents)
    return session_directory_contents;
}   

export function saveSessionDirectoryContents(directory_path, data){
    return sessionStorage.setItem(directory_path, JSON.stringify(data));
}