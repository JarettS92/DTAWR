let IllegalWeekDays = []; 
let IllegalNumbDays = [];
let businessHoursStart = 0;
let businessHoursEnd = 0;
let startDate = null;
let endDate = null;
let z = 0;

// Apply timepicker
$(function(){
  $('.timepicker').timepicker();
});

$('.checkbox').click(function(){
    let startTime = $(`#${$(this).prop('id').split('checkbox')[0].concat('start')}`);
    let endTime = $(`#${$(this).prop('id').split('checkbox')[0].concat('end')}`);
    if($(this).prop("checked")){
        // console.log(start, end);
        startTime.prop('disabled', false);
        endTime.prop('disabled', false);
    }
    else{
        startTime.prop('disabled', true);
        endTime.prop('disabled', true);
    }
});

//mainfunction for Business Hour KPIs
function mainBusinessHourKPIs(){
    let DTenv = getEnvironment($("#bhkpi-environment-select").val());
    let startDate = new Date(start).getTime();
    let endDate = new Date(end).getTime();
    businessHoursStart = $('#bhkpi-business-hour-start').val();
    businessHoursEnd = $('#bhkpi-business-hour-end').val();
    let tag = ($('#bhkpi-tag-input').val() != "") ? $('#bhkpi-tag-select').val().concat(`:${$('#bhkpi-tag-input').val()}`) : $('#bhkpi-tag-select').val();
    if(!$('#bhkpi-sunday-checkbox').prop("checked")) IllegalWeekDays.push(0);
    if(!$('#bhkpi-monday-checkbox').prop("checked")) IllegalWeekDays.push(1);
    if(!$('#bhkpi-tuesday-checkbox').prop("checked")) IllegalWeekDays.push(2);
    if(!$('#bhkpi-wednesday-checkbox').prop("checked")) IllegalWeekDays.push(3);
    if(!$('#bhkpi-thursday-checkbox').prop("checked")) IllegalWeekDays.push(4);
    if(!$('#bhkpi-friday-checkbox').prop("checked")) IllegalWeekDays.push(5);
    if(!$('#bhkpi-saturday-checkbox').prop("checked")) IllegalWeekDays.push(6);
    let d = new Date();
    let m = d.getTimezoneOffset();
    z = m * 60000 * (-1);
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": DTenv['URL'] + "/api/v1/timeseries/" + $('#bhkpi-metric-select').val() + "?startTimestamp=" + startDate + "&endTimestamp=" + endDate + "&includeData=true",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Api-Token " + DTenv['TOK']
        },
        "processData": false,
        "data": ""
    }

    settings['url'] += "&aggregationType=" + $('#bhkpi-aggregation-select').val();
    if($('#bhkpi-tag-select').val() != null) settings['url'] += "&tag=" + tag;
    if($('#bhkpi-percentile-select').val() != null) settings['url'] += "&percentile=" + $('#bhkpi-percentile-select').val();

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
    document.getElementById('bhkpi-tbody').innerHTML += "<tr><td>" + $('#bhkpi-tag-select').val() + "</td><td>" + (sum / count).toFixed(2) + " " + storage2['unit'] + "</td><td>" + $('#bhkpi-metric-select').val() + "</td></tr>";
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