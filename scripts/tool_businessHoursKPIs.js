// let IllegalWeekDays = []; 
// let IllegalNumbDays = [];
// let businessHoursStart = 0;
// let businessHoursEnd = 0;
// let z = 0;

// //mainfunction for Business Hour KPIs
// function mainBusinessHourKPIs(){
//     let DTenv = getEnvironment(document.getElementById("bhkpi-environment-select").value);
//     businessHoursStart = document.getElementById('bhkpi-business-hour-start').value;
//     businessHoursEnd = document.getElementById('bhkpi-business-hour-end').value;
//     if(!document.getElementById('bhkpi-sunday-checkbox').checked) IllegalWeekDays.push(0);
//     if(!document.getElementById('bhkpi-monday-checkbox').checked) IllegalWeekDays.push(1);
//     if(!document.getElementById('bhkpi-tuesday-checkbox').checked) IllegalWeekDays.push(2);
//     if(!document.getElementById('bhkpi-wednesday-checkbox').checked) IllegalWeekDays.push(3);
//     if(!document.getElementById('bhkpi-thursday-checkbox').checked) IllegalWeekDays.push(4);
//     if(!document.getElementById('bhkpi-friday-checkbox').checked) IllegalWeekDays.push(5);
//     if(!document.getElementById('bhkpi-saturday-checkbox').checked) IllegalWeekDays.push(6);
//     let d = new Date();
//     let m = d.getTimezoneOffset();
//     z = m * 60000 * (-1);
//     let settings = {
//         "async": true,
//         "crossDomain": true,
//         "url": DTenv['URL'] + "/api/v1/timeseries/" + document.getElementById('bhkpi-metric-input').value + "?startTimestamp=" + convertTime(document.getElementById('bhkpi-business-hour-start').value) + "&endTimestamp=" + convertTime(document.getElementById('bhkpi-business-hour-end').value) + "&includeData=true",
//         "method": "GET",
//         "headers": {
//             "Content-Type": "application/json",
//             "Authorization": "Api-Token " + DTenv['TOK']
//         },
//         "processData": false,
//         "data": ""
//     }

//     if(document.getElementById('bhkpi-aggregation-input').value != '') settings['url'] += "&aggregationType=" + document.getElementById('bhkpi-aggregation-input').value;
//     if(document.getElementById('bhkpi-tag-select').value != '') settings['url'] += "&tag=" + document.getElementById('bhkpi-tag-select').value;
//     if(document.getElementById('bhkpi-percentile-input').value != '') settings['url'] += "&percentile=" + document.getElementById('bhkpi-percentile-input').value;
//     $.ajax(settings).done(function (response) {
//         let storage = response['dataResult']['dataPoints'];
//         let storage2 = response;
//         filterOut(storage, storage2);
//     });
// }

// //function filters out undesireable datapoints and generates a single aggregated metric from the remainder
// function filterOut(storage, storage2){
//     let x = Object.keys(storage);
//     let count = 0;
//     let count2 = 0;
//     let sum = 0;
//     let sum2 = 0;
//     for(let i = 0; i < x.length; i ++){
//         let shortcut = storage[x[i]];
//         for(let j = 0; j < shortcut.length; j ++){
//             if(!deleteDataPointWeekDay(shortcut[j][0]) && !deleteDataPointWeekDay(shortcut[j][0]) && !deleteDataPointNumbDay(shortcut[j][0]) && !deleteDataPointEarly(shortcut[j][0]) && !deleteDataPointLate(shortcut[j][0])) {
//                 count ++;
//                 sum += shortcut[j][1];
//                 count2 ++;
//                 sum2 += shortcut[j][1];
//             }
//             else{
//                 count2 ++;
//                 sum2 += shortcut[j][1];
//             }
//         }
//     }
//     //The good stuff
//     document.getElementById('bhkpi-table').style.display = 'block';
//     document.getElementById('bhkpi-tbody').innerHTML += "<tr><td>" + document.getElementById('bhkpi-tag-select').value + "</td><td>" + (sum / count).toFixed(2) + " " + storage2['unit'] + "</td><td>" + document.getElementById('bhkpi-metric-input').value + "</td></tr>";
// }

// //deletes datapoints from days of the week that are not business days
// function deleteDataPointWeekDay(num){
//     let temp = new Date(num + z);
//     if(IllegalWeekDays.includes(temp.getUTCDay())) {
//         //console.log('day violation: ' + temp.getUTCDay());
//         return true;
//     }
//     else return false;
// }

// //deletes datapoints from days of the month that are not business days
// //Not yet implemented
// function deleteDataPointNumbDay(num){
//     let temp = new Date(num + z);
//     if(IllegalNumbDays.includes(temp.getUTCDate())){
//         //console.log('number violation: ' + temp.getUTCDate());
//         return true;
//     }
//     else return false;
// }

// //deletes datapoints before business hours
// function deleteDataPointEarly(num){
//     let temp = new Date(num + z);
//     if(businessHoursStart > temp.getUTCHours()){
//         //console.log('early violation: ' + temp.getUTCHours());
//         return true;
//     }
//     else return false;
// }

// //deletes datapoints after business hours
// function deleteDataPointLate(num){
//     let temp = new Date(num + z);
//     if(businessHoursEnd < temp.getUTCHours()){
//         //console.log('late violation: ' + temp.getUTCHours());
//         return true;
//     }
//     else return false;
// }

// //Forgot what this does
// function convertTime(date){
//     let temp = new Date(date);
//     console.log("Get Time: " + temp.getTime() - z);
//     return temp.getTime() - z;
// }

var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua"];
          autocomplete(document.getElementById("myInput"), countries);

// Autocomplete
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }