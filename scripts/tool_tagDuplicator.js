//main function for Tag Duplicator
function mainTagDuplicator() {
  console.log(document.getElementById("tag-duplicator-environment1-select").value);
  let DTenv = getEnvironment(document.getElementById("tag-duplicator-environment1-select").value);
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
  let DTenv = getEnvironment(document.getElementById("tag-duplicator-environment1-select").value);
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
  let DTenv = getEnvironment(document.getElementById("tag-duplicator-environment2-select").value);
  // console.log(DTenv);
  rule["name"] = document.getElementById("tag-duplicator-tag2-input").value;
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
  // console.log(JSON.stringify(rule));
  try {
      $.ajax(settings).done(function (response) {
          document.getElementById('tag-duplicator-tbody').innerHTML += "<tr><td>" + document.getElementById('tag-duplicator-environment1-select').value + "</td><td>" + document.getElementById('tag-duplicator-tag1-select').value + "</td><td>" + document.getElementById('tag-duplicator-environment2-select').value + "</td><td>" + document.getElementById('tag-duplicator-tag2-input').value + "</td></tr>";
          alert("SUCCESS!!");
      });
  } catch(err) {
      console.log(err);
  }
}

//Gets the ID of the desired tag
function getUserInput(storage){
  Tag = document.getElementById("tag-duplicator-tag1-select").value;
  for (let i = 0; i < storage['values'].length; i++) {
      if(storage['values'][i]['name'] == Tag) {
          getOneTag(storage['values'][i]['id']);
          i = storage['values'].length;
      }
  }
}