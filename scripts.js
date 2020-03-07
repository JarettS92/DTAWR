var tenantURL = 'https://xps96858.sprint.dynatracelabs.com/api/';

window.onload = function() {
    
    
    $('.nav__item').hover(
        function(){$(this).addClass('is-current')},
        function(){$(this).removeClass('is-current')}
    );

    $("#darkmode").click(function() {
        $("body").toggleClass("dark-body");
        $(".island").toggleClass("dark-bg");
        $("dl").toggleClass("dark-bg");
        $("tr").toggleClass("dark-bg");
    });

    $('th').click(function(){
        if($(this).text() != "Details"){
            sortTable($(this).parent().parent().parent().attr('id'), $(this).index());
        }
    });

}

function sortTable(tableID, column){
    alert(`${tableID}-${column}`);
}