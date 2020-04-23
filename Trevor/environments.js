let DTEnvs = {};

//Initiates load storage on start
loadLocalStorage();

//Saves current env json and env table on Home tab to storage
function saveLocalStorage(){
    let j = {"table": String(document.getElementById('envTable').innerHTML), "jsonObj": JSON.stringify(DTEnvs)};
    localStorage.setItem('envData', JSON.stringify(j));
}

//Uses storage to populate env json and env table on Home tab
function loadLocalStorage(){
    try{
        let t = localStorage.getItem('envData');
        if(t != null){
            t = JSON.parse(t);
            DTEnvs = JSON.parse(t["jsonObj"]);
            document.getElementById('envTable').innerHTML = t["table"];
            document.getElementById('envTableParent').style.display = "block";
        }
    }
    catch(e){
        console.log(e);
    }
}

//If user messes up table, button will clear table
function deleteLocalStorage(){
    localStorage.removeItem('envData');
}

//gets an environment for a program
function getEnvironment(name){
    return DTEnvs[name];
}

//adds a row from envTable
function addEnvironment(){
    DTEnvs[document.getElementById('EnvName').value] = {'URL': document.getElementById('EnvURL').value, 'TOK': document.getElementById('EnvTok').value};
    console.log(DTEnvs);
    document.getElementById('envTable').innerHTML += "<tr id='Row" + document.getElementById('EnvName').value + "'><td>" + document.getElementById('EnvName').value + "</td><td>" + document.getElementById('EnvURL').value + "</td><td>" + document.getElementById('EnvTok').value + "</td><td><button class='btn btn--primary theme--dark' onclick='delEnvironment(\"" + document.getElementById('EnvName').value + "\")'>Remove</button></td></tr>";
    document.getElementById('envTableParent').style.display = "block";
    saveLocalStorage();
}

//removes a row from envTable
function delEnvironment(name){
    delete DTEnvs[name];
    console.log(DTEnvs);
    document.getElementById('Row' + name).remove();
    if(Object.keys(DTEnvs).length === 0) document.getElementById('envTableParent').style.display = "none";
    saveLocalStorage();
}