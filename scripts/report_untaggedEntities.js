let taggedStorage = "Name,Type,Link\n";
// JARETT SMITH ADDITION
let taggedStorageArray = [];
// -----------------------------

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
                        // JARETT SMITH ADDITION
                        taggedStorageArray.push(`${response.responseJSON[i]['displayName'] + "," + entType + "," + response.responseJSON[i]['entityId'] + "," + URL + link + response.responseJSON[i]['entityId']}`);
                    }
                    else {
                        taggedStorage += response.responseJSON[i]['displayName'] + "," + entType + "," + URL + '/%23mobileappoverview;appId=' + response.responseJSON[i]['entityId'] + "\n";
                        // JARETT SMITH ADDITION
                        taggedStorageArray.push(response.responseJSON[i]['displayName'] + "," + entType + "," + response.responseJSON[i]['entityId'] + "," + URL + '/%23mobileappoverview;appId=' + response.responseJSON[i]['entityId']);

                    }
                }
            }
            if(entType == 'Host') isTaggedPagination(URL, '/api/v1/entity/infrastructure/processes?pageSize=100', TOK, 'Process', 0, '/%23processdetails;id=');
            else if(entType == 'Process') isTaggedPagination(URL, '/api/v1/entity/services?pageSize=100', TOK, 'Service', 0, '/%23newservices/serviceOverview;id=');
            else if(entType == 'Service') isTaggedPagination(URL, '/api/v1/entity/applications?pageSize=100', TOK, 'RUM App', 0, '/%23uemapplications/uemappmetrics;uemapplicationId=');
            else{
                // JARETT SMITH ADDITION
                if($('#cb1').is(':checked')){
                    completeIsTagged();
                }
                populatePage();
            }
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

// JARETT SMITH ADDITION
function populatePage(){
    let table = document.getElementById('untaggedEntities');
    
    taggedStorageArray.forEach((curVal) => {
        let tr = document.createElement('tr');
        let etd = document.createElement('td');
        let ttd = document.createElement('td');
        let utd = document.createElement('td');
        let a = document.createElement('a');
        let itd = document.createElement('td');
        let str1 = document.createTextNode(curVal.split(',')[0]);
        let str2 = document.createTextNode(curVal.split(',')[1]);
        let str3 = document.createTextNode(curVal.split(',')[2]);
        let str4 = document.createTextNode("Link");

        etd.appendChild(str1);
        ttd.appendChild(str2);
        a.appendChild(str4);
        a.setAttribute('href', curVal.split(',')[3])
        utd.appendChild(a);
        itd.appendChild(str3);
        tr.appendChild(etd);
        tr.appendChild(ttd);
        tr.appendChild(itd);
        tr.appendChild(utd);
        table.appendChild(tr);
    });
    // console.log(taggedStorageArray);
}