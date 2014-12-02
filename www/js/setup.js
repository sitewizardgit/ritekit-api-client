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
var composer = '.ritetag-richeditor';
var servicename = "Developer";
var apiid = "developer";
$(function () {
    if (!$('.ritetag-infobar').attr('data-initialized'))
        RITETAG.infobar.bind(composer, {apiid: apiid, updateOnLoad: true});

});


