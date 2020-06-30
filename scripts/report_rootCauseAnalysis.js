let vault = [];
let problemIDs = [];
let problems = [];
let problemSummary = [];
let topRootCause = ['na'];
let topRootCauseCnt = [0];
let tagList = ['na'];
let newArry = [0];
let rPM = 0;
let rpm = 0;
let tagJSON = {};
let lastMin;
let progress = 0;
let z = 0;


//RootCauseAnalysis Main function
function mainRootCauseAnalysis() {
    if($('#root-cause-analysis-environment-select').val() != null) {
        let DTenv = getEnvironment($("#root-cause-analysis-environment-select").val());
        let startDate = new Date(start).getTime();
        let endDate = new Date(end).getTime();
        
        rPM = $("#root-cause-analysis-max").val();
        addToLogsRCA('Establishing connection to Dynatrace...', 'black', true);
        getHosts(DTenv['URL'], DTenv['TOK'], startDate, endDate);
    } else alert('SELECT ENVIRONMENT!');
}

function getHosts(dynatraceURL, token, startTime, endTime){
    //get Host names and tags
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": `${dynatraceURL}/api/v1/entity/infrastructure/hosts?includeDetails=false&startTimestamp=${(endTime - 3600000)}&endTimestamp=${endTime}`,
        "method": "GET",
            "headers": {
            "Authorization": "Api-Token " + token,
            "Content-Type": "application/json",
            "cache-control": "no-cache"
        },
        "processData": false,
        "data": ""
    }

    $.ajax(settings).done(function (response) {
        addToLogsRCA('SUCCESS!', '#4CAF50', false);
        addToLogsRCA('Determining time required for analysis...', 'black', true);
        var hostList = {};
        var serviceList = {};
        var processList = {};

        var data = response;
        var names = Object.keys(data);

        for(let i = 0; i < names.length; i++){
            var id = data[names[i]]['entityId'];
            var name = data[names[i]]['displayName'];
            var tags = data[names[i]]['tags'];
            hostList[id] = {'name': name, 'tags': tags};
        }
        //Get Service Names and Tags
        settings['url'] = dynatraceURL + "/api/v1/entity/services?includeDetails=false&startTimestamp=" + (endTime - 3600000) + "&endTimestamp=" + endTime;
        $.ajax(settings).done(function (response) {
            var data = response;
            var names = Object.keys(data);

            for(let i = 0; i < names.length; i++){
                var id = data[names[i]]['entityId'];
                var name = data[names[i]]['displayName'];
                var tags = data[names[i]]['tags'];
                serviceList[id] = {'name': name, 'tags': tags};
            }
            //Get Process Names and Tags
            settings['url'] = dynatraceURL + "/api/v1/entity/infrastructure/processes?includeDetails=false&startTimestamp=" + (endTime - 3600000) + "&endTimestamp=" + endTime;
            $.ajax(settings).done(function (response) {
                var data = response;
                var names = Object.keys(data);

                for(let i = 0; i < names.length; i++){
                    var id = data[names[i]]['entityId'];
                    var name = data[names[i]]['displayName'];
                    var tags = data[names[i]]['tags'];
                    processList[id] = {'name': name, 'tags': tags};
                }
                vault = {
                    'hosts': hostList,
                    'services': serviceList,
                    'processes': processList
                };
                analysis(dynatraceURL, token, startTime, endTime);
            });
        });
    });
}

