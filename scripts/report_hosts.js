async function mainHostsReport(){
  let DTenv = getEnvironment(document.getElementById("hostsReportEnv").value);
  let mz = document.getElementById("hostsReportEnv").value;
  // console.log(DTenv, mz);

  let hosts = new Promise((resolve, reject) => {
    axios.get(DTenv['URL']+'/api/v1/entity/infrastructure/hosts', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Token ${DTenv['TOK']}`
      }
    }).then((res) => {
        if(res.status == '200'){
            resolve(res.data);
          // console.log(res.data.values.map(x => x.displayName));
          // console.log(res.data);
          // envTags = res.data.values.map(x => x.displayName);
        } else {
            reject("Error");
        }
    });
  });
  console.log(await hosts);
  populateHostsReport(await hosts);
}

function populateHostsReport(hostArray){
  let count = hostArray.length;
  console.log(count);
  document.getElementById('hostCount').innerHTML = count;
}
