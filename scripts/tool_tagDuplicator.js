//main function for Tag Duplicator
function mainTagDuplicator() {
    let select1Bool = ($('#tag-duplicator-environment1-select').val() != undefined && $('#tag-duplicator-environment1-select').val() != '') ? true : false;
    let select2Bool = ($('#tag-duplicator-environment2-select').val() != undefined && $('#tag-duplicator-environment2-select').val() != '') ? true : false;
    let tag1Bool = ($('#tag-duplicator-tag1-select').val() != undefined && $('#tag-duplicator-tag1-select').val() != '') ? true : false;
    let tag2Bool = ($('#tag-duplicator-tag2-input').val() != undefined && $('#tag-duplicator-tag2-input').val() != '') ? true : false;

    if(select1Bool && select2Bool && tag1Bool && tag2Bool){
        //   console.log(document.getElementById("tag-duplicator-environment1-select").value);
        let env = getEnvironment($("#tag-duplicator-environment1-select").val());
        console.log(env);
        let settings = {
            "url": env['URL'] + "/api/config/v1/autoTags",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Api-Token " + env['TOK'],
                "Content-Type": "application/json"
            }
        };
        // let tagList = [];
        $.ajax(settings).done(function (response) {
            getUserInput(response);
            // for (let i = 0; i < response['values'].length; i++) tagList.push(response['values'][i]['name']);
            // console.log(tagList);
            // return tagList;
        });
    } else {
        alert("Missing Information!");
    }
}

//Get a single tag rule, to be duplicated
function getOneTag(id) {
  let env = getEnvironment($("#tag-duplicator-environment1-select").val());
  let settings = {
      "url": env['URL'] + "/api/config/v1/autoTags/" + id,
      "method": "GET",
      "timeout": 0,
      "headers": {
          "Authorization": "Api-Token " + env['TOK'],
          "Content-Type": "application/json"
      }
  };
  $.ajax(settings).done(function (response) {
      postOneTag(response);
  });
}

//Posts a tag rule to an environment
function postOneTag(rule) {
  let env = getEnvironment($("#tag-duplicator-environment2-select").val());
  // console.log(env);
  rule["name"] = $("#tag-duplicator-tag2-input").val();
  delete rule['metadata'];
  delete rule['id'];
  let settings = {
      "url": env['URL'] + "/api/config/v1/autoTags",
      "method": "POST",
      "timeout": 0,
      "headers": {
          "Authorization": "Api-Token " + env['TOK'],
          "Content-Type": "application/json"
      },
      "data": JSON.stringify(rule),
  };
  // console.log(JSON.stringify(rule));
  try {
      $.ajax(settings).done(function (response) {
          $('#tag-duplicator-tbody').append(`
            <tr>
                <td>${$('#tag-duplicator-environment1-select').val()}</td>
                <td>${$('#tag-duplicator-tag1-select').val()}</td>
                <td>${$('#tag-duplicator-environment2-select').val()}</td>
                <td>${$('#tag-duplicator-tag2-input').val()}</td>
            </tr>`);
          alert("SUCCESS!!");
          tagDuplicatorClearInputFields();
          refreshEnvironment()
      });
  } catch(err) {
      console.log(err);
      alert(err);
  }
}

//Gets the ID of the desired tag
function getUserInput(storage){
  Tag = $("#tag-duplicator-tag1-select").val();
  for (let i = 0; i < storage['values'].length; i++) {
      if(storage['values'][i]['name'] == Tag) {
          getOneTag(storage['values'][i]['id']);
          i = storage['values'].length;
      }
  }
}

// Ensure that the environment name being added is unique
// and not already in the list
$('#tag-duplicator-tag2-input').on('input', (e) => {
    let env = getEnvironment($('#tag-duplicator-environment2-select').val());
    let tag = $('#tag-duplicator-tag2-input').val();
    if(env.TAGS.includes(tag)){
        // console.log('Name is not unique');
        $('#tag-duplicator-tag2-input').siblings().addClass('warning').text('New Tag Name: **TAG ALREADY EXISTS!!**')
        $('#tag-duplicator-button').prop('disabled', true).addClass('disabled__button');
        return false;
    } else {
        $('#tag-duplicator-tag2-input').siblings().removeClass('warning').text('New Tag Name:');
        $('#tag-duplicator-button').prop('disabled', false).removeClass('disabled__button');
        // console.log('Name is valid');
        return true;
    }
});

// Clear user inputs
function tagDuplicatorClearInputFields() {
    $('#tag-duplicator-tag2-input').val('');
}