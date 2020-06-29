//-----------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------

// Datepicker tool
var start = moment().subtract(30, 'days') || null;
var end = moment() || null;

//-----------------------------------------------------
// LISTENERS
//-----------------------------------------------------
$('.date__range__picker').on("apply.daterangepicker", function(e, picker) {
  start = new Date(picker.startDate);
  end = new Date(picker.endDate);
});

$('.date__range__picker').daterangepicker({
  startDate: start,
  endDate: end,
  ranges: {
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'Last 90 Days': [moment().subtract(90, 'days'), moment()],
      'Q1 - Jan-Mar': [moment().startOf('year'), moment().startOf('year').add(3,'M')],
      'Q2 - Apr-Jun': [moment().startOf('year').add(3,'M'), moment().startOf('year').add(6,'M')],
      'Q3 - Jul-Sep': [moment().startOf('year').add(6,'M'), moment().startOf('year').add(9,'M')],
      'Q4 - Oct-Dec': [moment().startOf('year').add(9,'M'),moment().startOf('year').add(12,'M')]
  }
}, cb);
cb(start, end);

//-----------------------------------------------------
// FUNCTIONS
//-----------------------------------------------------
function cb(start, end) {
  $('.date__range__picker span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
  // console.log(start.format('YYYYMMDD'), end.format('YYYYMMDD'));
  // start = new Date(start).getTime();
  // end = new Date(end).getTime();
}

