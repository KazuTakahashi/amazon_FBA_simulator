
// カンマ付きの価格(文字列)に変換
const formatFromIntToComma = function(str){
    let num = new String(str).replace(/,/g, "");
    while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
    return num;
};


$(function(){
    // 読み込み画面

    // AmazonAPIから商品データを取得
    let backgroundPage = chrome.extension.getBackgroundPage();
    let asin = backgroundPage.page.asin;
    if(asin == null) { // Amazon商品ページではない

    } else {// Amazon商品ページ
        $.ajax({
            type: 'GET',
            url: 'https://sellercentral.amazon.co.jp/fba/profitabilitycalculator/productmatches',
            data: {
                searchKey: asin,
                language: 'ja_JP',
                profitcalcToken: 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D'
            },
            dataType: 'json'
        }).done(function(data){
            console.log("user4:", data);
            product = data.data[0];

            // popupページの取得
            //$.ajax('target_page.html', {
            $.ajax('target_page.html', {
                timeout : 3000, // 3000 ms
                datatype:'html'
            }).done(function(data){
                var out_html = $($.parseHTML(data));//parse
                $('#main').empty().append(out_html.filter('#main')[0].innerHTML);//insert

                $('#product-title').children('h1').text(product.title);
                //alert(backgroundPage.page.cartPrice);
                $('#price').find('input').val(formatFromIntToComma(backgroundPage.page.cartPrice));


                // テスト
                $.ajax({
                    type: 'POST',
                    url: 'https://sellercentral-japan.amazon.com/fba/profitabilitycalculator/getafnfee?profitcalcToken=Z1UgBc1j2F027uhQmFIy9O4KzVy34j3D',
                    //mimeType: "application/json",
                    contentType: 'application/json;charset=UTF-8',
                    //processData: false,
                    data: JSON.stringify({// Jqueryがシリアライズするため、JSON文字列に変換する
                        afnPriceStr: '3000',
                        currency: 'JPY',
                        futureFeeDate: '2015-10-23 00:00:00',
                        hasFutureFee: false,
                        hasTaxPage: true,
                        marketPlaceId: 'A1VC38T7YXB528',
                        mfnPriceStr: '2890',
                        mfnShippingPriceStr: '200',
                        productInfoMapping: product
                    }),
                    dataType: 'json'
                }).done(function(data){
                    console.log("user5:", data);

                }).fail(function(data){
                    console.log("通信エラー");
                });




            }).fail(function(xhr, status, error){
                $('#main').empty().append("<div id=\"error-title\"><span>Read Error:</span></div><div id=\"error-description\"><span>html file could not be loaded.</span></div>");
            });

        }).fail(function(data){
            console.log("通信エラー");
        });
    }






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