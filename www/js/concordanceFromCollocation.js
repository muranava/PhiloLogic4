$(document).ready(function() {
    
    $('#form_body').hide();
    $('.close_concordance').hide();
    var pathname = window.location.pathname.replace('dispatcher.py/', '');
    var db_url = webConfig['db_url'];
    var q_string = window.location.search.substr(1);

    $('#return_to_colloc').click(function() {
        History.back();
    });
    $('.more_context').hide();
});
