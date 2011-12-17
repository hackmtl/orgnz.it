$(function() {
    
    $(window).on('resize', function() {
        var pageBody = $('#page-body'),
            documentWidth = $(document).width(),
            sidebarWidth = $('#page-sidebar').outerWidth();

        $('#page-body').width(documentWidth - sidebarWidth);
        $('#page-body table tr').width(documentWidth - sidebarWidth);
    }).trigger('resize');

});