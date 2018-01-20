
$(function(){

    // popupページの取得
    $.ajax('target_page.html', {
        timeout : 1000, // 1000 ms
        datatype:'html'
    }).done(function(data){
        var out_html = $($.parseHTML(data));//parse
        $('#popup').empty().append(out_html.filter('#popup')[0].innerHTML);//insert
    }).fail(function(jqXHR, textStatus, errorThrown){
        alert('error!!!', textStatus);
    });


    // 
    var backgroundPage = chrome.extension.getBackgroundPage();

    $.ajax({
        type: 'GET',
        url: 'https://sellercentral.amazon.co.jp/fba/profitabilitycalculator/productmatches',
        data: {
            searchKey: backgroundPage.getASIN().asin,
            language: 'ja_JP',
            profitcalcToken: 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D'
        },
        dataType: 'json'
    }).done(function(data){
        //alert('success!!');
        console.log("user4:", data.data[0]);
        product = data.data[0];
        $('#product-title').children('h1').text(product.title);

    }).fail(function(data){
        //alert('error!!!');
        console.log("通信エラー");
    });


    // $(document).on("click", ".tooltip-button", function () {
    //     $(this).parents('.tooltip-wrapper').find(".tooltip").stop().fadeToggle(50);
    // });
    // $(document).on('click', function(e) {// 領域外クリックでツールチップをフェイドアウト
    //     // ２．クリックされた場所の判定
    //     if(!$(e.target).closest('.tooltip').length && !$(e.target).closest('.tooltip-button').length){
    //         $(".tooltip").stop().fadeOut(50);
    //     }
    //     // else if($(e.target).closest('.tooltip_button').length){
    //     //     // ３．ポップアップの表示状態の判定
    //     //     if($(e.target).parents('.tooltip-wrapper').find(".tooltip").is(':hidden')){
    //     //         $(e.target).parents('.tooltip-wrapper').find(".tooltip").stop().fadeIn();
    //     //     }else{
    //     //         $(e.target).parents('.tooltip-wrapper').find(".tooltip").stop().fadeOut();
    //     //     }
    //     // }
    // });


    // ホバーツールチップイベント
    $(function(){
        $(document).on({
            'mouseenter':function(e){
                sethover = setTimeout(function(){
                    $(e.target).parents('.tooltip-wrapper').find(".tooltip").stop().fadeIn(50);
                }, 700);
            },
            'mouseleave':function(e){
                $(e.target).parents('.tooltip-wrapper').find(".tooltip").stop().fadeOut(50);
                clearTimeout(sethover);
            }},
            '.tooltip-button'
        );
    })
    

});