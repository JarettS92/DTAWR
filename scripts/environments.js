let DTEnvs = {};

//Initiates load storage on start
loadLocalStorage();

//Saves current env json and env table on Home tab to storage
function saveLocalStorage() {
    let j = {
        "table": String($('#manage-environments-tbody').html()),
        "jsonObj": JSON.stringify(DTEnvs)
    };
    localStorage.setItem('envData', JSON.stringify(j));
}

//Uses storage to populate env json and env table on Home tab
function loadLocalStorage() {
    try {
        let t = localStorage.getItem('envData');
        if (t != null) {
            t = JSON.parse(t);
            DTEnvs = JSON.parse(t["jsonObj"]);
            $('#manage-environments-tbody').html(t["table"]);
        }
    } catch (e) {
        console.log(e);
    }
}

//If user messes up table, button will clear table
function deleteLocalStorage() {
    localStorage.removeItem('envData');
}

//gets an environment for a program
function getEnvironment(name) {
    return DTEnvs[name];
}

//removes a row from manage-environments-tbody
function delEnvironment(name) {
    delete DTEnvs[name];
    console.log(DTEnvs);
    document.getElementById('Row' + name).remove();
    saveLocalStorage();
    // Added by Jarett
    updateEnvironmentSelects();
}

// --------------------------------------------------------------------------------------- //
// JARETT SMITH ADDITION
function addTagsToEnvObj(tagsArray) {
    let j = {
        "table": String(document.getElementById('manage-environments-tbody').innerHTML),
        "jsonObj": JSON.stringify(DTEnvs)
    };
    localStorage.setItem('envData', JSON.stringify(j));
}

async function addEnvironment() {
    let saasUrlRegex = /https:\/\/\w{3}\d{5}.live.dynatrace.com/g;
    let managedUrlRegex = /https:\/\/\w{3}\d{5}\.dynatrace-managed\.com\/e\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g;
    let tokenRegex = /\S{21}/g;
    let maskingRegex = /(?<=.{3})\S{13}/g;

    let envName = document.getElementById('environment-name-input').value;
    let envUrl = document.getElementById('environment-url-input').value;
    let saasEnvUrl = envUrl;
    // envUrl.match(saasUrlRegex) ? envUrl.match(saasUrlRegex)[0] : false;
    // envUrl;
    // 
    let managedEnvUrl = envUrl.match(managedUrlRegex) ? envUrl.match(managedUrlRegex)[0] : false;

    console.log(saasEnvUrl);
    console.log(managedEnvUrl);
    let tokenInput = document.getElementById('environment-token-input').value;
    let envToken = tokenInput.match(tokenRegex) ? tokenInput.match(tokenRegex)[0] : false;
    let tagsBool = false;
    let mzsBool = false;
    let tsmBool = false;
    let applicationsBool = false;
    
    // console.log(saasEnvUrl.match(regex));

    if (envName && (saasEnvUrl || managedEnvUrl) && envToken) {
        let envTags = new Promise((resolve, reject) => {
            axios.get(saasEnvUrl + '/api/config/v1/autoTags', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Token ${envToken}`
                }
            }).then((res) => {
                if (res.status == '200') {
                    resolve(res.data.values.map(x => x.name));
                    tagsBool = true;
                    // console.log(res.data.values.map(x => x.name));
                    // envTags = res.data.values.map(x => x.name);
                } else {
                    reject("Error");
                }
            }).catch((err) => {
                console.log(err);
                alert("Unable to pull Auto Tags");
                resolve([]);
            });
        });
        let envMZs = new Promise((resolve, reject) => {
            axios.get(saasEnvUrl + '/api/config/v1/managementZones', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Token ${envToken}`
                }
            }).then((res) => {
                if (res.status == '200') {
                    resolve(res.data.values.map(x => x.name));
                    mzsBool = true;
                    // console.log(res.data.values.map(x => x.name));
                    // envTags = res.data.values.map(x => x.name);
                } else {
                    reject("Error");
                }
            }).catch((err) => {
                console.log(err);
                alert("Unable to pull Management Zones");
                resolve([]);
            });
        });

        let envTsm = new Promise((resolve, reject) => {
            axios.get(saasEnvUrl + '/api/v1/timeseries', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Token ${envToken}`
                }
            }).then((res) => {
                if (res.status == '200') {
                    let obj = {};
                    res.data.forEach((curVal) => {
                        obj[curVal.timeseriesId] = curVal.aggregationTypes;
                    });
                    resolve(obj);
                    tsmBool = true;
                    // console.log(res.data.values.map(x => x.timeseriesId));
                    // envTags = res.data.values.map(x => x.timeseriesId);
                } else {
                    reject("Error");
                }
            }).catch((err) => {
                console.log(err);
                alert("Unable to pull Timeseries Metrics");
                resolve([]);
            });
        });

        let envApplications = new Promise((resolve, reject) => {
            axios.get(saasEnvUrl + '/api/v1/entity/applications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Token ${envToken}`
                }
            }).then((res) => {
                if (res.status == '200') {
                    resolve(res.data.map((x) => x.displayName));
                    applicationsBool = true;
                } else {
                    reject("Error");
                }
            }).catch((err) => {
                console.log(err);
                alert("Unable to pull Applications");
                resolve([]);
            });
        });

        DTEnvs[envName] = {
            'URL': saasEnvUrl,
            'TOK': envToken,
            'TAGS': await envTags,
            'MZS': await envMZs,
            'TSM': await envTsm,
            'APP': await envApplications,
            'LOGS': {}
        };
        console.log(envApplications);

        document.getElementById('manage-environments-tbody').innerHTML += "<tr id='Row" + envName + "'><td>" + envName + "</td><td>" + saasEnvUrl + "</td><td>" + envToken.replace(maskingRegex, '*****************') + "</td><td>" + tagsBool + "</td><td>" + applicationsBool + "</td><td>"+ mzsBool + "</td><td>" + tsmBool + "</td><td><button class='btn btn--primary theme--dark' onclick='delEnvironment(\"" + envName + "\")'>Remove</button></td></tr>";

        // updateEnvironmentTable();
        saveLocalStorage();
        updateEnvironmentSelects();
        clearInputFields();
    } else {
        if(!saasEnvUrl && !managedEnvUrl){ 
            alert("Invalid URL!") 
        } else if(!envToken) {
            alert("Inavlid API Token!")  
        } else {
            alert("Missing info!!");
        }
    }
}

function updateEnvironmentSelects() {
    let keys = Object.keys(DTEnvs);
    $('.envSelect').find('option').remove().end();
    keys.forEach(function (curVal, index) {
        if (index == keys.length - 1) {
            // $('#select1').append(`<option value="${index}" selected="selected">${curVal}</option>`).val(`${index}`);
            // $('#select2').append(`<option value="${index}" selected="selected">${curVal}</option>`).val(`${index}`);
            $('.envSelect').append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
            $('.envSelect').append(`<option class="none" value="SELECT ENVIRONMENT" selected hidden disabled>SELECT ENVIRONMENT</option>`).val(`SELECT ENVIRONMENT`);
        } else {
            // $('#select1').append(`<option value="${index}">${curVal}</option>`).val(`${index}`);
            // $('#select2').append(`<option value="${index}">${curVal}</option>`).val(`${index}`);
            $('.envSelect').append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        }
    });
}

function clearInputFields() {
    $('#environment-name-input, #environment-url-input, #environment-token-input').val('');
}
