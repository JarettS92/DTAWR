let DTEnvs = {
    ...loadLocalStorage(),
    ...loadSessionStorage()
};
// console.log(DTEnvs);

//Initiates load storage on start
loadStorage();

$('.refresh').click(function() {
    refreshEnvironment($(this).prop('name'));
});

//Saves current env json and env table on Home tab to storage
function saveStorage(type, name, data) {
    switch(type){
        case "session":
            sessionStorage.setItem(`env-${name}`, JSON.stringify(data));
            break;
        case "local": 
            localStorage.setItem(`env-${name}`, JSON.stringify(data));
            break;
        default:
            sessionStorage.setItem(`env-${name}`, JSON.stringify(data));
    }
    DTEnvs = {
        ...loadLocalStorage(),
        ...loadSessionStorage()
    };
}

//Uses storage to populate table
function loadStorage() {
    let newObj = {
        ...loadLocalStorage(),
        ...loadSessionStorage()
    }

    for(const env in newObj){
        // Regex to mask the API token after submission
        let maskingRegex = /(?<=.{3})\S{13}/g;
        let obj = JSON.parse(newObj[env]);
        let name = env.slice(4);
        $('#manage-environments-table').append(`
            <tbody id="row-${name}" class="expandable">
            <tr>
                <td><a href="#" class='refresh' name='${name}'><img src="images/1200px-Refresh_icon.svg.png"></a></td>
                <td>${name}</td>
                <td>${obj.URL}</td>
                <td>${obj.TOK.replace(maskingRegex, '*****************')}</td>
                <td><button class='btn btn--primary' onclick='delEnvironment("${name}")'>Remove</button></td>
                <td><a href="#" name="${name}" class="expandable__trigger">Details</td>
            </tr>
            <tr class="expandable__content">
                <td colspan="6">
                    <dl class='definition-list'>
                        <dt>Tags?</dt>
                        <dd>${(obj.TAGS.length != 0) ? true : false}</dd>
                        <dt>Applications?</dt>
                        <dd>${(obj.APP.length != 0) ? true : false}</dd>
                        <dt>Management Zones?</dt>
                        <dd>${(obj.MZS.length != 0) ? true : false}</dd>
                        <dt>Time Series Metrics?</dt>
                        <dd>${(obj.TSM.length != 0) ? true : false}</dd>
                        <dt>Storage?</dt>
                        <dd>${obj.STOR}</dd>
                    </dl>
                </td>
            </tr>
            </tbody>`);
        // console.log(JSON.parse(newObj[env]));
        // console.log(name);
    }

    // console.log(newObj);
}

function loadLocalStorage() {
    let arr = Object.keys(window.localStorage).filter((curVal) => {
        let re = /^env-/;
        return re.test(curVal);
    });
    let obj = {};
    for(var x of arr){
        obj[x] = localStorage.getItem(x);
        // console.log(obj);
    }
    return obj;
}

function loadSessionStorage(){    
    let arr = Object.keys(window.sessionStorage).filter((curVal) => {
        let re = /^env-/;
        return re.test(curVal);
    });
    let obj = {};
    for(var x of arr){
        obj[x] = sessionStorage.getItem(x);
        // console.log(obj);
    }
    return obj;
}

//If user messes up table, button will clear table
// function deleteLocalStorage() {
//     localStorage.removeItem('envData');
// }

//gets an environment for a program
function getEnvironment(name) {
    if(DTEnvs.hasOwnProperty(`env-${name}`)){
        return JSON.parse(DTEnvs[`env-${name}`]);
    } else {
        // alert('No such environment!');
        return false;
    }
}

//removes a row from manage-environments-tbody
function delEnvironment(name) {
    let local = localStorage.getItem(`env-${name}`) ? true : false;
    let session = sessionStorage.getItem(`env-${name}`) ? true : false;
    if(local){ localStorage.removeItem(`env-${name}`) }
    else if(session){ sessionStorage.removeItem(`env-${name}`) }
    else { alert('NO SUCH ENVIRONMENT!') }
    $('#row-' + name).remove();
    updateEnvironmentSelects();
}