function analysis(dynatraceURL, token, startTime, endTime){
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": dynatraceURL + "/api/v1/problem/feed?status=CLOSED&startTimestamp=" + startTime + "&endTimestamp=" + endTime,
        "method": "GET",
        "headers": {
            "Authorization": "Api-Token " + token,
            "Content-Type": "application/json",
            "cache-control": "no-cache"
        },
        "processData": false,
        "data": ""
    }

    $.ajax(settings).done(function (response) {
        let shortcut = response['result']['problems'];
        for(let i = 0; i < shortcut.length; i++) problemIDs.push(shortcut[i]['id']);
        addToLogsRCA('CALCULATED!', '#4CAF50', false);
        addToLogsRCA('Total Problems: ', 'black', true);
        addToLogsRCA(problemIDs.length, '#1396FE', false);
        addToLogsRCA('Estimated time to completion: ', 'black', true);
        addToLogsRCA((problemIDs.length/rPM) + " minutes", '#1396FE', false);
        addToLogsRCA('Gathering Problem data from Dynatrace...', 'black', true);
        var d = new Date();
        lastMin = d;
        for(let i = 0; i < problemIDs.length; i++){
            let n = i;
            setTimeout(function(){repeater(dynatraceURL, settings, n)}, ((1000*60)/rPM) * i);
        }
    });
}

//Grabs specific problems, also controls rate of requests to ensure that Dynatrace is not overrun with too many requests
function repeater(dynatraceURL, settings, x){
    settings['url'] = dynatraceURL + "/api/v1/problem/details/" + problemIDs[x];
    var d = new Date();
    var n = Number(Math.abs(d - lastMin));
    if (n >= 60000){
        //console.log("A minute has passed: " + d);
        //console.log("Requests this minute: " + rpm);
        lastMin = d;
        rpm = 0;
    }
    else {
        rpm++;
        progress++;
    }
    $.ajax(settings).done(function (response) {
        var tempShort = response['result'];
        var tempObj = {
            'rankedEvents': tempShort['rankedEvents'],
            'hasRootCause': tempShort['hasRootCause']
        }
        //pushing data as it is recieved ensures that we don't overwrite any entries since it always goes at the end
        problems.push(tempObj);
        var temp = problems.indexOf(tempObj);
        move( 100 * progress/problemIDs.length );

        //once the request loop is complete, process data
        if(temp == problemIDs.length -1) remainder();
        else {};
    });
}

