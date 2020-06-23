$('#dashboard-mover-button1').click(function () {
  let env = getEnvironment($('#dashboard-mover-environment1-select').val());
  let url = env.URL.concat('/api/config/v1/dashboards');
  
  let token = env.TOK;
  // console.log(token);
  axios.get(url, {
    headers: {
      'Authorization': `Api-Token ${token}`
    }
  }).then((res) => {
    // console.log(res.data.dashboards);
    buildDashboardList("dashboard-mover-table1", res.data.dashboards);
  }).catch((err) => {
    // console.log(err);
    alert(`Unable to pull dashboards from tenant: \"${env.slice(4)}\"`);
  })
});

$('#dashboard-mover-button2').click(function () {
  let env = getEnvironment($('#dashboard-mover-environment2-select').val());
  let url = env.URL.concat('/api/config/v1/dashboards');
  let token = env.TOK;
  // console.log(token);
  axios.get(url, {
    headers: {
      'Authorization': `Api-Token ${token}`
    }
  }).then((res) => {
    console.log(res.data.dashboards);
    buildDashboardList("dashboard-mover-table2", res.data.dashboards);
  }).catch((err) => {
    console.log(err);
    alert(`Unable to pull dashboards from tenant: \"${env.slice(4)}\"`);
  })
});

function buildDashboardList(tableID, obj) {
  $(`#${tableID} tr td`).parent().remove();
  obj
    .sort((a, b) => (a.name > b.name) ? 1 : (a.name === b.name) ? ((a.owner > b.owner) ? 1 : -1) : -1)
    .forEach((curVal) => {
      var table = document.getElementById(tableID);
      const tr = document.createElement("tr");
      const nametd = document.createElement("td");
      const nameText = document.createTextNode(curVal.name);
      const ownertd = document.createElement("td");
      const ownerText = document.createTextNode(curVal.owner.split('@')[0]);
      const atd = document.createElement("td");
      const a = document.createElement("a");
      const aText = document.createTextNode("Move");
      a.setAttribute("name", curVal.id);
      a.setAttribute("onclick", `moveDashboard(name, '${tableID}')`);
      a.appendChild(aText);
      atd.appendChild(a);

      nametd.appendChild(nameText);
      ownertd.appendChild(ownerText);
      tr.appendChild(nametd);
      tr.appendChild(ownertd);
      tr.appendChild(atd);
      table.appendChild(tr);
    });
}

function moveDashboard(name, origin) {
  if (confirm("Are you sure?")) {
    let env1 = $('#dashboard-mover-environment1-select').val();
    let url1 = DTEnvs[env1].URL.concat('/api/config/v1/dashboards');
    let token1 = DTEnvs[env1].TOK;
    let env2 = $('#dashboard-mover-environment2-select').val();
    let url2 = DTEnvs[env2].URL.concat('/api/config/v1/dashboards');
    let token2 = DTEnvs[env2].TOK;
    
    if (origin == "dashboard-mover-table1") {
      axios.get(`${url1}/${name}`, {
        headers: {
          'Authorization': `Api-Token ${token1}`,
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        var dbData = res.data;
        delete dbData.id;
        delete dbData.dashboardMetadata.owner;
        console.log(dbData);

        axios({
          method: 'post',
          url: url2,
          headers: {
            'Authorization': `Api-Token ${token2}`,
            'Content-Type': 'application/json'
          },
          data: dbData
        }).then((res) => {
          console.log(res.data);
          alert("SUCCESS!");
        }).catch((err) => {
          console.log(err);
          alert(err);
        });
      });
    }
    if (origin == "dashboard-mover-table2") {
      axios.get(`${url2}/${name}`, {
        headers: {
          'Authorization': `Api-Token ${token2}`,
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        var dbData = res.data;
        delete dbData.id;
        delete dbData.dashboardMetadata.owner;
        console.log(dbData);

        axios({
          method: 'post',
          url: url1,
          headers: {
            'Authorization': `Api-Token ${token1}`,
            'Content-Type': 'application/json'
          },
          data: dbData
        }).then((res) => {
          console.log(res.data);
          alert("SUCCESS!");
        }).catch((err) => {
          console.log(err);
          alert(err);
        });
      });
    }
  }
}