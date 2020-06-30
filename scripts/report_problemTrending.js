// Problem Trending Variables
let day, year, month;
let Oday, Oyear, Omonth;
let Eday, Eyear, Emonth;
let tag = [];
let tagCount = [];
let skipped = 0;
let metrics = [];
let error, resource, slowdown, availability, applications, services, infrastructure, environment;
let row;
let ProblemTypeCount = {
    'month': 0,
    'day': 0,
    'year': 0,
    'totalProblems': 0,
    'avgTime': 0,
    'error': 0,
    'resource': 0,
    'slowdown': 0,
    'availability': 0,
    'customAlert': 0,
    'applications': 0,
    'services': 0,
    'infrastructure': 0,
    'environment': 0
};

$('#problem-trending-chart-switch').on('click', () => {
    $('.severity').toggleClass('none');
    $('.impact').toggleClass('none');
});

//Problem Trending Main function
function mainProblemTrending() {
    if($('#problem-trending-environment-select').val() != null) {
        let startDate = new Date(start);
        let endDate = new Date(end);

        skipped = 0;

        startYear = startDate.getFullYear();
        startMonth = startDate.getMonth();
        startDay = startDate.getDate();

        endYear = endDate.getFullYear();
        endMonth = endDate.getMonth();
        endDay = endDate.getDate();

        // console.log(startYear, startMonth, startDay, endYear, endMonth, endDay);

        //   console.log(typeof startYear, startMonth, startDay, endYear, endMonth, endDay);

        tag = $("#problem-trending-tag-select").val();

        error = $('#problem-trending-error-checkbox').prop("checked");
        resource = $('#problem-trending-resource-checkbox').prop("checked");
        slowdown = $('#problem-trending-slowdown-checkbox').prop("checked");
        availability = $('#problem-trending-availability-checkbox').prop("checked");
        //customAlert = $('#CUSTOM_ALERT').prop("checked");

        applications = $('#problem-trending-applications-checkbox').prop("checked");
        services = $('#problem-trending-services-checkbox').prop("checked");
        infrastructure = $('#problem-trending-infrastructure-checkbox').prop("checked");
        environment = $('#problem-trending-environment-checkbox').prop("checked");

        Oday = startDay;
        Omonth = startMonth;
        Oyear = startYear;

        //   startMonth--;
        //   endMonth--;
        script(0);
    } else alert('SELECT ENVIRONMENT!');
  
}

function script(num) {
  fixDate2(true, startMonth, startDay, startYear);
  fixDate2(false, endMonth, endDay, endYear);
  let start = Date.UTC(startYear, startMonth, startDay);
  let end = Date.UTC(startYear, startMonth, startDay + 7);
  let time = new Date(endYear, endMonth, endDay);
  let time2 = new Date(end);
  ProblemTypeCount['startMonth'] = startMonth;
  ProblemTypeCount['startDay'] = startDay;
  ProblemTypeCount['startYear'] = startYear;
  if(num > 0)	metrics.push(ProblemTypeCount);
  resetCounts();
  let DTenv = getEnvironment($("#problem-trending-environment-select").val());
  if (time2 < time) getProblems(DTenv['URL'], DTenv['TOK'], start, end, num);
  else finishTable(num);
}

