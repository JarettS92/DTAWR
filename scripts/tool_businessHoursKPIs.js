let IllegalWeekDays = []; 
let IllegalNumbDays = [];
let businessHoursStart = 0;
let businessHoursEnd = 0;
let z = 0;

// Apply datepicker
$(function(){
  $('#bhkpi-start').timepicker();
  $('#bhkpi-end').timepicker();
  $('#bhkpi-business-hour-start').timepicker();
  $('#bhkpi-business-hour-end').timepicker();
});

//mainfunction for Business Hour KPIs
function mainBusinessHourKPIs(){
    let DTenv = getEnvironment(document.getElementById("bhkpi-environment-select").value);
    businessHoursStart = document.getElementById('bhkpi-business-hour-start').value;
    businessHoursEnd = document.getElementById('bhkpi-business-hour-end').value;
    if(!document.getElementById('bhkpi-sunday-checkbox').checked) IllegalWeekDays.push(0);
    if(!document.getElementById('bhkpi-monday-checkbox').checked) IllegalWeekDays.push(1);
    if(!document.getElementById('bhkpi-tuesday-checkbox').checked) IllegalWeekDays.push(2);
    if(!document.getElementById('bhkpi-wednesday-checkbox').checked) IllegalWeekDays.push(3);
    if(!document.getElementById('bhkpi-thursday-checkbox').checked) IllegalWeekDays.push(4);
    if(!document.getElementById('bhkpi-friday-checkbox').checked) IllegalWeekDays.push(5);
    if(!document.getElementById('bhkpi-saturday-checkbox').checked) IllegalWeekDays.push(6);
    let d = new Date();
    let m = d.getTimezoneOffset();
    z = m * 60000 * (-1);
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": DTenv['URL'] + "/api/v1/timeseries/" + document.getElementById('bhkpi-metric-select').value + "?startTimestamp=" + convertTime(document.getElementById('bhkpi-business-hour-start').value) + "&endTimestamp=" + convertTime(document.getElementById('bhkpi-business-hour-end').value) + "&includeData=true",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Api-Token " + DTenv['TOK']
        },
        "processData": false,
        "data": ""
    }

    if(document.getElementById('bhkpi-aggregation-input').value != '') settings['url'] += "&aggregationType=" + document.getElementById('bhkpi-aggregation-input').value;
    if(document.getElementById('bhkpi-tag-select').value != '') settings['url'] += "&tag=" + document.getElementById('bhkpi-tag-select').value;
    if(document.getElementById('bhkpi-percentile-input').value != '') settings['url'] += "&percentile=" + document.getElementById('bhkpi-percentile-input').value;
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
    document.getElementById('bhkpi-table').style.display = 'block';
    document.getElementById('bhkpi-tbody').innerHTML += "<tr><td>" + document.getElementById('bhkpi-tag-select').value + "</td><td>" + (sum / count).toFixed(2) + " " + storage2['unit'] + "</td><td>" + document.getElementById('bhkpi-metric-select').value + "</td></tr>";
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

