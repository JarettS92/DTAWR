//-----------------------------------------------------
// LISTENERS
//-----------------------------------------------------

// Clicking a filter applies, clicking again removes
$('.tag--interactive').click(function () {
  $(this).toggleClass('selected');
});

// Hide warning banner
$("#csatReminderBanner img").click(function() {
  $("#csatReminderBanner").hide();
});

// Darkmode toggle
// This will add dark mode classes to certain elements
// and change the DOM coloring accordingly
$("#darkmode").click(function() {
  $("body").toggleClass("dark-body");
  $(".island").toggleClass("dark-bg");
  $("dl").toggleClass("dark-bg");
  $("tr").toggleClass("dark-bg");
});

// When an env dropdown is selected, change tag dropdown accordingly
$('.envSelect').change((e) => {
  let mzs = DTEnvs[e.target.value]["MZS"];
  let tags = DTEnvs[e.target.value]["TAGS"];
  let tsm = DTEnvs[e.target.value]["TSM"];
  let tagTarget = e.target.id.replace("environment", "tag");
  let mzTarget = e.target.id.replace("environment", "managementzone");
  let timeseriesTarget = e.target.id.replace("environment", "metric");
  console.log(tagTarget);
  console.log(mzTarget);
  console.log(timeseriesTarget);
  console.log(tsm);
  console.log(tags);
  console.log(mzs);

  $(`#${tagTarget}`).find('option').remove().end();
  $(`#${mzTarget}`).find('option').remove().end();
  $(`#${timeseriesTarget}`).find('option').remove().end();

  if (tags.length != 0) {
    tags.forEach((curVal, index) => {
      if (index == tags.length - 1) {
        $(`#${tagTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        $(`#${tagTarget}`).append(`<option class='none' value="SELECT TAG" selected hidden disabled>SELECT TAG</option>`).val(`SELECT TAG`);
      } else {
        $(`#${tagTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
      }
    });
  } else {
    $(`#${tagTarget}`).append(`<option value="No Auto Tags Found" selected>No Auto Tags Found</option>`).val(`No Auto Tags Found`);
    $(`#${tagTarget}`).append(`<option class='none' value="SELECT TAG" selected hidden disabled>SELECT TAG</option>`).val(`SELECT TAG`);
  }

  if (mzs.length != 0) {
    mzs.forEach((curVal, index) => {
      if (index == mzs.length - 1) {
        $(`#${mzTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        $(`#${mzTarget}`).append(`<option class='none' value="SELECT MANAGEMENT ZONE" selected hidden disabled>SELECT MANAGEMENT ZONE</option>`).val(`SELECT MANAGEMENT ZONE`);
      } else {
        $(`#${mzTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
      }
    });
  } else {
    $(`#${mzTarget}`).append(`<option value="No Management Zones Found" selected>No Management Zones Found</option>`).val(`No Management Zones Found`);
    $(`#${mzTarget}`).append(`<option class='none' value="SELECT MANAGEMENT ZONE" selected hidden disabled>SELECT MANAGEMENT ZONE</option>`).val(`SELECT MANAGEMENT ZONE`);
  }

  if (Object.keys(tsm).length != 0) {
    Object.keys(tsm).forEach((curVal, index) => {
      if (index == Object.keys(tsm).length - 1) {
        $(`#${timeseriesTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        $(`#${timeseriesTarget}`).append(`<option class='none' value="SELECT TIMESERIES METRIC" selected hidden disabled>SELECT TIMESERIES METRIC</option>`).val(`SELECT TIMESERIES METRIC`);
      } else {
        $(`#${timeseriesTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
      }
    });
  } else {
    $(`#${timeseriesTarget}`).append(`<option value="No Management Zones Found" selected>No Management Zones Found</option>`).val(`No Metrics Found!`);
    $(`#${timeseriesTarget}`).append(`<option class='none' value="SELECT TIMESERIES METRIC" selected hidden disabled>SELECT TIMESERIES METRIC</option>`).val(`SELECT TIMESERIES METRIC`);
  }
});

// Updates aggregation dropdowns when a timeseries metric is selected
$('.metricSelect').change((e) => {
  let envTarget = $(`#${e.target.id.replace("metric", "environment")}`).val();
  console.log(envTarget);
  let aggregationTarget = e.target.id.replace("metric","aggregation");
  let aggregationArr = DTEnvs[envTarget].TSM[e.target.value];
  // ["TSM"][e.target.value];
  $(`#${aggregationTarget}`).find('option').remove().end();

  console.log(aggregationTarget);
  console.log(aggregationArr);

  if (aggregationArr.length != 0) {
    aggregationArr.forEach((curVal, index) => {
      if (index == aggregationArr.length - 1) {
        $(`#${aggregationTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
        $(`#${aggregationTarget}`).append(`<option class='none' value="SELECT METRIC AGGREGATION" selected hidden disabled>SELECT METRIC AGGREGATION</option>`).val(`SELECT METRIC AGGREGATION`);
      } else {
        $(`#${aggregationTarget}`).append(`<option value="${curVal}">${curVal}</option>`).val(`${curVal}`);
      }
    });
  } else {
    $(`#${aggregationTarget}`).append(`<option value="No Aggregations Found" selected>No Aggregations Found</option>`).val(`No Metrics Found!`);
    $(`#${aggregationTarget}`).append(`<option class='none' value="SELECT METRIC AGGREGATION" selected hidden disabled>SELECT METRIC AGGREGATION</option>`).val(`SELECT METRIC AGGREGATION`);
  }
});

$('.aggregationSelect').change((e) => {
  let percentileTarget = e.target.id.replace("aggregation", "percentile");
  $(`#${percentileTarget}`).find('option').remove().end();
  console.log(percentileTarget);
  let aggArr = [10,20,30,40,50,60,70,80,90,95];

  if(e.target.value == 'PERCENTILE'){
    $(`#${percentileTarget}`).prop("disabled", false);
    aggArr.forEach((curVal, index) => {
      if (index == aggArr.length - 1) {
        $(`#${percentileTarget}`).append(`<option value="${curVal}">${curVal}th</option>`).val(`${curVal}`);
        $(`#${percentileTarget}`).append(`<option class='none' value="SELECT PERCENTILE" selected hidden disabled>SELECT PERCENTILE</option>`).val(`SELECT PERCENTILE`);
      } else {
        $(`#${percentileTarget}`).append(`<option value="${curVal}">${curVal}th</option>`).val(`${curVal}`);
      }
    });
  } else {
    $(`#${percentileTarget}`).prop("disabled", true);
  }
});

// Radio button logic
// On click, unselect all radio buttons and 
// only select the clicked button
$('.radio').click(function () {
  $('.radio').prop("checked", false);
  $(this).prop("checked", true);
});

// Sidebar click
// Clicking on tool/report in sidebar hides all
// except for selected tool/report
$('.sidebar__item').click(function () {
  $("div[name='sidebar-content']").removeClass("display").addClass("none");
  $(`#${$(this).attr('sidebar-content-id')}`).addClass("display").removeClass("none");
  $(".sidebar__item").removeClass("is-current");
  $(this).addClass("is-current");
  $('.breadcrumbs__last').text($(this).attr('name'));
});

// Mobile menu Dropdown click
// Clicking a tool/report in mobile menu hides all
// except for selected tool/report
$('.expandable__content .nav__link').click(function () {
  $("div[name='sidebar-content']").removeClass("display").addClass("none");
  $(`#${$(this).attr('name')}`).addClass("display").removeClass("none");
  $('.nav__item.expandable').removeClass('is-active');
  $('#nav-bar-mobile').removeClass('is-active');
  $(".sidebar__item").removeClass("is-current");
  $(`a[sidebar-content-id='${$(this).attr('name')}']`).addClass("is-current");
});

// Buttongroup click
// Clicking a button hides all tables except
// the selected table
$('.buttongroup a').click(function () {
  $('.buttongroup a').removeClass('is-active');
  $(this).addClass('is-active');
  $('table').addClass('none');
  $(`#${$(this).attr("name")}`).removeClass("none");
});

//-----------------------------------------------------
// FUNCTIONS
//-----------------------------------------------------

let source = '';

// Function to hide all tools/reports and display the 
// Environment management page
function navToManageEnvironments(currentSource) {
  $("div[name='sidebar-content']").removeClass("display").addClass("none");
  $("#manage-environments").addClass("display").removeClass("none");
  source = currentSource;
}

function closeManageEnvironments() {
  // $("div[name='sidebar-content']").addClass("display").removeClass("none");
  $("#manage-environments").removeClass("display").addClass("none");
  $(`#${$('.sidebar__item.is-current').attr('sidebar-content-id')}`).removeClass("none").addClass("display");
  console.log($('.sidebar__item.is-current').attr('sidebar-content-id'));
}