//API
var api2 = (function () {
    var apiClient = new $.RestClient("www/api/", {
        ajax: {
            error: function (e) {
                console.log("error");
                console.log(e);
            },
            statusCode: {
                404: function (e) {
                    console.log("404");
                    console.log(e);
                }
            }
        },
        cache: 5000
    });
    apiClient.add("aitwitter", {url: "ai/twitter"});
    apiClient.add("trendingTags", {url: "trending-hashtags"});
    apiClient.add("hashtagsforurl");

    return apiClient;
})();
/**
 * Updates logo tooltip (bootstrap only)
 */
function logoTooltipUpdate () {
    $(document).on('ritetag.infobar.swap', function (event) {
        $(event.target).find('.ritetag-logo.hint').attr('data-original-title', function () {
            var title = $(this).attr('title');
            $(this).removeAttr('title', '');
            return title;
        });
    });
}

/**
 * Sets absolute position of bootstrap dropdown-menu to be right below the dropdown toggle.
 * Useful if relative position cuts off dropdown-menu.
 * setAbsDropdownPosition() can be called every time that dropdown-toggle is clicked so that
 * proper position is maintained in case the containing div is moved or window is resized.
 * 
 * @param dropdown jQuery element like $('.dropdown') that contains dropdown-toggle and dropdown-menu
 */
function setAbsDropdownPosition (dropdown) {
    var pos = dropdown.children().first().offset();
    pos.top += dropdown.children().first().height() + 5;
    pos.top -= $(document).scrollTop();
    pos.position = 'fixed';
    dropdown.children().last().css(pos);
}
/**
 * Creates double column associated tags dropdown
 * Creates an empty child for left-right symmetry
 * every item including '.dropdown-heading' must have same height
 * 
 * @param  menu - '.dropdown-menu' jQuery object
 */
function toggleDoubleColumnDropdown (menu) {
    var children = menu.children();
    if (children.length > 6) {
        menu.addClass('double-column');
        if (children.length%2 !== 0) // if dropdown has odd number of children, add fake child at the end
            menu.append('<li class="emptyChild"></li>');
    } else
        menu.removeClass('double-column');
    return children.length;
}
/**
 * Needs to be used with setAbsDropdownPosition() when the composer is moved or resized.
 * Only hides .ritetag-infobar dropdown
 */
function hideInfobarDropdown () {
    $('.dropdown').each(function () {
    if($(this).hasClass("open"))
        $(this).removeClass("open");
    });
}

//---

function densityToString(density) {
    switch (Number(density)) {
        case 1 : return 'ritetag-overused';
        case 2 : return 'ritetag-poor';
        case 3 : return 'ritetag-good';
        default: return 'ritetag-unused';
    }
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
var composer = '.tweet-box.rich-editor';
var servicename = "Twitter";
var apiid = "twitter";
$(function () {
    if (!$('.ritetag-infobar').attr('data-initialized'))
                RITETAG.infobar.update($(composer));
    $(document).on('ritetag.infobar.initialized', function (event) {
        var infobar = $(event.target);
        jsStyling(infobar);
        removeDataTitle(event);
    });
    $(document).on('ritetag.infobar.swap', removeDataTitle);
    $(document).on('click mouseup keydown keypress keyup input', composer, function (event) {
        $(event.target).siblings('.dropdown-menu.typeahead').css('top', $(event.target).height());
    });

    // Remove placeholder text before adding to composer
    $(document).on('ritetag.composer.will.change', function (event) {
        var c = $(event.target);
        var c_parent = c.parents('form.tweet-form');
        if (c_parent.hasClass('condensed'))
            c.html('<div></div>');
    });
    $(document).on('ritetag.infobar.will.update', function (event) {
        var c = RITETAG.infobar.getComposer($(event.target), composer);
        var c_parent = c.parents('form.tweet-form');
        if (c_parent.hasClass('condensed')) {
            c_parent.addClass('ritetag-condensed').attr('data-ritetag-condensed', c.text());
            c.html('<div></div>');
        }
    });
    $(document).on('ritetag.infobar.trending.show', function (event) {
        var c = RITETAG.infobar.getComposer($(event.target), composer);
        var c_parent = c.parents('form.tweet-form');
        if (c_parent.hasClass('ritetag-condensed')) {
            c_parent.addClass('condensed').removeClass('ritetag-condensed');
            c.html('<div>' + c_parent.attr('data-ritetag-condensed') + '</div>');
            document.activeElement.blur();
            c.blur();
        }
    });
    RITETAG.infobar.bind(composer, {apiid: apiid, updateOnLoad: true});

});
function removeDataTitle(event) {
    $(event.target).find('.ritetag-logo')
            .attr('data-original-title', function () {
                var attr = $(this).attr('title');
                $(this).removeAttr('title');
                return attr;
            });
}

function jsStyling (infobar) {
    infobar.find('.add-remove-hashtag').addClass('btn primary-btn');
    infobar.find('.ritetag-search-button').addClass('btn primary-btn');
    infobar.parents('form').parent().find('.inline-reply-user-image.avatar').css('margin-top', '41px');
    infobar.parents('form').parent().find('.top-timeline-tweet-box-user-image.avatar').css('margin-top', '41px');
    infobar.find('.hint')
        .addClass('js-tooltip')
        .attr('data-original-title', function() {
            var attr = $(this).attr('title');
            $(this).removeAttr('title');
            return attr;
        });
    infobar.parent().find().css('margin-top', 49);
}