function getProblems(dynatraceURL, token, startTime, endTime, num){
  let tagStr = (tag != null) ? `&tag=${tag}`: '';
//   for (let i = 0; i < tag.length; i++) tagStr += "&tag=" + tag[i];
  let settings = {
  "async": true,
  "crossDomain": true,
  "url": dynatraceURL + "/api/v1/problem/feed?startTimestamp=" + startTime + "&endTimestamp=" + endTime + tagStr + "&status=CLOSED",
  "method": "GET",
  "headers": {
      "Authorization": "Api-Token " + token,
      "Content-Type": "application/json",
      "cache-control": "no-cache"
  },
  "processData": false,
  "data": ""
  }

  if(tag == '') settings['url'] = dynatraceURL + "/api/v1/problem/feed?startTimestamp=" + startTime + "&endTimestamp=" + endTime + "&status=CLOSED";

  $.ajax(settings).done(function (response) {
      let shortcut = response['result']['problems'];
      let rawMinutes = 0;
      addToLogsPT('null', '#00ff00', true);
      addToLogsPT("Fetched data for: ", 'black', false);
      addToLogsPT(new Date(startTime), '#00ff00', false);
      for(let i = 0; i < shortcut.length; i++){
          let counts = true;
          if(shortcut[i]['impactLevel'] == 'APPLICATION' && applications)	ProblemTypeCount['applications']++;
          else if(shortcut[i]['impactLevel'] == 'SERVICE' && services) ProblemTypeCount['services']++;
          else if(shortcut[i]['impactLevel'] == 'INFRASTRUCTURE' && infrastructure) ProblemTypeCount['infrastructure']++;
          else if(shortcut[i]['impactLevel'] == 'ENVIRONMENT' && environment)	ProblemTypeCount['environment']++;
          else{
              addToLogsPT('IMPACT: ' + shortcut[i]['impactLevel'], 'red', true);
              counts = false;
          }
          if(shortcut[i]['severityLevel'] == 'ERROR' && error) ProblemTypeCount['error']++;
          else if(shortcut[i]['severityLevel'] == 'RESOURCE_CONTENTION' && resource) ProblemTypeCount['resource']++;
          else if(shortcut[i]['severityLevel'] == 'PERFORMANCE' && slowdown) ProblemTypeCount['slowdown']++;
          else if(shortcut[i]['severityLevel'] == 'AVAILABILITY' && availability)	ProblemTypeCount['availability']++;
          //else if(shortcut[i]['severityLevel'] == 'CUSTOM_ALERT' && customAlert) ProblemTypeCount['customAlert']++;
          else{
              addToLogsPT('SEVERITY: ' + shortcut[i]['severityLevel'], 'red', true);
              counts = false;
          }
          if(counts){
              let minutes = (shortcut[i]['endTime'] - shortcut[i]['startTime']) / 60000;
              rawMinutes += minutes;
          }
          else skipped += 1;
      }
      ProblemTypeCount['totalProblems'] = response['result']['problems'].length - skipped;
      addToLogsPT('Avg Length: ', 'black', true);            
      logDate((rawMinutes / (shortcut.length - skipped)).toFixed(0));
      if (ProblemTypeCount['totalProblems'] != 0) ProblemTypeCount['avgTime'] =  (rawMinutes / (shortcut.length - skipped)).toFixed(0);
      else ProblemTypeCount['avgTime'] = 0;
      skipped = 0;
      if(num < 52){
          addToLogsPT('null', 'black', true);
          startDay = startDay + 7;
          setTimeout(script(num + 1), 5000);
      }
      else finishTable(num);
  });
}

