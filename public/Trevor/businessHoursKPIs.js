let IllegalWeekDays = []; 
let IllegalNumbDays = [];
let businessHoursStart = 0;
let businessHoursEnd = 0;
let z = 0;

//mainfunction for Business Hour KPIs
function mainBusinessHourKPIs(){
    let DTenv = getEnvironment(document.getElementById("BusinessHourKPIsEnv").value);
    businessHoursStart = document.getElementById('BusinessHourKPIsBHStart').value;
    businessHoursEnd = document.getElementById('BusinessHourKPIsBHEnd').value;
    if(!document.getElementById('BusinessHourKPIsSunday').checked) IllegalWeekDays.push(0);
    if(!document.getElementById('BusinessHourKPIsMonday').checked) IllegalWeekDays.push(1);
    if(!document.getElementById('BusinessHourKPIsTuesday').checked) IllegalWeekDays.push(2);
    if(!document.getElementById('BusinessHourKPIsWednesday').checked) IllegalWeekDays.push(3);
    if(!document.getElementById('BusinessHourKPIsThursday').checked) IllegalWeekDays.push(4);
    if(!document.getElementById('BusinessHourKPIsFriday').checked) IllegalWeekDays.push(5);
    if(!document.getElementById('BusinessHourKPIsSaturday').checked) IllegalWeekDays.push(6);
    let d = new Date();
    let m = d.getTimezoneOffset();
    z = m * 60000 * (-1);
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": DTenv['URL'] + "/api/v1/timeseries/" + document.getElementById('BusinessHourKPIsMet').value + "?startTimestamp=" + convertTime(document.getElementById('BusinessHourKPIsStart').value) + "&endTimestamp=" + convertTime(document.getElementById('BusinessHourKPIsEnd').value) + "&includeData=true",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Api-Token " + DTenv['TOK']
        },
        "processData": false,
        "data": ""
    }

    if(document.getElementById('BusinessHourKPIsAgg').value != '') settings['url'] += "&aggregationType=" + document.getElementById('BusinessHourKPIsAgg').value;
    if(document.getElementById('BusinessHourKPIsTag').value != '') settings['url'] += "&tag=" + document.getElementById('BusinessHourKPIsTag').value;
    if(document.getElementById('BusinessHourKPIsPerc').value != '') settings['url'] += "&percentile=" + document.getElementById('BusinessHourKPIsPerc').value;
    $.ajax(settings).done(function (response) {
        let storage = response['dataResult']['dataPoints'];
        let storage2 = response;
        filterOut(storage, storage2);
    });
}

//function filters out undesireable datapoints and generates a single aggregated metric from the remainder
function filterOut(storage, storage2){
    let x = Object.keys(storage);
    let count = 0;
    let count2 = 0;
    let sum = 0;
    let sum2 = 0;
    for(let i = 0; i < x.length; i ++){
        let shortcut = storage[x[i]];
        for(let j = 0; j < shortcut.length; j ++){
            if(!deleteDataPointWeekDay(shortcut[j][0]) && !deleteDataPointWeekDay(shortcut[j][0]) && !deleteDataPointNumbDay(shortcut[j][0]) && !deleteDataPointEarly(shortcut[j][0]) && !deleteDataPointLate(shortcut[j][0])) {
                count ++;
                sum += shortcut[j][1];
                count2 ++;
                sum2 += shortcut[j][1];
            }
            else{
                count2 ++;
                sum2 += shortcut[j][1];
            }
        }
    }
    //The good stuff
    document.getElementById('BusinessHourKPIsTableParent').style.display = 'block';
    document.getElementById('BusinessHourKPIsTable').innerHTML += "<tr><td>" + document.getElementById('BusinessHourKPIsTag').value + "</td><td>" + (sum / count).toFixed(2) + " " + storage2['unit'] + "</td><td>" + document.getElementById('BusinessHourKPIsMet').value + "</td></tr>";
}

//deletes datapoints from days of the week that are not business days
function deleteDataPointWeekDay(num){
    let temp = new Date(num + z);
    if(IllegalWeekDays.includes(temp.getUTCDay())) {
        //console.log('day violation: ' + temp.getUTCDay());
        return true;
    }
    else return false;
}

//deletes datapoints from days of the month that are not business days
//Not yet implemented
function deleteDataPointNumbDay(num){
    let temp = new Date(num + z);
    if(IllegalNumbDays.includes(temp.getUTCDate())){
        //console.log('number violation: ' + temp.getUTCDate());
        return true;
    }
    else return false;
}

//deletes datapoints before business hours
function deleteDataPointEarly(num){
    let temp = new Date(num + z);
    if(businessHoursStart > temp.getUTCHours()){
        //console.log('early violation: ' + temp.getUTCHours());
        return true;
    }
    else return false;
}

//deletes datapoints after business hours
function deleteDataPointLate(num){
    let temp = new Date(num + z);
    if(businessHoursEnd < temp.getUTCHours()){
        //console.log('late violation: ' + temp.getUTCHours());
        return true;
    }
    else return false;
}

//Forgot what this does
function convertTime(date){
    let temp = new Date(date);
    console.log("Get Time: " + temp.getTime() - z);
    return temp.getTime() - z;
}