// adds an environment to local/session storage
// these environments will allow a user to execute the tools and reports
// makes calls to tags/management zones/timeseries metrics/applications APIs
async function addEnvironment() {
    // Checks to see if the URL matches the SaaS pattern
    let saasUrlRegex = /https:\/\/\w{3}\d{5}.live.dynatrace.com/g;
    // Checks the URL for the Managed pattern
    let managedUrlRegex = /https:\/\/\w{3}\d{5}\.dynatrace-managed\.com\/e\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g;
    // Checks the token input for token pattern
    let tokenRegex = /\S{21}/g;
    // Regex to mask the API token after submission
    let maskingRegex = /(?<=.{3})\S{13}/g;
    // Get the environment name
    let envName = $('#environment-name-input').val();
    // Get the environment URL
    let envUrl = $('#environment-url-input').val();
    let saasEnvUrl = envUrl;
    // envUrl.match(saasUrlRegex) ? envUrl.match(saasUrlRegex)[0] : false;
    // envUrl;
    let managedEnvUrl = envUrl.match(managedUrlRegex) ? envUrl.match(managedUrlRegex)[0] : false;
    // Get selected radio button value
    let storage = $('.radio:checked').prop('name') || false;

    // console.log(saasEnvUrl);
    // console.log(managedEnvUrl);
    // Get token value
    let tokenInput = $('#environment-token-input').val();
    // Check the token against token regex pattern
    let envToken = tokenInput.match(tokenRegex) ? tokenInput.match(tokenRegex)[0] : false;

    // Initialize booleans to track success/failure of API calls
    let tagsBool = false;
    let mzsBool = false;
    let tsmBool = false;
    let applicationsBool = false;
    
    // console.log(saasEnvUrl.match(regex));

    // Verify all inputs have values
    // if not, alert the user to fill in missing data
    if (envName && (saasEnvUrl || managedEnvUrl) && envToken && storage) {
        // Run API call to get environment Tags
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
        // Run API call to get environment Management Zones
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
        // Run API call to get environment Time Series Metrics
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
        // Run API call to get environment Applications
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

        // Build session/local storage object
        let obj = {
            'URL': saasEnvUrl,
            'TOK': envToken,
            'TAGS': await envTags,
            'MZS': await envMZs,
            'TSM': await envTsm,
            'APP': await envApplications,
            'STOR': storage,
            'LOGS': {}
        };
        // console.log(envApplications);

        // Display newly added environment on the page
        $('#manage-environments-table').append(`
            <tbody id="row-${envName}" class="expandable">
            <tr>
                <td><a href="#" class='refresh' name="${envName}"><img src="images/1200px-Refresh_icon.svg.png"></a></td>
                <td>${envName}</td>
                <td>${saasEnvUrl}</td>
                <td>${envToken.replace(maskingRegex, '*****************')}</td>
                <td><button class='btn btn--primary' onclick='delEnvironment("${envName}")'>Remove</button></td>
                <td><a href="#" name="${envName}" class="expandable__trigger">Details</td>
            </tr>
            <tr class="expandable__content">
                <td colspan="6">
                    <dl class='definition-list'>
                        <dt>Tags?</dt>
                        <dd>${tagsBool}</dd>
                        <dt>Applications?</dt>
                        <dd>${applicationsBool}</dd>
                        <dt>Management Zones?</dt>
                        <dd>${mzsBool}</dd>
                        <dt>Time Series Metrics?</dt>
                        <dd>${tsmBool}</dd>
                        <dt>Storage?</dt>
                        <dd>${storage}</dd>
                    </dl>
                </td>
            </tr>
            </tbody>`);

        // updateEnvironmentTable();
        // Save the object to specified storage location
        saveStorage(storage, envName, obj);
        // Update all Environment Dropdowns
        updateEnvironmentSelects();
        // Clear user inputs on successful submission
        clearInputFields();

    // Alert user on missing data
    } else {
        if(!saasEnvUrl && !managedEnvUrl){ 
            alert("Invalid URL!") 
        } else if(!envToken) {
            alert("Inavlid API Token!")  
        } else if(!storage){
            alert("Please select Session or Local storage!")
        } else {
            alert("Missing info!!");
        }
    }
}

