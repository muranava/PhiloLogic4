"use strict";

$(document).ready(function() {
    
    ////////////////////////////////////////////////////////////////////////////
    // Important variables /////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    var pathname = window.location.pathname.replace('dispatcher.py/', '');
    var db_url = webConfig['db_url'];
    var q_string = window.location.search.substr(1);
    ////////////////////////////////////////////////////////////////////////////
    
    //////////////////////////////////    
    //// Search Form related code ////
    //////////////////////////////////
    
    // Show search form on click
    $('#show-search-form').click(function() {
        $('#search_elements').css('z-index', 150);
        if ($(this).data('display') == "none") {
            var report = $('#report label.active input').attr('id');
            displayReportOptions(report);
            showMoreOptions();
            $(this).data('display', 'block');
            $('#show-search-form').html('Hide search options');
        } else {
            hideSearchForm();
            $(this).data('display', 'none');
            $('#show-search-form').html('Show search options');
        }
    });
    
    // Handler for clicks on report tabs
    $('#report label').click(function() {
        var report = $(this).find('input').attr('id');
        if ($("#search_elements").css('display') != 'none') {
            displayReportOptions(report);
        } else {
            $("#show-search-form").data('display', 'block');
            displayReportOptions(report);
            showMoreOptions();
            $('#show-search-form').html('Hide search options');
        }
    });
    
    // Close search form when clicking outside it
    $("#search_overlay, #header, #footer").click(function(e) {
        e.stopPropagation();
        $('#show-search-form').data('display', 'none');
        $('#show-search-form').html('Show search options');
        hideSearchForm();
    });
    
    // Set-up autocomplete for words and metadata
    autoCompleteWord(db_url);
    for (var i=0; i < webConfig.metadata.length; i++) {
        var  metadata = $("#" + webConfig.metadata[i]).val();
        var field = webConfig.metadata[i];
        autoCompleteMetadata(metadata, field, db_url);
    }
    
    //  This will prefill the search form with the current query
    var val_list = q_string.split('&');
    for (var i = 0; i < val_list.length; i++) {
        var key_value = val_list[i].split('=');
        var value = decodeURIComponent((key_value[1]+'').replace(/\+/g, '%20'));
        var key = key_value[0]
        if (value) {
            if (key == 'report') {
                $('#report input').removeAttr('checked');
                $('#report label').removeClass('active');
                $('#' + value).prop('checked', true);
                $('#' + value).parent().addClass('active');
            } else if (key == "method") {
                $('#method-buttons input').removeAttr('checked');
                $('#method-buttons label').removeClass('active');
                $('#method-buttons input[name=method][value=' + value + ']').prop('checked', true);
                $('#method-buttons input[name=method][value=' + value + ']').parent().addClass('active');
            } else if (key =='results_per_page') {
                $('#results_per_page input').removeAttr('checked');
                $('#results_per_page label').removeClass('active');
                $('#results_per_page input[name=results_per_page][value=' + value + ']').prop('checked', true);
                $('#results_per_page input[name=results_per_page][value=' + value + ']').parent().addClass('active');
            }
            else if (key == 'year_interval') {
                $('#year_interval input').removeAttr('checked');
                $('#year_interval label').removeClass('active');
                $('#year_interval input[name=year_interval][value=' + value + ']').prop('checked', true);
                $('#year_interval input[name=year_interval][value=' + value + ']').parent().addClass('active');
            } else if (key == "colloc_filter_choice") {
                $('#colloc_filter_choice').removeAttr('checked');
                $('#colloc_filter_choice label').removeClass('active');
                $('#colloc_filter_choice input[name=colloc_filter_choice][value=' + value + ']').prop('checked', true);
                $('#colloc_filter_choice input[name=colloc_filter_choice][value=' + value + ']').parent().addClass('active');
            }
            else if (key == 'field') {
                $('select[name=' + key + ']').val(value);
            }
            else if (key == "q") {
                $('#q').val(value);
                $('#q2').val(value);
            }
            else {
                $('#' + key).val(value);
            }
        }
    }
    
    //  Clear search form
    $("#reset_form").click(function() {
        $('#form_body input').removeAttr('checked');
        $('#form_body .btn').removeClass('active');
        $('#report input:first, #method-buttons input:first, #page_num input:first, #year_interval input:first').prop('checked', true);
        $('#report input:first, #method-buttons input:first, #page_num input:first, #year_interval input:first').parent().addClass('active');
        displayReportOptions($('#report input:first').attr('id'));
    });
    
    //  This is to select the right option when clicking on the input box  
    $("#arg_proxy").focus(function() {
        $("#arg_phrase").val('');
        $('#method-buttons input').removeAttr('checked');
        $('#method-buttons label').removeClass('active');
        $('#method-buttons input[name=method][value=proxy]').prop('checked', true);
        $('#method-buttons input[name=method][value=proxy]').parent().addClass('active');
    });
    $("#arg_phrase").focus(function() {
        $("#arg_proxy").val('');
        $('#method-buttons input').removeAttr('checked');
        $('#method-buttons label').removeClass('active');
        $('#method-buttons input[name=method][value=phrase]').prop('checked', true);
        $('#method-buttons input[name=method][value=phrase]').parent().addClass('active');
    });
    $('#method3').parent().click(function() {
        $("#arg_proxy, #arg_phrase").val('');
    });
    
    metadataRemove();
    
    // Catch Enter keypress when focused on fixed search bar input
    $("#q2").keyup(function(e) {
        e.preventDefault();
        if (e.keyCode == 13) {
            $('#button-search2').trigger('click');
        }
    });
    // Trigger form submit using value from fixed search bar
    $('#button-search2').click(function() {
        $('#q').val($("#q2").val());
        $("#search").trigger('submit');
    });
    
    // Add spinner to indicate that a query is running in the background
    // and close autocomplete
    $('#search').submit(function(e) {
        $('.ui-autocomplete').remove();
        var width = $(window).width() / 2 - 100;
        hideSearchForm();
        $("#waiting").css("margin-left", width).css('margin-top', 130).velocity('fadeIn', {duration: 100});
        $('#waiting').velocity({rotateZ: 3600}, {duration: 10000, easing: "linear"});
        $('#waiting-inner').velocity({rotateZ: -7200}, {duration: 10000, easing: "linear"});
        
        var new_q_string = $(this).serialize();
        // Set a timeout in case the browser hangs: redirect to no hits after 10 seconds
        setTimeout(function() {
            e.preventDefault();
            $("#waiting").velocity('fadeOut');
            var selected_report = $('#report').find('input:checked').attr('id');
            window.location = "?" + new_q_string.replace(/report=[^&]*/, 'report=error') + "&error_report=" + selected_report;
        }, 10000);
    });
    
    // Fixed search bar only in KWIC, concordance and collocation reports //
    if (global_report == "concordance" || global_report == "kwic" || global_report == "collocation") {
        $('#fixed-search').affix({
            offset: {
            top: function() {
                return (this.top = $('#description').offset().top)
                },
            bottom: function() {
                return (this.bottom = $('#footer').outerHeight(true))
              }
            }
        });
        $('#fixed-search').on('affix.bs.affix', function() {
            $(this).addClass('fixed');
            $(this).css({'opacity': 1, "pointer-events": "auto"});
        });
        $('#fixed-search').on('affixed-top.bs.affix', function() {
            $(this).css({'opacity': 0, "pointer-events": "none"});
            setTimeout(function() {
               $(this).removeClass('fixed'); 
            });
        });
        $("#back-to-full-search").click(function() {
            $("body").velocity('scroll', {duration: 800, easing: 'easeOutCirc', offset: 0});
            setTimeout(function() {
                var report = $('#report label.active input').attr('id');
                displayReportOptions(report);
                showMoreOptions();
                $("#show-search-form").data('display', 'block');
                $('#show-search-form').html('Hide search options');
            }, 800);            
        });
        $("#top-of-page").click(function() {
            $("body").velocity('scroll', {duration: 800, easing: 'easeOutCirc', offset: 0});
        });
    }
    
    // Export results handler
    $('#export-buttons button').click(function() {
        if (global_report == 'time_series') {
            var data = sessionStorage[window.location.href];
            var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            $('<a href="data:' + data + '" download="time_series.json">Download JSON file</a>').appendTo('#export-download-link');
            $("#export-download-link").velocity('slideDown');
        } else {
            var script = window.location.href + "&format=" + $(this).data('format');
            $.getJSON(script, function(data) {
                data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
                $('<a href="data:' + data + '" download="' + global_report + '.json">Download JSON file</a>').appendTo('#export-download-link');
                $("#export-download-link").velocity('slideDown');
            });
        }
    });
    
});

