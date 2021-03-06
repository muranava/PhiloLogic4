"use strict";

$(document).ready(function() {
    var pathname = window.location.pathname.replace('dispatcher.py/', '');
    var my_path = pathname.replace(/\/\d+.*$/, '/');
    var doc_id = pathname.replace(my_path, '').replace(/(\d+)\/*.*/, '$1');
    var philo_id = doc_id + ' 0 0 0 0 0 0'
    $('#show-header').click(function() {
        if ($('#show-header').text() == "Show Header") {
            $.get(my_path + '/scripts/get_header.py?philo_id=' + philo_id, function(data) {
                $('#tei-header').append(data).show();
                $('#show-header').html("Hide Header");                
            });
        } else {
            $('#tei-header').hide().empty();
            $('#show-header').html("Show Header");
        }
    });
});
