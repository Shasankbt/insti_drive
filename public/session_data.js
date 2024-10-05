export function getSessionDirectoryContents(directory_path, directory_type){
    console.log("requested directory path: ", directory_path, "directory type: ", directory_type)
    let session_data = JSON.parse(sessionStorage.getItem(directory_type));
    if(session_data === null || session_data.response === "error"){
        console.warn("no local session storage for the type", directory_type);
        session_data = {};
        sessionStorage.setItem(directory_type, JSON.stringify({}))
    }
    const session_directory_contents = session_data[directory_path];
    if(session_directory_contents === undefined){
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

export function saveSessionDirectoryContents(directory_path, directory_type, data){
    let session_data = JSON.parse(sessionStorage.getItem(directory_type));
    if(session_data === null || session_data.response === "error"){
        console.error("no local session storage for the type", directory_type);
        sessionStorage.setItem(directory_type, {})
    }
    session_data[directory_path] = data;
    console.log("saving type : ", directory_type , "directory path: ", directory_path)
    console.log("data stored : ", data)
    sessionStorage.setItem(directory_type, JSON.stringify(session_data));
}