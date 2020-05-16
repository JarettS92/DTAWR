//main function for Tag Duplicator
function mainTagDuplicator() {
    let DTenv = getEnvironment(document.getElementById("TagDuplicatorEnv1").value);
    let settings = {
        "url": DTenv['URL'] + "/api/config/v1/autoTags",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Api-Token " + DTenv['TOK'],
            "Content-Type": "application/json"
        }
    };
    let tagList = [];
    $.ajax(settings).done(function (response) {
        getUserInput(response);
        // for (let i = 0; i < response['values'].length; i++) tagList.push(response['values'][i]['name']);
        // console.log(tagList);
        // return tagList;
    });
}

//Get a single tag rule, to be duplicated
function getOneTag(id) {
    let DTenv = getEnvironment(document.getElementById("TagDuplicatorEnv1").value);
    let settings = {
        "url": DTenv['URL'] + "/api/config/v1/autoTags/" + id,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Api-Token " + DTenv['TOK'],
            "Content-Type": "application/json"
        }
    };
    $.ajax(settings).done(function (response) {
        postOneTag(response);
    });
}

//Posts a tag rule to an environment
function postOneTag(rule) {
    let DTenv = getEnvironment(document.getElementById("TagDuplicatorEnv2").value);
    rule["name"] = document.getElementById("TagDuplicatorTag2").value;
    delete rule['metadata'];
    delete rule['id'];
    let settings = {
        "url": DTenv['URL'] + "/api/config/v1/autoTags",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Authorization": "Api-Token " + DTenv['TOK'],
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(rule),
    };
    $.ajax(settings).done(function (response) {
        document.getElementById('dupTagParent').style.display = "block";
        document.getElementById('duplicatedTags').innerHTML += "<tr><td>" + document.getElementById('TagDuplicatorEnv1').value + "</td><td>" + document.getElementById('TagDuplicatorTag1').value + "</td><td>" + document.getElementById('TagDuplicatorEnv2').value + "</td><td>" + document.getElementById('TagDuplicatorTag2').value + "</td></tr>";
    });
}

//Gets the ID of the desired tag
function getUserInput(storage){
    Tag = document.getElementById("TagDuplicatorTag1").value;
    for (let i = 0; i < storage['values'].length; i++) {
        if(storage['values'][i]['name'] == Tag) {
            getOneTag(storage['values'][i]['id']);
            i = storage['values'].length;
        }
    }
}