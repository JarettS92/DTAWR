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

    apiCalls();
}

function apiCalls(){
    tenantVersion();
}

function tenantVersion(){
    
}