function finishTable(num){
  addToLogsPT('Analysis complete...', '#00ff00', true);
  addToLogsPT('Building data visualizations...', 'black', true);
  let head = $('#problem-trending-thead').empty().get(0);
  let table = $('#problem-trending-tbody').empty().get(0);

  let rowCount = 1;
  let rowTop = table.insertRow(0);
  let temp = rowTop.insertCell(0);

  let rowHead = head.insertRow(0);
  let tempHead = rowHead.insertCell(0);
  tempHead.innerHTML = 'Date';
  
  startDay = Oday;
  startMonth = Omonth + 1;
  startYear = Oyear;

  for(let i = 0; i < num; i ++){
      tempHead = rowHead.insertCell(i + 1);
      tempHead.innerHTML = startMonth + '/' + startDay + '/' + startYear;
      startDay = startDay + 7;
      fixDate();
  }

  let tempRow = table.insertRow(rowCount);
  let cell = tempRow.insertCell(0);
  cell.innerHTML = 'Problem Count';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['totalProblems'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Avg Length';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['avgTime'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Sev: error';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['error'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Sev: resource';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['resource'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Sev: slowdown';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['slowdown'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Sev: availability';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['availability'];
      
  }
  rowCount++;

  // tempRow = table.insertRow(rowCount);
  // cell = tempRow.insertCell(0);
  // cell.innerHTML = 'Sev: customAlert';
  // for(let i = 0; i < num; i ++){
  //     cell = tempRow.insertCell(i + 1);
  //     cell.innerHTML = 0;

  // }
  // rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Impact: applications';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['applications'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Impact: services';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['services'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Impact: infrastructure';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['infrastructure'];
      
  }
  rowCount++;

  tempRow = table.insertRow(rowCount);
  cell = tempRow.insertCell(0);
  cell.innerHTML = 'Impact: environment';
  for(let i = 0; i < num; i ++){
      cell = tempRow.insertCell(i + 1);
      cell.innerHTML = metrics[i]['environment'];
      
  }
  rowCount++;
  
  drawChart2();
}

function drawChart2(){
  //Chart.defaults.global.defaultFontColor = 'black';

  let chart1 = document.getElementById('problem-trending-chart1');
  let chart2 = document.getElementById('problem-trending-chart2');
  let chartContext1 = chart1.getContext('2d');
  let chartContext2 = chart2.getContext('2d');
  
  let chartSettings1 = {
      type: 'bar',
      data: {
          datasets: [
          {
              label: 'Avg Length (mins)',
              data: [],
              backgroundColor: 'black',
              borderColor: 'black',
              yAxisID: 'y-axis-2',
              fill: false,

              // Changes this dataset to become a line
              type: 'line'
          },
          {
              label: 'Application',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(20, 150, 255, 0.5)',
              borderColor: '#1496FF',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Services',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(115, 190, 40, 0.5)',
              borderColor: '#73BE28',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Infrastructure',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(111, 45, 168, 0.5)',
              borderColor: '#6F2DA8',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Environment',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(181, 221, 0, 0.5)',
              borderColor: '#B5DD00',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          }],
          labels: []
      },
      options: {
        title: {
            display: true,
            text: 'Severity'
        },
          responsive: true,
          hoverMode: 'index',
          scales: {
              yAxes: [{
                  type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                  display: true,
                  position: 'left',
                  id: 'y-axis-1',
              }, {
                  type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                  display: true,
                  position: 'right',
                  id: 'y-axis-2',

                  // grid line settings
                  gridLines: {
                      drawOnChartArea: false, // only want the grid lines for one axis to show up
                  },
              }]
          }
      }
  };
  
  let chartSettings2 = {
      type: 'bar',
      data: {
          datasets: [
          {
              label: 'Avg Length (mins)',
              data: [],
              backgroundColor: 'black',
              borderColor: 'black',
              yAxisID: 'y-axis-2',
              fill: false,

              // Changes this dataset to become a line
              type: 'line'
          },
          {
              label: 'Error',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(20, 150, 255, 0.5)',
              borderColor: '#1496FF',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Resource',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(115, 190, 40, 0.5)',
              borderColor: '#73BE28',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Slowdown',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(111, 45, 168, 0.5)',
              borderColor: '#6F2DA8',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          },
          {
              label: 'Availability',
              data: [],
              stack: 's1',
              backgroundColor: 'rgba(181, 221, 0, 0.5)',
              borderColor: '#B5DD00',
              borderWidth: 2,
              yAxisID: 'y-axis-1'
          }],
          labels: []
      },
      options: {
          title: {
              display: true,
              text: 'Impact'
          },
          responsive: true,
          hoverMode: 'index',
          scales: {
              yAxes: [{
                  type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                  display: true,
                  position: 'left',
                  id: 'y-axis-1',
              }, 
              {
                  type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                  display: true,
                  position: 'right',
                  id: 'y-axis-2',

                  // grid line settings
                  gridLines: {
                      drawOnChartArea: false, // only want the grid lines for one axis to show up
                  },
              }],
          }
      }
  };
  
    for (let i = 0; i < metrics.length; i++) {
        chartSettings1['data']['labels'].push((new Date(metrics[i]['startYear'], metrics[i]['startMonth'], metrics[i]['startDay'])).toLocaleDateString());
        chartSettings1['data']['datasets'][0]['data'].push(Number(metrics[i]['avgTime']));
        chartSettings1['data']['datasets'][1]['data'].push(metrics[i]['applications']);
        chartSettings1['data']['datasets'][2]['data'].push(metrics[i]['services']);
        chartSettings1['data']['datasets'][3]['data'].push(metrics[i]['infrastructure']);
        chartSettings1['data']['datasets'][4]['data'].push(metrics[i]['environment']);

        chartSettings2['data']['labels'].push((new Date(metrics[i]['startYear'], metrics[i]['startMonth'], metrics[i]['startDay'])).toLocaleDateString());
        chartSettings2['data']['datasets'][0]['data'].push(Number(metrics[i]['avgTime']));
        chartSettings2['data']['datasets'][1]['data'].push(metrics[i]['error']);
        chartSettings2['data']['datasets'][2]['data'].push(metrics[i]['resource']);
        chartSettings2['data']['datasets'][3]['data'].push(metrics[i]['slowdown']);
        chartSettings2['data']['datasets'][4]['data'].push(metrics[i]['availability']);
    }

    if(window.chartContext1 != undefined) window.chartContext1.destroy();
    window.chartContext1 = new Chart(chart1, chartSettings1);

    if(window.chartContext2 != undefined) window.chartContext2.destroy();
    window.chartContext2 = new Chart(chart2, chartSettings2);
  
    addToLogsPT('Data visualized...', '#00ff00', true);
    addToLogsPT('GOOD BYE...', '#00ff00', true);

    resetPT();           
}

function fixDate2(isStart, Tmonth, Tday, Tyear){
  Tmonth ++;
  if (Tmonth == 2 && Tyear % 4 == 0 && Tday > 29){
      Tmonth++;
      Tday -= 29;
  }
  else if (Tmonth == 2 && Tyear % 4 != 0 && Tday > 28){
      Tmonth++;
      Tday -= 28;
  }
  else if(Tmonth % 2 == 0 && Tday > 30){
      Tmonth++;
      Tday -= 30;
  }
  else if (Tday > 31){
      Tmonth++;
      Tday -= 31;
  }
  else {}
  if(Tmonth > 12){
      Tmonth = 1;
      Tyear++;
  }
  Tmonth--;
  if(isStart){
      startMonth = Tmonth;
      startDay = Tday;
      startYear = Tyear;
  }
  else{
      endMonth = Tmonth;
      endDay = Tday;
      EstartYear = Tyear;
  }
}

function fixDate(){
  if (startMonth == 2 && startYear % 4 == 0 && startDay > 29){
      startMonth++;
      startDay -= 29;
  }
  else if (startMonth == 2 && startYear % 4 != 0 && startDay > 28){
      startMonth++;
      startDay -= 28;
  }
  else if(startMonth % 2 == 0 && startDay > 30){
      startMonth++;
      startDay -= 30;
  }
  else if (startDay > 31){
      startMonth++;
      startDay -= 31;
  }
  else {/*nothing*/}
  if(startMonth > 12){
      startMonth = 1;
      startYear++;
  }
}

function resetCounts(){
  ProblemTypeCount = {
      'totalProblems': 0,
      'avgTime': 0,
      'error': 0,
      'resource': 0,
      'slowdown': 0,
      'availability': 0,
      'customAlert': 0,
      'applications': 0,
      'services': 0,
      'infrastructure': 0,
      'environment': 0
  };
}

function logDate(minutes){
  let hours = minutes / 60;
  let days = hours / 24;
  days = Math.floor(days);
  hours = Math.floor(hours % 24);
  minutes = (minutes % 60).toFixed(0);
  addToLogsPT(days, 'r', false);
  addToLogsPT(' days ', 'red', false);
  addToLogsPT(hours, 'r', false);
  addToLogsPT(' hours ', 'red', false);
  addToLogsPT(minutes, 'r', false);
  addToLogsPT(' minutes', 'red', false);
}

// function flip(){
//   if ($('#problem-trending-chart1').hasClass("none")){
//       $('#problem-trending-chart1').hasClass("none");
//       document.getElementById('problem-trending-chart2').style.display = "block";
//   }
//   else {
//       document.getElementById('problem-trending-chart1').style.display = "block";
//       $('#problem-trending-chart2').hasClass("none")
//   }
// }

function addToLogsPT(message, color, newLine){
  if(newLine) $('#problem-trending-logs').innerHTML += "<br>";
  if(message != 'null') $('#problem-trending-logs').innerHTML += "<span style='color: " + color + ";'>" + message + "</span>";
}

function resetPT(){
    //PT Vars
    tag = [];
    tagCount = [];
    skipped = 0;
    metrics = [];
    error = 0;
    resource = 0;
    slowdown = 0;
    availability = 0;
    applications = 0;
    services = 0;
    infrastructure = 0;
    environment = 0;
    row = 0;
    ProblemTypeCount = {
        'month': 0,
        'day': 0,
        'year': 0,
        'totalProblems': 0,
        'avgTime': 0,
        'error': 0,
        'resource': 0,
        'slowdown': 0,
        'availability': 0,
        'customAlert': 0,
        'applications': 0,
        'services': 0,
        'infrastructure': 0,
        'environment': 0
    };
}