// Remove metadata criteria on click
function metadataRemove() {
    $('.remove_metadata').click(function() {
        var href = window.location.href;
        var metadata = $(this).data("metadata");
        var match = href.match("&" + metadata + "=[^&]+");
        href = href.replace(match, "&" + metadata + "=");
        window.location = href;
    });
    if (global_report == "time_series") {
        $('#remove_metadata_date_start, #remove_metadata_date_end').click(function() {
            var href = window.location.href;
            if ($(this).attr('id') == "remove_metadata_date_start") {
                href = href.replace(/(&start_date=)[^&]+/, '$1');
            } else {
                href = href.replace(/(&end_date=)[^&]+/, '$1');
            }
            window.location = href;
        });
    }
}

function autoCompleteWord(db_url) {
    $("#q").autocomplete({
        source: $('#q').data('script'),
        minLength: 2,
        "dataType": "json",
        focus: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            return false;
        },
        select: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            $("#q").val(q);
            return false;
        }
    }).data("ui-autocomplete")._renderItem = function (ul, item) {
        var term = item.label.replace(/^[^<]*/g, '');
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append(term)
            .appendTo(ul);
    };
    $("#q2").autocomplete({
        source: $('#q').data('script'),
        minLength: 2,
        "dataType": "json",
        focus: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            return false;
        },
        select: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            $("#q2").val(q);
            return false;
        }
    }).data("ui-autocomplete")._renderItem = function (ul, item) {
        var term = item.label.replace(/^[^<]*/g, '');
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append(term)
            .appendTo(ul);
    };
}