function remainder(){
    move( 100 );
    addToLogsRCA('COMPLETE!', '#4CAF50', false);
    addToLogsRCA('Extracting root causes...', 'black', true);
    for(var i = 0; i < problems.length; i++){
        if(problems[i]['hasRootCause']){
            for(var j = 0; j < problems[i]['rankedEvents'].length; j++){
                if(problems[i]['rankedEvents'][j]['isRootCause']){
                    var tempRC = problems[i]['rankedEvents'][j]['entityId'];
                    var tempIndex = topRootCause.indexOf(tempRC);
                    if(tempIndex == -1) {
                        topRootCause.push(tempRC);
                        topRootCauseCnt.push(1);
                    }
                    else{
                        topRootCauseCnt[tempIndex]++;
                    }
                }
            }
        }
    }

    var hostArr = Object.keys(vault['hosts']);
    var servArr = Object.keys(vault['services']);
    var procArr = Object.keys(vault['processes']);
    for(var xyz = 0; xyz < topRootCause.length; xyz++){
        if(hostArr.indexOf(topRootCause[xyz]) != -1){
            for(var abc = 0; abc < vault['hosts'][topRootCause[xyz]]['tags'].length; abc++){
                let keyPair = '';
                if(vault['hosts'][topRootCause[xyz]]['tags'][abc].hasOwnProperty('value')) keyPair = vault['hosts'][topRootCause[xyz]]['tags'][abc]['key'] + ": " + vault['hosts'][topRootCause[xyz]]['tags'][abc]['value'];
                else keyPair = vault['hosts'][topRootCause[xyz]]['tags'][abc]['key'];
                if(tagList.indexOf(keyPair) == -1){
                    tagList[tagList.length] = keyPair;
                    tagJSON[keyPair] = Number(topRootCauseCnt[xyz]);
                }
                else{
                    tagJSON[keyPair] += Number(topRootCauseCnt[xyz]);
                }
            }
        }
        else if(servArr.indexOf(topRootCause[xyz]) != -1){
            for(var abc = 0; abc < vault['services'][topRootCause[xyz]]['tags'].length; abc++){
                let keyPair = '';
                if(vault['services'][topRootCause[xyz]]['tags'][abc].hasOwnProperty('value')) keyPair = vault['services'][topRootCause[xyz]]['tags'][abc]['key'] + ": " + vault['services'][topRootCause[xyz]]['tags'][abc]['value'];
                else keyPair = vault['services'][topRootCause[xyz]]['tags'][abc]['key'];
                if(tagList.indexOf(keyPair) == -1){
                    tagList[tagList.length] = keyPair;
                    tagJSON[keyPair] = Number(topRootCauseCnt[xyz]);
                }
                else{
                    tagJSON[keyPair] += Number(topRootCauseCnt[xyz]);
                }
            }
        }
        else if(procArr.indexOf(topRootCause[xyz]) != -1){
            for(var abc = 0; abc < vault['processes'][topRootCause[xyz]]['tags'].length; abc++){
                let keyPair = '';
                if(vault['processes'][topRootCause[xyz]]['tags'][abc].hasOwnProperty('value')) keyPair = vault['processes'][topRootCause[xyz]]['tags'][abc]['key'] + ": " + vault['processes'][topRootCause[xyz]]['tags'][abc]['value'];
                else keyPair = vault['processes'][topRootCause[xyz]]['tags'][abc]['key'];
                if(tagList.indexOf(keyPair) == -1){
                    tagList[tagList.length] = keyPair;
                    tagJSON[keyPair] = Number(topRootCauseCnt[xyz]);
                }
                else{
                    tagJSON[keyPair] += Number(topRootCauseCnt[xyz]);
                }
            }
        }
        else{
            //console.log(xyz);
            //console.log('Unknown Entity: ' + topRootCause[i]);
        }
    }
    addToLogsRCA('EXTRACTED!', '#4CAF50', false);
    addToLogsRCA('Performing analysis...', 'black', true);

    var finalArr1 = [];
    var finalArr2 = [];
    var tagJSONRef = Object.keys(tagJSON);
    for(var aa = 0; aa < tagJSONRef.length; aa++){
        finalArr1[finalArr1.length] = tagJSONRef[aa];
        finalArr2[finalArr2.length] = tagJSON[tagJSONRef[aa]];
    }

    var top5RootCause = [];
    for(var i = 0; i < tagJSONRef.length; i++){
        //Most common Root Cause
        var topRC = Math.max.apply(Math, finalArr2);
        //Index of MCRC
        var whr = finalArr2.indexOf(topRC);
        //Most common Problem Child
        var pChild = finalArr1[whr];
        //Add top to top 5 list
        top5RootCause.push({'count': topRC, 'entity': pChild});
        //Remove top
        finalArr1.splice(whr, 1);
        finalArr2.splice(whr, 1);
        //console.log(finalArr1);
    }
    //console.log(top5RootCause);
    drawTable(top5RootCause, 'root-cause-analysis-tbody1', 0);

    var top5RootCause2 = [];
    for(var i = 0; i < topRootCause.length; i++){
        //Most common Root Cause
        var topRC = Math.max.apply(Math, topRootCauseCnt);
        //Index of MCRC
        var whr = topRootCauseCnt.indexOf(topRC);
        //Most common Problem Child
        var pChild = topRootCause[whr];
        //Add top to top 5 list
        if(servArr.indexOf(pChild) != -1){
            top5RootCause2.push({'count': topRC, 'entity': vault['services'][pChild]['name'], 'type': 'Service', 'tags': ''});
            //addToLogsRCA('Root Cause is Service!', 'green', true);
        }
        else if (hostArr.indexOf(pChild) != -1){
            top5RootCause2.push({'count': topRC, 'entity': vault['hosts'][pChild]['name'], 'type': 'Host', 'tags': ''});
            //addToLogsRCA('Root Cause is Host!', 'purple', true);
        }
        else if (procArr.indexOf(pChild) != -1){
            top5RootCause2.push({'count': topRC, 'entity': vault['processes'][pChild]['name'], 'type': 'Process', 'tags': ''/*vault['hosts'][pChild]['tags']*/});
            //addToLogsRCA('Root Cause is Process!', 'blue', true);
        }
        else
            top5RootCause2.push({'count': topRC, 'entity': pChild, 'type': 'UNKNOWN', 'tags': 'UNKNOWN'});
        //Remove top
        topRootCause.splice(whr, 1);
        topRootCauseCnt.splice(whr, 1);
        //console.log(finalArr1);
    }
    //console.log(top5RootCause2);

    var aggRC = [{'count': top5RootCause2[0]['count'], 'entity': top5RootCause2[0]['entity'], 'type': top5RootCause2[0]['type'], 'tags': ''}];
    for(var i = 0; i < top5RootCause2.length; i++){
        for(var j = 0; j <= aggRC.length; j++){
            if(j == aggRC.length){
                aggRC.push({'count': top5RootCause2[i]['count'], 'entity': top5RootCause2[i]['entity'], 'type': top5RootCause2[i]['type'], 'tags': ''});
            }
            if(aggRC[j]['entity'] == top5RootCause2[i]['entity']) {
                aggRC[j]['count'] += top5RootCause2[i]['count'];
                j = aggRC.length + 1;
            }
        }
    }
    addToLogsRCA('DONE!', '#4CAF50', false);
    addToLogsRCA('Building Table...', 'black', true);
    drawTable(aggRC, 'root-cause-analysis-tbody2', 1);
    addToLogsRCA('CONSTRUCTED!', '#4CAF50', false);
    addToLogsRCA('Process complete....', 'black', true);
    addToLogsRCA('GOOD BYE!', '#4CAF50', false);
}

