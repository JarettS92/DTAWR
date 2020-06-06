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
  let tagTarget = e.target.id.replace("environment", "tag");
  let mzTarget = e.target.id.replace("environment", "managementzone");
  console.log(tagTarget);
  console.log(mzTarget);
  console.log(tags);
  console.log(mzs);
  $(`#${tagTarget}`).find('option').remove().end();
  $(`#${mzTarget}`).find('option').remove().end();
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

$('.nav__btn').click(function () {
  console.log($(this).attr('data-target'));
  $($(this).attr('data-target')).toggleClass('is-active');
});


// Function to hide all tools/reports and display the 
// Environment management page
function navToAddEnv() {
  $("div[name='sidebar-content']").removeClass("display").addClass("none");
  $("#add-env").addClass("display").removeClass("none");
}

//-----------------------------------------------------
// FUNCTIONS
//-----------------------------------------------------

// Function to hide all tools/reports and display the 
// Environment management page
function navToManageEnvironments() {
  $("div[name='sidebar-content']").removeClass("display").addClass("none");
  $("#manage-environments").addClass("display").removeClass("none");
}