function autoCompleteMetadata(metadata, field, db_url) {
    $("#" + field).autocomplete({
        source: $("#metadata_fields").data('script') + field,
        minLength: 2,
        timeout: 1000,
        dataType: "json",
        focus: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            q = q.replace(/ CUTHERE /, ' ');
            //$("#" + field).val(q); This is too sensitive, so disabled
            return false;
        },
        select: function( event, ui ) {
            var q = ui.item.label.replace(/<\/?span[^>]*?>/g, '');
            q = q.split('|');
            q[q.length - 1] = q[q.length - 1].replace(/.*CUTHERE /, '');
            q[q.length-1] = '\"' + q[q.length-1].replace(/^\s*/g, '') + '\"'; 
            q = q.join('|').replace(/""/g, '"');
            $("#" + field).val(q);
            return false;
        }
    }).data("ui-autocomplete")._renderItem = function (ul, item) {
        var term = item.label.replace(/.*(?=CUTHERE)CUTHERE /, '');
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append(term)
            .appendTo(ul);
     };
}

//  Function to show or hide search options
function showMoreOptions() {
    if (webConfig.dictionary) {
        $("#report").velocity("slideDown",{duration: 250, 'easing': 'easeIn'});
    }
    $("#search_elements").velocity("slideDown",{duration: 250, 'easing': 'easeIn', complete: function() {
        $("#search_overlay").velocity({opacity: .2, height: $(document).height() - 50}, {display: 'block', duration: 250});
    }});
}

