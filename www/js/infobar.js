/*!
 * RiteTag - Infobar
 * Copyright (C) RiteTag, 2014.
 * http://ritetag.com
 * Author: Shashank Bharadwaj
 *
 * Description:     Get simple color coding, detailed stats and associated tags for a given hashtag.
 *                  Works simply with any type of composer (contenteditable div or textarea)
 *
 * Prerequisites:   jquery-1.8.3 or higher      - Essential for all basic functionality - https://github.com/jquery/jquery
 *                  jquery.rest                 - Essential for API calls               - https://github.com/jpillora/jquery.rest
 *                  q promise library           - Async calls                           - https://github.com/kriskowal/q
 *                  twitter-text                - Detecting hashtags in composer        - https://github.com/twitter/twitter-text-js
 *                  bootstrap-dropdown JS+CSS   - For associated hashtags dropdown
 *                  global.js
 *                  
 * Usage:   Insert infobar HTML as a sibling of composer. 
 *          (For any other configuration set RITETAG.infobar.getComposer and RITETAG.infobar.getInfobar)
 *          Call RITETAG.infobar.bind(composerSelector) where composerSelector is a CSS selector
 */

// Template:
// <div class="ritetag-infobar">
//     <div class="ritetag-error"></div>
//     <div class="ritetag-logo"></div>
//     <div class="ritetag-stats"></div>
//     <div class="ritetag-url"></div>
//     <div class="ritetag-trending"></div>
//     <div class="ritetag-search"></div>
// </div>

// Required: jQuery
if (typeof jQuery === 'undefined') throw new Error('RiteTag requires jQuery');

// Optional: Bootstrap tooltip and popover
if (!jQuery.fn.tooltip) jQuery.fn.tooltip = function() {};
if (!jQuery.fn.popover) jQuery.fn.popover = function() {};

if (typeof RITETAG === 'undefined' || RITETAG === null) RITETAG = {};

