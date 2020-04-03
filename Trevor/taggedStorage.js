let taggedStorage = "Name,Type,Link\n";

function mainRTagged(){
    let DTenv = getEnvironment(document.getElementById('RTaggedEnv').value);
    isTaggedPagination(DTenv['URL'], "/api/v1/entity/infrastructure/hosts?pageSize=100", DTenv['TOK'], 'Host', 0, '/%23newhosts/hostdetails;id=');
}

function isTaggedPagination(URL, ext, TOK, entType, first, link){
    $.ajax({
        url: URL + ext,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Api-Token " + TOK
        },
        complete: function (response, status) {
            console.log(this.url);
            let fnm = response.getAllResponseHeaders();
            console.log(fnm);
            //console.log(response.responseJSON);
            let i = 0;
            let ilength = response.responseJSON.length;
            for(i; i < ilength; i++){
                //console.log(response.responseJSON[i]['tags']);
                if(response.responseJSON[i]['tags'].length == 0){
                    if(!response.responseJSON[i]['entityId'].includes('MOBILE_APPLICATION')){
                        console.log(URL + link + response.responseJSON[i]['entityId']);
                        taggedStorage += response.responseJSON[i]['displayName'] + "," + entType + "," + URL + link + response.responseJSON[i]['entityId'] + "\n";
                    }
                    else taggedStorage += response.responseJSON[i]['displayName'] + "," + entType + "," + URL + '/%23mobileappoverview;appId=' + response.responseJSON[i]['entityId'] + "\n";
                }
            }
            if(entType == 'Host') isTaggedPagination(URL, '/api/v1/entity/infrastructure/processes?pageSize=100', TOK, 'Process', 0, '/%23processdetails;id=');
            else if(entType == 'Process') isTaggedPagination(URL, '/api/v1/entity/services?pageSize=100', TOK, 'Service', 0, '/%23newservices/serviceOverview;id=');
            else if(entType == 'Service') isTaggedPagination(URL, '/api/v1/entity/applications?pageSize=100', TOK, 'RUM App', 0, '/%23uemapplications/uemappmetrics;uemapplicationId=');
            else{completeIsTagged()}
        }
    });
}

function completeIsTagged(){
    let csvContentEnt = "data:text/csv;charset=utf-8," + taggedStorage;
    let encodedUri = encodeURI(csvContentEnt);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "UntaggedHosts.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
}