// Display different search parameters based on the type of report used
function displayReportOptions(value) {
    var show_options = []
    $("#results_per_page, #collocation-options, #time_series_num, #date_range, #method, #metadata_fields").hide();
    if (value == 'collocation') {
        $("#collocation-options, #metadata_fields").show();
        $('#metadata_fields').find('tr').has('#date').show();
    }
    if (value == 'kwic' || value == "concordance" || value == "bibliography") {
        $("#results_per_page, #method, #metadata_fields").show();
        $('#metadata_fields').find('tr').has('#date').show();
        $('#start_date, #end_date').val('');
    }
    if (value == 'relevance') {
        $("#results_per_page").show();
    }
    if (value == "time_series") {
        $("#time_series_num, #date_range, #method, #metadata_fields").show();
        $('#metadata_fields').find('tr').has('#date').hide();
        $('#date').val('');
    }
    if (value == "frequencies") {
        $('#search_terms_container, #method, #results_per_page').hide();
        $('#metadata_fields').show();   
    }
}

function hideSearchForm() {
    if (webConfig.dictionary) {
        $("#report").velocity("slideUp",{duration: 250, 'easing': 'easeIn'});
    }
    $("#search_elements").velocity('slideUp', {duration: 250, easing: 'easeOut', complete: function() {
        $("#search_overlay").velocity({opacity: 0}, {display: 'none', duration: 250});
    }});
}


///////////////////////////////////////////////////
////// Functions shared by various reports ////////
///////////////////////////////////////////////////


// Update progress bar in Time Series, Frequencies, and Collocations
function updateProgressBar(percent) {
    var truncated_percent = parseInt(percent.toString().split('.')[0]);
    $('.progress-bar').velocity({'width': truncated_percent + '%'}, { queue: false, complete:function(){$('.progress-bar').text(percent.toString().split('.')[0] + '%');}});
}

// Show more context in concordance and concordance from collocation searches
function fetchMoreContext() {
    var script = $('#philologic_concordance').data('moreContext');
    $.getJSON(script, function(data) {
        for (var i=0; i < data.length; i++) {
            var more = '<div class="more_length" style="display:none;"' + data[i] + '</div>';
            $('.philologic_context').eq(i).append(more);
        }
        moreContext();
        $('.more_context').removeAttr('disabled');
    });
}

function moreContext() {
    $(".more_context").click(function() {
        var context_link = $(this).text();
        var parent_div = $(this).parents().siblings('.philologic_context')
        if ($(this).data('context') == 'short') {
            parent_div.children('.default_length').fadeOut(100, function() {
                parent_div.children('.more_length').fadeIn(100);
            });
            $(this).empty().fadeIn(100).append('Less');
            $(this).data('context', 'long');
        } else {
            parent_div.children('.more_length').fadeOut(100, function() {
                parent_div.children('.default_length').show();
            });
            $(this).empty().fadeIn(100).append('More');
            $(this).data('context', 'short');
        }
    });
}

// Delay function calls in repeated actions:
// used in Time Series to redraw chart after resize
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

// Custom HTML replace function for text objects since jQuery's html is too slow:
// See here: https://groups.google.com/forum/#!msg/jquery-en/RG_dJD8DlSc/R4pDTgtzU4MJ
$.fn.replaceHtml = function( html ) {
    var stack = [];
    return this.each( function(i, el) {
        var oldEl = el;
        var newEl = oldEl.cloneNode(false);
        newEl.innerHTML = html;
        try {
            oldEl.parentNode.replaceChild(newEl, oldEl);   
        } catch(e) {}
        /* Since we just removed the old element from the DOM, return a reference
        to the new element, which can be used to restore variable references. */
        stack.push( newEl );
    }).pushStack( stack );
};