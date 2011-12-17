$(function() {
    
    $(window).on('resize', function() {
        var pageBody = $('#page-body'),
            pageBodyWidth = $(document).width() - $('#page-sidebar').outerWidth(),
            i = 0,
            $th = $('#table thead tr:first th');
            ;

        $('#page-body').width(pageBodyWidth);

        $('#table tbody tr:first td').each(function() {
            $th.eq(i).width( $(this).width() );
            i += 1;
        });
    }).trigger('resize');

    $("#table").bind("DOMSubtreeModified", function() {
        $(window).trigger('resize');
    });

});