function drawTable(someArr, str, num) { 
    let tempTR = "";
    let csvEnt = "Entity,Type,Count\n";
    let csvTag = "Tag,Count\n";

    for (var i = 0; i < someArr.length; i++){
        if(num) {
            tempTR += "<tr><td>" + someArr[i]["entity"] + "</td><td>" + someArr[i]["type"] + "</td><td>" + someArr[i]["count"] + "</td></tr>";
            csvEnt += someArr[i]["entity"] + "," + someArr[i]["type"] + "," + someArr[i]["count"] + "\n";
        }
        else {
            tempTR += "<tr><td>" + someArr[i]["entity"] + "</td><td>" + someArr[i]["count"] + "</td></tr>";
            csvTag += someArr[i]["entity"] + "," + someArr[i]["count"] + "\n";
        }
    }

    document.getElementById(str).innerHTML = tempTR;
    if($('root-cause-analysis-checkbox').is(':checked')){
        if(num){
            let csvContentEnt = "data:text/csv;charset=utf-8," + csvEnt;
            let encodedUri = encodeURI(csvContentEnt);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "RootCauseEntities.csv");
            document.body.appendChild(link); // Required for FF
            link.click();
        }
        else{
            let csvContentTag = "data:text/csv;charset=utf-8," + csvTag;
            let encodedUri = encodeURI(csvContentTag);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "RootCauseTags.csv");
            document.body.appendChild(link); // Required for FF
            link.click();
            fin();
        }
    }
}

function fin(){
    vault = [];
    problemIDs = [];
    problems = [];
    problemSummary = [];
    topRootCause = ['na'];
    topRootCauseCnt = [0];
    tagList = ['na'];
    newArry = [0];
    rPM = 0;
    rpm = 0;
    tagJSON = {};
    lastMin = 0;
    progress = 0;
}

//message = whatever message the log should display
//color = whatever color the text should be
function addToLogsRCA(message, color, newLine){
    if(newLine) $('#root-cause-analysis-logs').append("<br>");
    if(message != 'null')$('#root-cause-analysis-logs').append("<span style='color: " + color + ";'>" + message + "</span>");
}

function move(amount) {
    if(amount > 100) amount = 100;
    document.getElementById("root-cause-analysis-bar").style.width = amount + '%';
}