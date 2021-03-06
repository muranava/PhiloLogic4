<%include file="header.mako"/>
% if not config.dictionary:
    <%include file="search_form.mako"/>
% else:
    <%include file="dictionary_search_form.mako"/>
% endif
<div class="container-fluid">
    <div id='philologic_response' class="panel panel-default">
        <div style="display: inline-block; padding: 15px 15px 0px 15px; border-right: solid 1px #ccc; border-bottom: solid 1px #ccc;">
            <a href="${config.db_url}/">Return to search form</a>
            <p>
                <a id="return_to_colloc">
                    Return to previous results page
                </a>
            </p>
        </div>
        <div id='initial_report'>
            <div id='description'>
                <%
                 description = concordance['description']
                %>
                <div id="search_arguments">
                    Bibliographic criteria: ${biblio_criteria or "<b>None</b>"}
                </div> 
                Hits <span class="start">${description['start']}</span> - <span class="end">${description['end']}</span>
            </div>
        </div>
        <% occurences = 0 %>
        <div class="row">
            <div id="results_container" class="col-xs-12">
                <ol id='philologic_concordance'>
                    % for pos, i in enumerate(concordance['results']):
                        <li class="philologic_occurrence panel panel-default">
                            <%
                            n = description['start'] + pos
                            occurences += 1
                            %>
                            <div class="citation-container row">
                                <div class="col-xs-12 col-sm-10 col-md-11">
                                   <span class="cite" data-id="${' '.join(str(s) for s in i['philo_id'])}">
                                       ${n}.&nbsp ${i['citation']}
                                   </span>
                                </div>
                                <div class="hidden-xs col-sm-2 col-md-1">
                                   <button class="btn btn-primary more_context pull-right" disabled="disabled" data-context="short">
                                       More
                                   </button>
                                </div>
                            </div>
                            <div class='philologic_context'>
                                <div class="default_length">${i['context']}</div>
                            </div>
                        </li>
                    % endfor
                </ol>
            </div>
         </div>
    </div>
    <div class="more">
        <%include file="results_paging.mako"/>
        <div style='clear:both;'></div>
    </div>
</div>
<script>
var occurences = ${occurences};
</script>
<%include file="footer.mako"/>
