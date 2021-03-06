"use strict";

$(document).ready(function() {
    if (webConfig.dictionary == false) { // default
        $('#author-range-selectors td, #title-range-selectors td, #year-range-selectors td').click(function() {
            var range = $(this).data('range');
            var type = $(this).parents('table').data('type');
            var script = $('#landingGroup').data('script') + type + "&range=" + range;
            var contentId = type + '-' + range;
            var contentDiv = '<div id="' + contentId + '"></div>';
            var available_links = [];
            $('#landing-page-content').find('div:visible')
                                      .velocity('transition.slideRightOut',
                                                {duration: 200,
                                                 begin: function() { $("#footer").hide(); },
                                                 complete:function() { $(this).css('opacity', 1); }
                                                }
                                       );
                
            if ($('#' + contentId).length == 0) {
                $('#landing-page-content').append(contentDiv);
                var contentArea = $('#' + contentId);
                $.getJSON(script, function(data) {
                    var html = '';
                    var title;
                    for (var i=0; i < data.length; i++) {
                        if (type == "author" || type == "title") {
                            var prefix = data[i][type].slice(0,1).toLowerCase();
                        } else {
                            prefix = data[i].year;
                        }
                        if (i == 0) {
                            html += '<ul class="row" style="margin-bottom: 20px;">';
                            html += '<h4 id="' + prefix + '">' + prefix.toUpperCase() + '</h4>';
                            title = prefix;
                            available_links.push(title);
                        }
                        if (prefix != title) {
                            html += '</ul><ul class="row" style="margin-bottom: 20px;"><h4 id="' + prefix + '">' + prefix.toUpperCase() + '</h4>';
                            title = prefix;
                            available_links.push(title);
                        }
                        if (type == "author") {
                            var content = '<li class="col-xs-12 col-sm-6">';
                            content += data[i].cite + "</li>";
                        } else if (type == "title" || type == "year") {
                            var content = '<li class="col-xs-12">'
                            content += data[i].cite + "</li>";
                        }
                        html += content;
                    }
                    html += '</ul>';
                    contentArea.html(html).promise().done(function() {
                        var contentElements = contentArea.find('ul');
                        contentArea.show();
                        $('#landing-page-content').show();
                        contentElements.velocity('transition.slideLeftIn', {duration: 400, stagger: 20, complete:function() { $("#footer").velocity('fadeIn'); }});
                    });
                });
            } else {
                var contentArea = $('#' + contentId);
                var contentElements = contentArea.find('ul');
                contentArea.show();
                $('#landing-page-content').show();
                contentElements.velocity('transition.slideLeftIn', {duration: 400, stagger: 20, complete:function() { $("#footer").velocity('fadeIn'); }});
            }
        });
    } else {
        var script = $('#dico-landing-volume').data('script');
        var list = $('#dico-landing-volume ul');
        $.getJSON(script, function(data) {
            for (var i=0; i < data.length; i++) {
                var li = '<li class="list-group-item" style="display: none;"><a href="dispatcher.py/' + data[i].philo_id[0] + '">' + data[i].title + '</a></li>';
                list.append(li);
            }
            list.find('li').velocity('transition.fadeIn', {duration: 400, stagger: 20});
        });
        $('#dico-landing-alpha td').on('click touchstart', function() {
            var script = $('#dico-landing-alpha').data('script') + '^' + $(this).text() + '.*';
            window.location = script;
        });
    }
    
});