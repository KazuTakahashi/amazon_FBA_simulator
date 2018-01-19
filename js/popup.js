
$(function(){

    $.ajax('target_page.html', {
        timeout : 1000, // 1000 ms
        datatype:'html'
    }).done(function(data){
        var out_html = $($.parseHTML(data));//parse

        $('#popup').empty().append(out_html.filter('#popup')[0].innerHTML);//insert
        // $('.children').hide();
    
    }).fail(function(jqXHR, textStatus, errorThrown){
        alert('error!!!', textStatus);
    });


    $(document).on("click", ".slide-button", function () {
        $(this).slideToggle();
    });


    var backgroundPage = chrome.extension.getBackgroundPage();

    var product = backgroundPage.getProduct();
    //alert(product);
    console.log("poput:", product);
    $('#product-title').children('h1').text(product.title);

});