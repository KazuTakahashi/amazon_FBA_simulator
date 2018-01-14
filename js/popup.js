
$(function(){

    $.ajax('target_page.html', {
        timeout : 1000, // 1000 ms
        datatype:'html'
    }).done(function(data){
        var out_html = $($.parseHTML(data));//parse

        $('#popup').empty().append(out_html.filter('#popup')[0].innerHTML);//insert

        // $('#page2').empty().append(out_html.filter('#sub2')[0].innerHTML);//insert

        //var sub_html = out_html.filter(function(index) {
        //    return $(this).attr("id") === "sub";
        //})[0].innerHTML;//extract
        //var sub2_html = out_html.filter(function(index) {
        //    return $(this).attr("id") === "sub2";
        //})[0].innerHTML;//extract
        //$('#page').empty().append(sub_html);//insert
        //$('#page2').empty().append(sub2_html);//insert
    }).fail(function(jqXHR, textStatus, errorThrown){
        alert('error!!!', textStatus);
        // エラーページを表示
    });
    // .then(function(data){

    // },function(jqXHR, textStatus) {
    //     if(textStatus!=="success") {
    //         // var txt = "<p>textStatus:"+ textStatus + "</p>" +
    //         //     "<p>status:"+ jqXHR.status + "</p>" +
    //         //     "<p>responseText : </p><div>" + jqXHR.responseText +
    //         //     "</div>";
    //         // $('#page').html(txt);
    //         // $('#page2').html(txt);
    //     }
    // });
    // $('#page').load('external.html');




    var backgroundPage = chrome.extension.getBackgroundPage();

    var product = backgroundPage.getProduct();
    //alert(product);
    console.log("poput:", product);
    $('#product-title').children('h1').text(product.title);
});