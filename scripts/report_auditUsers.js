function mainAuditReport() {
  if($('#audit-users-environment-select').val() != null){
    let env = getEnvironment($('#audit-users-environment-select').val());
    let envBool = (env != undefined || env != null) ? true : false;
    let url = env.URL;
    let token = env.TOK;
    
    let loginBool = $('#audit-users-logins-checkbox').prop("checked");
    let configBool = $('#audit-users-config-checkbox').prop("checked");

    let filterArray = [];

    if(loginBool) filterArray.push()
    

    axios.get(`${url}/api/v2/auditlogs?pageSize=5000&sort=-timestamp`,{
      headers: {
        'Authorization': `Api-Token ${token}`,
        'Content-Type': 'application/json'
      }
    }).then((res) => {
        // console.log(res.data);
        populateAuditUsersTable(res.data.auditLogs);
      });
    // console.log(env);
  } else alert('SELECT ENVIRONMENT!');
}

function populateAuditUsersTable(auditLogsArray) {
  let tbody = document.getElementById('audit-users-tbody');
  auditLogsArray.forEach((curVal) => {
    let date = new Date(curVal.timestamp);
    let tr = document.createElement('tr');
    let timetext = document.createTextNode(`${date.toDateString()} ${date.toTimeString().slice(0,8)}`);
    let usertext = document.createTextNode(curVal.user);
    let usertypetext = document.createTextNode(curVal.userType);
    let categorytext = document.createTextNode(curVal.category);
    let successtext = document.createTextNode(curVal.success);
    let eventtypetext = document.createTextNode(curVal.eventType);
    let timetd = document.createElement('td');
    let usertd = document.createElement('td');
    let userTypetd = document.createElement('td');
    let categorytd = document.createElement('td');
    let successtd = document.createElement('td');
    let eventTypetd = document.createElement('td');

    timetd.appendChild(timetext);
    usertd.appendChild(usertext);
    userTypetd.appendChild(usertypetext);
    categorytd.appendChild(categorytext);
    successtd.appendChild(successtext);
    eventTypetd.appendChild(eventtypetext);

    tr.appendChild(timetd);
    tr.appendChild(eventTypetd);
    tr.appendChild(usertd);
    tr.appendChild(userTypetd);
    tr.appendChild(categorytd);
    tr.appendChild(successtd);
    if(curVal.eventType == "LOGIN" || curVal.eventType == "LOGOUT"){
      tr.setAttribute("eventType", "LOGIN");
    }
    if(curVal.category == "CONFIG"){
      tr.setAttribute("eventtype", "CONFIG");
    }
    // console.log(text);
    tbody.appendChild(tr);
  });
}

$('#login-filter').click(function() {
  if($('#login-filter').hasClass('selected')){
    $('[eventtype="CONFIG"').removeClass("display").addClass("none");
    // console.log('SELECTED');
  }
  if(!$('#login-filter').hasClass('selected')){
    $('[eventtype="CONFIG"').removeClass("none").addClass("display");
    // console.log('NOT SELECTED');
  }
  $('#config-filter').removeClass('selected');
});

$('#config-filter').click(function() {
  if($('#config-filter').hasClass('selected')){
    $('[eventtype="LOGIN"').removeClass("display").addClass("none");
  }
  if(!$('#config-filter').hasClass('selected')){
    $('[eventtype="LOGIN"').removeClass("none").addClass("display");
  }
  $('#login-filter').removeClass('selected');
});