RITETAG.infobar = function () {

    // STRING BUILDER

    var StringBuilder = StringBuilder || (function() {
        function StringBuilder(string) {
            this.buffer = [];
            this.append(string);
        }

        StringBuilder.prototype.append = function(string) {
            if (string !== null) {
                this.buffer.push(string);
                return this;
            }
        };

        StringBuilder.prototype.toString = function() {
            return this.buffer.join("");
        };

        return StringBuilder;

    })();

    //---

    var TEMPLATE = '<div class="ritetag-logo hint dropdown" data-toggle="tooltip" data-placement="top" title="Start typing to see dynamic stats"><div class="dropdown-toggle" data-toggle="dropdown"><i class="ritetag-logo-icon fa"></i><img src="www/img/icon-36.png" aria-expanded="true"></div><ul class="dropdown-menu" role="menu" aria-labelledby="dLabel"><li><a class="ritetag-launch-trending"><i class="menu-icon fa fa-signal fa-fw"></i> Trending</a></li><li><a class="ritetag-launch-search"><i class="menu-icon fa fa-search fa-fw"></i> Search</a></li><li><a href="https://ritetag.com/extension-modal-success" target="_blank"><i class="menu-icon fa fa-question-circle fa-fw"></i> Help</a></li><li><a href="https://ritetag.com" target="_blank"><i class="menu-icon fa fa-external-link fa-fw"></i> RiteTag.com</a></li><li role="presentation" class="divider"></li><li><a>Legend:</a><div class="ritetag-legend"><span class="ritetag-overused">#overused</span><span class="ritetag-poor">#good</span><span class="ritetag-good">#great</span><span class="ritetag-unused">#unused</span></div></li></ul></div><div class="ritetag-error"><a href="http://ritetag.com/signin/twitter" target="_blank">Sign up </a> or <a href="http://ritetag.com/signin/twitter?login" target="_blank">log in</a> to RiteTag to enable hashtag analytics.</div><div class="ritetag-stats" data-logo-title="Stats and associated hashtags" data-logo-icon="fa-bar-chart"><table><tbody><tr><td><div class="dropdown" data-tag=""><a class="dropdown-toggle ritetag-unused" data-toggle="dropdown"><span></span><span class="caret"></span></a><ul class="dropdown-menu"></ul></div></td><td><div class="detailedStats"><div class="hint" data-toggle="tooltip" data-placement="top" title="Unique tweets per hour"><i class="fa fa-twitter"></i><span class="st_unique"></span></div><div class="hint" data-toggle="tooltip" data-placement="top" title="Retweets per hour"><i class="fa fa-retweet"></i><span class="st_retweets"></span></div><div class="hint" data-toggle="tooltip" data-placement="top" title="Potential hashtag views per hour"><i class="fa fa-eye"></i><span class="st_views"></span></div><div class="hint" data-toggle="tooltip" data-placement="top" title="Tweets with images"><i class="fa fa-picture-o"></i><span class="st_images"></span></div><div class="hint" data-toggle="tooltip" data-placement="top" title="Tweets with links"><i class="fa fa-link"></i><span class="st_links"></span></div><div class="hint" data-toggle="tooltip" data-placement="top" title="Tweets with mentions"><i class="fa fa-user"></i><span class="st_mentions"></span></div></div></td><td><button class="add-remove-hashtag btn-danger" data-tag=""><i class="fa fa-minus-circle"></i></button></td></tr></tbody></table></div><div class="ritetag-url" data-logo-title="Hashtags related to URL" data-logo-icon="fa-link"><i class="fa fa-arrow-circle-o-left trendingLeft disabled"></i><span class="trendingWrapper url-related-tags"></span><i class="fa fa-arrow-circle-o-right trendingRight"></i></div><div class="ritetag-trending" data-logo-title="Trending, high impact Hashtags" data-logo-icon="fa-signal"><i class="fa fa-arrow-circle-o-left trendingLeft disabled"></i><div class="trendingWrapper"></div><i class="fa fa-arrow-circle-o-right trendingRight"></i></div><div class="ritetag-search" data-logo-title="Search for a word or hashtag" data-logo-icon="fa-search"><input class="ritetag-search-input" type="text" placeholder="Type a word or hashtag"><button class="ritetag-search-button"><i class="fa fa-search"></i></button></div>';

    var nonHashtagRegex = /([~!@$%^&*()_\-+='"`{}\[\]\|\\:;'<>,.\/? ])+/g;

    var toDisplay = '';

    var infobarToggle = function(bar) {
        if (bar.siblings('.ritetag-error').is(':visible')) { // Disable other functionality if not logged in
            checkLogin(bar.parents('.ritetag-infobar')); // Check login again.
            return;
        }
        var barClass = bar.attr('class').replace('ritetag-', '');
        if ((barClass !== toDisplay) && barClass !== 'error') // Only display currently selected item. Always display error
            if (barClass != 'trending' || toDisplay != 'url') // Allow trending when URL displays no results
                return;
        bar.siblings(':not(.ritetag-logo)').css('display', 'none');
        bar.css('display', 'flex');
        bar.siblings('.ritetag-logo')
            .attr('title', bar.attr('data-logo-title'))
        .find('.ritetag-logo-icon')
            .removeClass().addClass('ritetag-logo-icon fa ' + bar.attr('data-logo-icon'));
        bar.parents('.ritetag-infobar').trigger('ritetag.infobar.swap');
    };

    //Trending bar
    var targetTagPositions = [0];
    var currentTagPosition = 0;
    //---

    /**
     * Formats a number by removing decimal place and abbreviating.
     * Eg. 1000.1234 => 1k, 1000123.456=> 1M, 1000123456.789 => 1bn
     * @param  number or string representatino of number.
     * @return formated number
     */
    var formatStat = function (val) {
        val = Number(val);
        var abb = "";

        if (val > 1000000000) {
            abb = "bn";
            val =  val/1000000000;
        } else if (val > 1000000) {
            abb = "M";
            val =  val/1000000;
        } else if (val > 1000){
            abb = "k";
            val =  val/1000;
        }

        return Math.round(val) + abb;
    };

    /**
     * Constructs HTML for stats bar dropdown
     * @param  StringBuilder sb
     * @param  Tag JSON t
     */
    var constructDropdowResult = function (sb, t) {
        sb.append('<li data-tag="').append(t.tag || '').append('" class="').append(densityToString(Number(t.color || ''))).append('" style="position:relative;">')
                // .append("<button data-toggle='modal' title='Add to TagBag' data-tag='" + t.tag + "' class='btn btn-mini addtoTagBag'><i class='fa fa-bookmark' style='margin-top:1px'></i></button>")
                // Website & Mobile
                // .append("<a style='float: right;padding: 1px;width: 20px;margin-right: 2px;margin-top: 1px;' class='btn btn-mini' href='/hashtag-stats/" + t.tag + "' target='_blank'><i class='fa fa-bar-chart-o'></i></a>")
                .append(    '<a href="#" class="tag-name"')
                .append(           'data-id="').append(t.tag || '').append('"')
                .append(           'data-tag="').append(t.tag || '').append('"')
                .append(           'data-retweets="').append(t.retweets || '').append('"')
                .append(           'data-potential-views="').append(t.potential_views || '').append('"')
                .append(           'data-images="').append(t.photos || '').append('"')
                .append(           'data-links="').append(t.links || '').append('"')
                .append(           'data-mentions="').append(t.mentions || '').append('"')
                .append(           'data-color="').append(t.color || '').append('"')
                .append(           'data-nid="1" ')
                .append(           'data-density="').append(t.density || '').append('">#')
                .append(t.tag || '')
                .append(    '</a>')
                .append(    '<a class="btn-hashtag-stats" href="https://ritetag.com/hashtag-stats/' + t.tag + '" target="_blank"><i class="fa fa-bar-chart-o"></i></a>')
                .append(    '</li>');
    };

    var displayInfobarHashtag = function (info, stats) {

        var t = info.queryHashtag;
        var results = info.data;
        if (!t)
            return;
        sb = new StringBuilder();
        // Display Hashtag
        stats.find('.dropdown').attr('data-tag', t.tag || '')
                .find('.dropdown-toggle')
                .removeClass('ritetag-unused ritetag-overused ritetag-poor ritetag-good ritetag-unknown')
                .addClass(densityToString(Number(t.color || '')))
                    .children().first().html(t.tag ? ('#' + t.tag)  : '');

        constructDropdowResult(sb, t);
        sb.append('<div class="dropdown-heading"></div>');
        for (var i in results) {
            if (!results[i].tag || results[i].tag === t.tag)
                continue;
            // Display related Hashtags in Dropdown menu
            constructDropdowResult(sb, results[i]);
        }
        stats.find('.dropdown-menu').html(sb.toString());
        // Display Hashtag Stats
        var detailed = stats.find('.detailedStats');
            detailed.find('.st_unique').text(formatStat(t.density));
            detailed.find('.st_retweets').text(formatStat(t.retweets));
            detailed.find('.st_views').text(formatStat(t.potential_views));
            detailed.find('.st_images').text(formatStat(t.photos) + '%');
            detailed.find('.st_links').text(formatStat(t.links) + '%');
            detailed.find('.st_mentions').text(formatStat(t.mentions) + '%');
        stats.find('.add-remove-hashtag').attr('data-tag', t.tag || '');

        if (results.length)
            stats.find('.dropdown-heading').html('<i class="fa fa-arrow-down"></i> is often used with:');
        else
            stats.find('.dropdown-heading').html('<i class="fa fa-chain-broken"></i> little or no activity');

        infobarToggle(stats);
        stats.parents('.ritetag-infobar').trigger('ritetag.infobar.stats.show');
    };
    var bufferedInfobarQuery;
    var bufferDisplayInfobarHashtag = function (query, stats, apiid) {
        if (stats.find('.dropdown').attr('data-tag') === query) {
            infobarToggle(stats);
            return;
        }
        clearTimeout(bufferedInfobarQuery);
        bufferedInfobarQuery = setTimeout(function() {
            api2.aitwitter.read(query, {source: apiid}).done(function(json) {
                displayInfobarHashtag(json, stats);
            });
        }, 500);
    };
    var clearBuffer = function () {clearTimeout(bufferedInfobarQuery);};

    var displayInfobarSearchBox = function (text, search) {
        search.find("input").val(text);

        infobarToggle(search);

        search.parents('.ritetag-infobar').trigger("ritetag.infobar.search.show");
    };
    var displayInfobarTrending = function (json, trending) {

        targetTagPositions = [0];
        currentTagPosition = 0;
        
        
        var sb = new StringBuilder('');
        for (var i = 0; i < json.tags.length; i++) {
            if (i >= 15)
                break;
            var clazz = densityToString(Number(json.tags[i].color));
            sb.append('<span class="taglink ' + clazz + '" data-tag="' + json.tags[i].tag + '">#' + json.tags[i].tag + '</span>');
            $(".taglink[data-tag='" + json.tags[i].tag + "']").removeClass("unknown").addClass(clazz);
        }
        var trendingWrapper = trending.find('.trendingWrapper');
        trendingWrapper.html(sb.toString());

        currentTagPosition = 0;
        infobarToggle(trending);
        trending.attr('data-initialized', 'true');
        trending.parents('.ritetag-infobar').trigger('ritetag.infobar.trending.show');
        trendingWrapper.scrollLeft(0);
        $('.trendingRight').removeClass('disabled');
        $('.trendingLeft').addClass('disabled');

    };
    var constructInfobarURL = function (data, urlBar) {

        var tags = '';
        for (var i in data) {
            if (typeof data[i].tag == 'function') continue;
            var clazz = densityToString(Number(data[i].color || 3));
            tags = tags + '<a class="taglink ' + clazz + '">#' + data[i].tag + '</a>';
        }
        urlBar.find('.url-related-tags').html(tags);

        infobarToggle(urlBar);

        urlBar.parents('.ritetag-infobar').trigger('ritetag.infobar.URL.show');
    };
    var displayInfobarURL = function (URL, urlBar, apiid) {
        api2.hashtagsforurl.read({url: encodeURI(URL), source: apiid}).done(function(json) {
            if (!json.data || json.data.length === 0) {
                // Display trending tags when no URL loads
                api2.trendingTags.read({green: true, onlylatin: true, source: apiid}).done(function(json) {
                    displayInfobarTrending(json, urlBar.siblings('.ritetag-trending'));
                });
                return;
            }
            constructInfobarURL(json.data, urlBar);
        });
    };

    /**
     * Finds absolute start position current selection/caret/cursor.
     * Absolute position calculated from the begining of the contentEditable div.
     */
    var getSelectionPosRecursive = function (content, searchTextNode) {
        if (!content) return {found: false, offset: offset};

        var offset = 0;
        for (var i = 0; i < content.childNodes.length; i++) {
            var textNode = content.childNodes[i];
            // nodeType 3 is text. nodeType 1 is element: <span>, <div>, <a>, etc.
            // Loop until you find the textNode inside the elementNodes.
            if (textNode.nodeType != 3) {
                var result = getSelectionPosRecursive(textNode, searchTextNode);
                if (result.found)
                    return {found: true, offset: offset + result.offset};
            }
            if (searchTextNode == textNode){
                return {found: true, offset: offset};
            } else {
                offset += textNode.textContent.length;
            }
        }
        return {found: false, offset: offset};
    };
    var getSelectionPos = function (composer) {
        if (composer.is('textarea'))
            return composer[0].selectionStart;
        var range;
        try {
            range = window.getSelection().getRangeAt(0);
        } catch (err) { return null; }
        return getSelectionPosRecursive (composer[0], range.startContainer).offset + range.startOffset;
    };
    var getWordAtPosition = function (pos, str) {
        var words = str.split(' ');
        var ind = 0;
        var w = [];
        for (var i = 0; i < words.length; i++) {
            ind += words[i].length; // length of each word            
            if (pos <= ind) {
                w = words[i].match(/[A-Za-z0-9]+/g);
                return w ? w[0] : '';
            }
            ind += 1; // length of space
        }
        return words[words.length - 1];
    };
    /**
     * Gets the type of word that is touching the caret.
     * Word Type: text, mention, hashtag, cashtag, URL or null
     * 
     * @return tuple: {type, word}
     */
    var getWordAtCaret = function (composer) {

        var txt = composer.text();
        if (composer.is('textarea'))
            txt = composer.val();

        // Auto link hashtags, links, cashtags and mentions. Twitter style
        var entities = twttr.txt.extractEntitiesWithIndices(txt, {extractUrlsWithoutProtocol: true});
        txt = twttr.txt.autoLinkEntities(txt, entities, {targetBlank: true});
        var html = $.parseHTML('<div>' + txt + '</div>');
        var caretPos = getSelectionPos(composer);
        var left = caretPos - 1 < 0 ? 0 : caretPos - 1;
        var wordPos = null;
        
        if ($.trim($(html)[0].textContent.substr(caretPos, 1)))      // Word is on the right
            wordPos = caretPos + 1;
        else if ($.trim($(html)[0].textContent.substr(left, 1)))     // Word is on the left
            wordPos = caretPos;

        // Get word type
        if (wordPos !== null) {
            // Loop through childnodes until you reach caret position
            for (var i = 0; i < $(html)[0].childNodes.length; i++) {
                var word = $(html)[0].childNodes[i];

                if (wordPos <= word.textContent.length) {
                    if (word.nodeType === 3) {
                        var textWord = getWordAtPosition(wordPos, word.textContent).trim();
                        if (textWord) {
                            return {'text': textWord};
                        }
                        else
                            break;
                    } else {
                        if ($(word).hasClass('hashtag')) {
                            return {'hashtag': word.textContent.trim()};
                        } else if ($(word).hasClass('username')) {
                            return {'mention': word.textContent.trim()};
                        } else if ($(word).hasClass('cashtag')) {
                            return {'cashtag': word.textContent.trim()};
                        } else { // URL
                            return {'URL': word.textContent.trim()};
                        }
                    }
                }
                wordPos -= word.textContent.length;
            }
        }
        // Could not find word type
        return null;
    };
    /**
     * Updates info bar below composer with stats about selected item.
     */
    var updateinfobar = function (w, infobar, apiid) {

        if (!w) {
        // } else if (w.mention) { // Not yet supported
        // } else if (w.cashtag) { // Not yet supported
        } else if (w.hashtag) {
            var tag = w.hashtag.replace('#', '');
            if (tag.length > 1){
                toDisplay = 'stats';
                bufferDisplayInfobarHashtag(tag, infobar.find('.ritetag-stats'), apiid);
                return;
            }
        } else if (w.URL) {
            toDisplay = 'url';
            displayInfobarURL(w.URL, infobar.find('.ritetag-url'), apiid);
            return;
        } else if (w.text !== undefined) {
            toDisplay = 'search';
            displayInfobarSearchBox(w.text, infobar.find('.ritetag-search'));
            return;
        }
        var trending = infobar.find('.ritetag-trending');
        if (trending.attr('data-initialized') && trending.is(':visible'))
            return;
        toDisplay = 'trending';
        api2.trendingTags.read({green: true, onlylatin: true, source: apiid}).done(function(json) {
            displayInfobarTrending(json, trending);
        });
    };

    var updateComposer = function (composer, text) {
        if (composer.is('textarea'))
            composer.val(text);
        else
            composer.text(text);
    };
    var enableScrolling = function () {

        $(document).on('mouseup', '.trendingRight:not(.disabled)', function() {

            var targetPosition = 0;
            var duration = 500;
            var trendingWrapper = $(this).siblings('.trendingWrapper');

            trendingWrapper.find('.taglink').each(function() {
                if (($(this).position().left + $(this).width() - trendingWrapper.position().left) > (trendingWrapper.scrollLeft() + trendingWrapper.width())) {
                    targetPosition = $(this).position().left - trendingWrapper.position().left - 5;
                    duration = 500;
                    targetTagPositions.push(targetPosition);
                    return false;
                }
                else {
                    targetPosition = 10000;
                    duration = 1200;
                }
            });
            currentTagPosition = currentTagPosition + 1;
            if (targetPosition == 10000) {
                $(this).addClass('disabled');
            }

            $(this).siblings('.trendingLeft').removeClass('disabled');

            trendingWrapper.animate({
                'scrollLeft': targetPosition
            }, duration);

        });

        $(document).on('mouseup', '.trendingLeft:not(.disabled)', function() {

            var trendingWrapper = $(this).siblings('.trendingWrapper');
            trendingWrapper.animate({
                'scrollLeft': targetTagPositions[currentTagPosition - 1]
            });
            currentTagPosition = currentTagPosition - 1;

            $(this).siblings('.trendingRight').removeClass('disabled');
            if (currentTagPosition === 0) {
                $(this).addClass('disabled');
            }

        });
    };

    /**
     * Finds hashtags in a div and returns a list
     */
    var toggleHashtagInComposer = function (composer, hashtag) {

        var toggleHashtags = Q.defer();
        var removed = false;
        var txt = composer.text();
        if (composer.is('textarea'))
            txt = composer.val();

        var entities = twttr.txt.extractEntitiesWithIndices(txt, {extractUrlsWithoutProtocol: true});
        txt = twttr.txt.autoLinkEntities(txt, entities, {targetBlank: true});
        var newComposer = $.parseHTML('<div>' + txt + '</div>');

        $(newComposer).find('.hashtag').each(function () {
            // If it is a match
            if ($(this).text().trim().toLowerCase() === hashtag.toLowerCase()) {
                removed = true;
                $(this).remove();
            }    
        }).promise().done( function(){
            if (removed)
                toggleHashtags.reject($(newComposer).text().trim().replace('  ', ' '));
            else {
                var oldText = $(newComposer).text().trim();
                oldText = oldText.length ? oldText + ' ' : '';
                toggleHashtags.resolve(oldText + hashtag);
            }
        });
        return toggleHashtags.promise;
    };

    var searchQuery = function(event) {
        var search = $(event.target).parents('.ritetag-search');
        var tag = search.find('.ritetag-search-input').val().replace('#', '');
        if (tag.length === 0) return;
        toDisplay = 'stats';
        var infobar = search.parents('.ritetag-infobar');
        api2.aitwitter.read(tag, {source: apiid}).done(function(json) {
            displayInfobarHashtag(json, infobar.children('.ritetag-stats'));
        });
    };
    var initHashtagSearchBar = function (apiid) {
        // Search Button
        $(document).on('mouseup click', '.ritetag-search .ritetag-search-button', function(event) {
            event.preventDefault();
            searchQuery(event);
        });
        // Pressing enter in input field
        $(document).on('keydown keypress keyup', '.ritetag-search .ritetag-search-input', function(event) {
            var key = event.keyCode;
            if (key == 13) {
                event.preventDefault();
                searchQuery(event);
            }
            // Don't allow special characters which cannot be in a hashtag
            key = String.fromCharCode(key);
            if(nonHashtagRegex.test(key)) {
                event.returnValue = false;
                event.preventDefault();
            }
        });  
    };

    var initTrendingTagBar = function(getComposer, composerSelector) {
        $(document).on('ritetag.infobar.trending.show', function (event) {
            var infobar = $(event.target);
            var composer = getComposer(infobar, composerSelector);

            infobar.find('.taglink').each(function(i, v) {
                toggleHashtagInComposer(composer, $(v).text().trim())
                    .then(null, function (hashtagExists) {
                        $(v).addClass('selected');
                    });
            });
        });
        // Select/Deselect trending tags on click
        $(document).on('mouseup', '.taglink', function (event) {
            var composer = getComposer($(this).parents('.ritetag-infobar'), composerSelector);
            composer.trigger('ritetag.composer.will.change');
            var hashtag = $(this).text().trim();
            toggleHashtagInComposer(composer, hashtag)
                .then(function (added) {
                    updateComposer(composer, added);
                    $(event.target).addClass('selected');
                    composer.trigger('ritetag.composer.changed', [hashtag.replace('#', '')]);
                }, function (removed) {
                    updateComposer(composer, removed);
                    $(event.target).removeClass('selected');
                    composer.trigger('ritetag.composer.changed');
                });
            composer.focus();
        });
        enableScrolling();
    };

    /**
     * Enables add/remove hashtag to composer by clicking +/- button.
     * Updates button when new hashtags stats are loaded.
     *
     * @param  composerSelector - CSS style selector. Eg: '.composer', '#composer'
     * @param  getComposer - function to get composer from infobar and composerSelector
     */
    var initAddRemoveHashtagBtn = function(getComposer, composerSelector) {
        // Correctly display +/- button when new stats shown
        $(document).on('ritetag.infobar.stats.show ritetag.infobar.stats.swap', function(event) {
            var infobar = $(event.target);
            var btn = infobar.find('.add-remove-hashtag');
            var composer = getComposer(infobar, composerSelector);
            var hashtag = '#' + btn.attr('data-tag');

            toggleHashtagInComposer(composer, hashtag)
                .then(function (result) {
                    btn.find('i').removeClass('fa-minus-circle').addClass('fa-plus-circle');
                    btn.removeClass('btn-danger').addClass('btn-success');
                }, function (result) {
                    btn.find('i').removeClass('fa-plus-circle').addClass('fa-minus-circle');
                    btn.removeClass('btn-success').addClass('btn-danger');
                });

            composer.focus();
        });
        // Toggle +/- button when clicked and add/remove hashtag to composer
        $(document).on('click mouseup', '.add-remove-hashtag', function (event) {
            event.preventDefault();
            var btn = $(this);
            var infobar = btn.parents('.ritetag-infobar');
            var composer = getComposer(infobar, composerSelector);
            composer.trigger('ritetag.composer.will.change');
            var hashtag = '#' + btn.attr('data-tag');

            toggleHashtagInComposer(composer, hashtag)
                .then(function (result) {
                    updateComposer(composer, result);
                    btn.find('i').removeClass('fa-plus-circle').addClass('fa-minus-circle');
                    btn.removeClass('btn-success').addClass('btn-danger');
                    composer.trigger('ritetag.composer.changed');
                }, function (result) {
                    updateComposer(composer, result);
                    btn.find('i').removeClass('fa-minus-circle').addClass('fa-plus-circle');
                    btn.removeClass('btn-danger').addClass('btn-success');
                    composer.trigger('ritetag.composer.changed');
                });

            composer.focus();
        });
    };

    /**
     * Clicking dropdown hashtag shows stats for that hashtag.
     * Dropdown label is replaces with new tag.
     * +/- button adds/removes new tag to composer.
     */
    var initHashtagDropdownSwapping =  function () {
        $(document).on('mouseup click', '.ritetag-infobar .dropdown-menu a.tag-name', function(event) {
            event.preventDefault();
            var infobar = $(this).parents('.ritetag-infobar');

            infobar.find('.ritetag-stats .dropdown-toggle').children().first().html($(this).text());
            infobar.find('.ritetag-stats .dropdown-toggle').removeClass('ritetag-unused ritetag-overused ritetag-poor ritetag-good ritetag-unknown');
            infobar.find('.ritetag-stats .dropdown-toggle').addClass(densityToString(Number($(this).data('color') || '')));
            infobar.find('.st_unique').text(' ' + formatStat($(this).data('density')));
            infobar.find('.st_retweets').text(' ' + formatStat($(this).data('retweets')));
            infobar.find('.st_views').text(' ' + formatStat($(this).data('potential-views')));
            infobar.find('.st_images').text(' ' + formatStat($(this).data('images')) + '%');
            infobar.find('.st_links').text(' ' + formatStat($(this).data('links')) + '%');
            infobar.find('.st_mentions').text(' ' + formatStat($(this).data('mentions')) + '%');
            infobar.find('.add-remove-hashtag').attr('data-tag', $(this).text().replace('#', ''));

            infobar.trigger('ritetag.infobar.stats.swap');
        });
    };
    var initInfobarSwap = function (apiid) {
        $(document).on('mouseup click', '.ritetag-launch-trending', function (event) {
            updateinfobar(null     , $(this).parents('.ritetag-infobar'), apiid);
        });
        $(document).on('mouseup click', '.ritetag-launch-search', function (event) {
            updateinfobar({text:''}, $(this).parents('.ritetag-infobar'), apiid);
        });
    };
    var checkLogin = function (infobar) {
        api2.aitwitter.read('hashtag', {source: apiid}).done(function(json) {
            // Login successful
        }).fail(function(json, status, err) {
            var obj = jQuery.parseJSON(json.responseText);
            if (obj.code == 401 || obj.code == 403)
                infobarToggle(infobar.find('.ritetag-error'));
        });
    };
    var bindComposerChangeToInfobar = function (composerSelector, initAndUpdate, getInfobar) {
        $(document).on('mouseup keydown keypress keyup input', composerSelector, initAndUpdate);
        $(document).on('ritetag.composer.changed', function (event, hashtag) {
            if (!hashtag) return;
            toDisplay = 'stats';
            var infobar = getInfobar($(event.target));
            var stats = infobar.find('.ritetag-stats');
            if (stats.find('.dropdown').attr('data-tag') === hashtag) {
                infobarToggle(stats);
                return;
            }
            api2.aitwitter.read(hashtag, {source: apiid}).done(function(json) {
                displayInfobarHashtag(json, stats);
            });
        });
    };
    return {

        /**
         * Getters for infobar and composer. Get one when the other is known.
         * Both must be jQuery objects and must be siblings (under same parent).
         * Replace functions for custom DOM structure.
         *
         * @param  infobar - jQuery object. Eg: $(selector)
         * @param  composer - jQuery object. Eg: $(selector)
         * @param  composerSelector - CSS style selector. Eg: '.composer', '#composer'
         */
        getComposer : function (infobar, composerSelector) { return infobar.siblings(composerSelector); },
        getInfobar : function (composer) { return composer.siblings('.ritetag-infobar'); },

        /**
         * Binds every composer (with selector composerSelector) to its infobar.
         * Listens for keypress and mouse events and updates infobar.
         *
         * @required Composer and infobar must be under same parent.
         *           Replace functions for custom placement.
         * 
         * @param  composerSelector, apiid
         * @param {bool} updateOnLoad - Set false or ignore parameter for minimalist infobar.
         *                              Will be left blank on load if CSS class .ritetag-infobar has display:none.
         *                              It will only get initialized once user clicks on input.
         *                              Useful when multiple composers are present like Facebook.
         */
        bind : function (composerSelector, options) {

            if (!options) options = {apiid: '', updateOnLoad: true};

            // Pass into jquery events.
            var getInfobar = this.getInfobar;
            var initAndUpdate = function(event) {
                var infobar = getInfobar($(this));
                if (!infobar.length)
                    throw new Error('RiteTag infobar not found. Composer or getInfobar() may not be correct.');
                if (!infobar.attr('data-initialized')) {
                    checkLogin(infobar);
                    infobar.attr('data-initialized', 'true');
                    infobar.html(TEMPLATE);
                    infobar.find('.ritetag-logo').find('img').attr('src', 'www/img/icon-36.png');
                    if (!jQuery.fn.tooltip) jQuery.fn.tooltip = function() {};
                    $('.hint').tooltip();
                    infobar.trigger('ritetag.infobar.initialized');
                }
                infobar.trigger('ritetag.infobar.will.update');
                updateinfobar(getWordAtCaret($(this)), infobar, options.apiid);
            };

            // Setup update external function
            this.update = function(composer) {
                // Pass into jquery events.
                composer = composer || $(composerSelector);
                composer.each(initAndUpdate);   
            };
            // Initialize infobar trending, stats, and click-to-add functionality
            if (!this.init) {
                // Initialize once per HTML window
                initHashtagSearchBar(options.apiid, composerSelector);
                initHashtagDropdownSwapping();
                initInfobarSwap(options.apiid);
                this.init = true;
            }
            initTrendingTagBar(this.getComposer, composerSelector);
            initAddRemoveHashtagBtn(this.getComposer, composerSelector);

            // Update infobar when composer changes
            bindComposerChangeToInfobar(composerSelector, initAndUpdate, getInfobar);

            // Load trending tags in the beginning
            if (options.updateOnLoad)
                $(composerSelector).each(initAndUpdate);

            console.log('Ritetag infobar initialized.');
        },
        /**
         * Update infobar. Can be called to display trending bar before any user input.
         * Useful for dynamically added infobars.
         *
         * @param  composerSelector, apiid
         */
        update: function() {},
    };
}();