// Ensure that the environment name being added is unique
// and not already in the list
$('#environment-name-input').on('input', (e) => {
    let name = $('#environment-name-input').val();
    if(Object.keys(DTEnvs).includes(`env-${name}`)){
        // console.log('Name is not unique');
        $('#environment-name-input').siblings().addClass('warning').text('Name: MUST BE UNIQUE!')
        $('#environment-add-button').prop('disabled', true).addClass('disabled__button');
        return false;
    } else {
        $('#environment-name-input').siblings().removeClass('warning').text('Name:');
        $('#environment-add-button').prop('disabled', false).removeClass('disabled__button');
        // console.log('Name is valid');
        return true;
    }
});

// Update environment dropdowns
function updateEnvironmentSelects() {
    // Get an array of Environment names
    let keys = Object.keys(loadLocalStorage()).concat(Object.keys(loadSessionStorage()));

    // Remove all items in the select
    $('.envSelect').find('option').remove().end();
    // For each environment, add the name to the dropdown
    keys.forEach(function (curVal, index) {
        curVal = curVal.slice(4);
        // If the item is last in the list, add one additional item for null value
        // Used as a visual aid only
        if (index == keys.length - 1) {
            $('.envSelect').append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
            $('.envSelect').append(`<option class="none" value="SELECT ENVIRONMENT" selected hidden disabled>SELECT ENVIRONMENT</option>`).val(`SELECT ENVIRONMENT`);
        } else {
            $('.envSelect').append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        }
    });
}

// Clear user inputs
function clearInputFields() {
    $('#environment-name-input, #environment-url-input, #environment-token-input').val('');
}

// Function to hide all tools/reports and display the 
// Environment management page
function navToManageEnvironments() {
    $("div[name='sidebar-content']").removeClass("display").addClass("none");
    $("#manage-environments").addClass("display").removeClass("none");
}

function closeManageEnvironments() {
    $("#manage-environments").removeClass("display").addClass("none");
    $(`#${$('.sidebar__item.is-current').attr('sidebar-content-id')}`).removeClass("none").addClass("display");
    // console.log($('.sidebar__item.is-current').attr('sidebar-content-id'));
}

async function refreshEnvironment(envName){
    console.log(envName);
    let env = getEnvironment(envName);
    // Regex to mask the API token after submission
    let maskingRegex = /(?<=.{3})\S{13}/g;

    // Initialize booleans to track success/failure of API calls
    let tagsBool = false;
    let mzsBool = false;
    let tsmBool = false;
    let applicationsBool = false;

    // Initialize REST calls
    let envTags = new Promise((resolve, reject) => {
        axios.get(env.URL + '/api/config/v1/autoTags', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Token ${env.TOK}`
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
    // Run API call to get environment Management Zones
    let envMZs = new Promise((resolve, reject) => {
        axios.get(env.URL + '/api/config/v1/managementZones', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Token ${env.TOK}`
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
    // Run API call to get environment Time Series Metrics
    let envTsm = new Promise((resolve, reject) => {
        axios.get(env.URL + '/api/v1/timeseries', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Token ${env.TOK}`
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
    // Run API call to get environment Applications
    let envApplications = new Promise((resolve, reject) => {
        axios.get(env.URL + '/api/v1/entity/applications', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Token ${env.TOK}`
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

    // Build session/local storage object
    let obj = {
        'URL': env.URL,
        'TOK': env.TOK,
        'TAGS': await envTags,
        'MZS': await envMZs,
        'TSM': await envTsm,
        'APP': await envApplications,
        'STOR': env.STOR,
        'LOGS': {}
    };

    $(`#row-${envName} .expandable__content`).children().remove();
    // Display newly added environment on the page
    $(`#row-${envName} .expandable__content`).append(`
        <td colspan="6">
            <dl class='definition-list'>
                <dt>Tags?</dt>
                <dd>${tagsBool}</dd>
                <dt>Applications?</dt>
                <dd>${applicationsBool}</dd>
                <dt>Management Zones?</dt>
                <dd>${mzsBool}</dd>
                <dt>Time Series Metrics?</dt>
                <dd>${tsmBool}</dd>
                <dt>Storage?</dt>
                <dd>${env.STOR}</dd>
            </dl>
        </td>`);

    // updateEnvironmentTable();
    // Save the object to specified storage location
    saveStorage(env.STOR, envName, obj);
    // Update all Environment Dropdowns
    updateEnvironmentSelects();
}