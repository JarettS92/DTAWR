//Problem Trending Main function
function mainProblemTrending() {
  replaceButton('ProblemTrendingButtonWrapper');

  action = dtrum.enterAction('Run problem trending', 'click');
  
  let DTenv = getEnvironment(document.getElementById("problem-trending-environment-select").value);
  dtrum.addActionProperties(action, null, null, {environment: DTenv['URL']});
  dtrum.sendSessionProperties(null, null, {environment: DTenv['URL']});
  dtrum.leaveAction(action);

  skipped = 0;

  year = document.getElementById("problem-trending-start").value;
  month = document.getElementById("startMonthPT").value;
  day = document.getElementById("startDayPT").value;

  Eyear = document.getElementById("endYearPT").value;
  Emonth = document.getElementById("endMonthPT").value;
  Eday = document.getElementById("endDayPT").value;

  tag = document.getElementById("TagPT").value.split(",");

  error = document.getElementById('ERRORPT').checked;
  resource = document.getElementById('RESOURCEPT').checked;
  slowdown = document.getElementById('SLOWDOWNPT').checked;
  availability = document.getElementById('AVAILABILITYPT').checked;
  //customAlert = document.getElementById('CUSTOM_ALERT').checked;

  applications = document.getElementById('APPLICATIONSPT').checked;
  services = document.getElementById('SERVICESPT').checked;
  infrastructure = document.getElementById('INFRASTRUCTUREPT').checked;
  environment = document.getElementById('ENVIRONMENTPT').checked;

  Oday = Number(day);
  Omonth = Number(month);
  Oyear = Number(year);

  month--;
  Emonth--;
  script(0);
}

function script(num) {
  fixDate2(true, month, day, year);
  fixDate2(false, Emonth, Eday, Eyear);
  let start = Date.UTC(year, month, JSON.stringify(Number(day)));
  let end = Date.UTC(year, month, JSON.stringify(Number(day) + 7));
  let time = new Date(Eyear, Emonth, Eday);
  let time2 = new Date(end);
  ProblemTypeCount['month'] = month;
  ProblemTypeCount['day'] = day;
  ProblemTypeCount['year'] = year;
  if(num > 0)	metrics.push(ProblemTypeCount);
  resetCounts();
  let DTenv = getEnvironment(document.getElementById("problem-trending-environment-select").value);
  if (time2 < time) getProblems(DTenv['URL'], DTenv['TOK'], start, end, num);
  else finishTable(num);
}

function getProblems(dynatraceURL, token, startTime, endTime, num){
  let tagStr = '';
  for (let i = 0; i < tag.length; i++) tagStr += "&tag=" + tag[i];
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
          addToLogs('null', 'black', true);
          day = Number(day) + 7;
          setTimeout(script(num + 1), 5000);
      }
      else finishTable(num);
  });
}

function finishTable(num){
  addToLogsPT('Analysis complete...', '#00ff00', true);
  addToLogsPT('Building data visualizations...', 'black', true);
  let head = document.getElementById('HeadPT');
  let table = document.getElementById('TablePT');

  let rowCount = 1;
  let rowTop = table.insertRow(0);
  let temp = rowTop.insertCell(0);

  let rowHead = head.insertRow(0);
  let tempHead = rowHead.insertCell(0);
  tempHead.innerHTML = 'Date';
  
  day = Oday;
  month = Omonth;
  year = Oyear;

  for(let i = 0; i < num; i ++){
      tempHead = rowHead.insertCell(i + 1);
      tempHead.innerHTML = month + '/' + day + '/' + year;
      day = Number(day) + 7;
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
  let chart1 = document.getElementById('chart1PT').getContext('2d');
  let chart2 = document.getElementById('chart2PT').getContext('2d');
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
      chartSettings1['data']['labels'].push((new Date(metrics[i]['year'], metrics[i]['month'], metrics[i]['day'])).toLocaleDateString());
      chartSettings1['data']['datasets'][0]['data'].push(Number(metrics[i]['avgTime']));
      chartSettings1['data']['datasets'][1]['data'].push(metrics[i]['applications']);
      chartSettings1['data']['datasets'][2]['data'].push(metrics[i]['services']);
      chartSettings1['data']['datasets'][3]['data'].push(metrics[i]['infrastructure']);
      chartSettings1['data']['datasets'][4]['data'].push(metrics[i]['environment']);

      chartSettings2['data']['labels'].push((new Date(metrics[i]['year'], metrics[i]['month'], metrics[i]['day'])).toLocaleDateString());
      chartSettings2['data']['datasets'][0]['data'].push(Number(metrics[i]['avgTime']));
      chartSettings2['data']['datasets'][1]['data'].push(metrics[i]['error']);
      chartSettings2['data']['datasets'][2]['data'].push(metrics[i]['resource']);
      chartSettings2['data']['datasets'][3]['data'].push(metrics[i]['slowdown']);
      chartSettings2['data']['datasets'][4]['data'].push(metrics[i]['availability']);
  }

  let mixedChart1 = new Chart(chart1, chartSettings1);
  let mixedChart2 = new Chart(chart2, chartSettings2);

  document.getElementById('chart1PT').style.display = "block";
  document.getElementById('chart2PT').style.display = "none";
  //document.getElementById('hideMe').style.display = "block";
  
  addToLogsPT('Data visualized...', '#00ff00', true);
  addToLogsPT('GOOD BYE...', '#00ff00', true);

  reset();           
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
      month = Tmonth;
      day = Tday;
      year = Tyear;
  }
  else{
      Emonth = Tmonth;
      Eday = Tday;
      Eyear = Tyear;
  }
}

function fixDate(){
  if (month == 2 && year % 4 == 0 && day > 29){
      month++;
      day -= 29;
  }
  else if (month == 2 && year % 4 != 0 && day > 28){
      month++;
      day -= 28;
  }
  else if(month % 2 == 0 && day > 30){
      month++;
      day -= 30;
  }
  else if (day > 31){
      month++;
      day -= 31;
  }
  else {/*nothing*/}
  if(month > 12){
      month = 1;
      year++;
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

function flip(){
  if (document.getElementById('chart1PT').style.display != "none"){
      document.getElementById('chart1PT').style.display = "none";
      document.getElementById('chart2PT').style.display = "block";
  }
  else {
      document.getElementById('chart1PT').style.display = "block";
      document.getElementById('chart2PT').style.display = "none";
  }
}

function addToLogsPT(message, color, newLine){
  if(newLine) document.getElementById('logsPT').innerHTML += "<br>";
  if(message != 'null')document.getElementById('logsPT').innerHTML += "<span style='color: " + color + ";'>" + message + "</span>";
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
//Tag Dup code