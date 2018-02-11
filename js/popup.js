var popup = popup || {};
popup.productInfo = null;
popup.fees = null;


// カンマ付きの価格(文字列)に変換
const formatFromIntToComma = function(str){
    let num = new String(str).replace(/,/g, "");
    while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
    return num;
};
// ￥(全角)+カンマを取り除きIntへ変換
const formatFromCommaToInt = function(str){
    return parseInt(str.replace("￥ ", "").split(',').join('').trim());
};

// 補完手数料の計算
const calculateStorageFee = function(width, height, length, storageDays){
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();// 現在の日付
    let fee = 0;
    while(true) {
        inDays = new Date(year, month, 0).getDate();
        // その月の日数から現在の日付を引いた残りの日数と保管期間
        // もし残りの日数が大きいか同じならその月に収まる、もしマイナスなら次の月へ
        if((inDays - day) >= storageDays) {
            fee += 8.126*(width*height*length/1000)*(storageDays/inDays);
            break;
        } else {
            fee += 8.126*(width*height*length/1000)*((inDays - day)/inDays);
            storageDays = storageDays - (inDays - day);
            month++;
            if(month > 11) {
                month = 0;
                year++;
            }
        }
    }
    return Math.round(fee);
};

const update = function(){

}

// 初期化
const init = function(){
    // 読み込み画面
    let backgroundPage = chrome.extension.getBackgroundPage();

    if(backgroundPage.page.isAmazonProduct) { // Amazon商品ページ
        // popupページの取得
        $.ajax('target_page.html', {
            timeout : 3000, // 3000 ms
            datatype:'html'
        }).done(function(data){
            var out_html = $($.parseHTML(data));//parse
            $('#main').empty().append(out_html.filter('#main')[0].innerHTML);//insert

            let productInfo = backgroundPage.page.productInfo;
            // タイトルの挿入
            //$('#product-title').children('h1').text(productInfo.title);
            // サイズおよび単位の挿入
            let width = formatFromIntToComma(Math.round(productInfo.width*10)/10);
            let height = formatFromIntToComma(Math.round(productInfo.height*10)/10);
            let length = formatFromIntToComma(Math.round(productInfo.length*10)/10);
            // $('#size').children('span').eq(0).text(width);
            // $('#size').children('span').eq(1).text(productInfo.dimensionUnit);
            // $('#size').children('span').eq(2).text(height);
            // $('#size').children('span').eq(3).text(productInfo.dimensionUnit);
            // $('#size').children('span').eq(4).text(length);
            // $('#size').children('span').eq(5).text(productInfo.dimensionUnit);
            // 重さおよび単位の挿入
            let weight = formatFromIntToComma(productInfo.weight);
            // $('#weight').children('span').eq(0).text(weight);
            // $('#weight').children('span').eq(1).text(productInfo.weightUnit);

            // popup.htmlから原価項目を取得し、productInfoにセット
            //productInfo.cost = formatFromCommaToInt($('#cost').find('input').val());
            let costStr = productInfo.cost.toString();

            // カート価格の挿入
            // $('#price').find('input').val(formatFromIntToComma(productInfo.cartPrice));

            // 手数料の挿入
            let referralFee = Math.round(productInfo.cartPrice*productInfo.referralFee);
            $('#referral-fee').children('.num').children('span').text(formatFromIntToComma(referralFee));
            let closingFee = productInfo.closingFee;
            $('#closing-fee').children('.num').children('span').text(formatFromIntToComma(closingFee));
            let totalExhibitantFee = referralFee+closingFee;
            $('#total-exhibitant-fee').children('.num').children('span').text(formatFromIntToComma(totalExhibitantFee));
            
            let pickAndPackFee = productInfo.pickAndPackFee;
            $('#pick-and-pack-fee').children('.num').children('span').text(formatFromIntToComma(pickAndPackFee));
            let weightHandlingFee = productInfo.weightHandlingFee;
            $('#weight-handling-fee').children('.num').children('span').text(formatFromIntToComma(weightHandlingFee));
            //let storageFee = Math.round(productInfo.storageFee);
            //$('#storage-fee').children('.num').children('span').text(formatFromIntToComma(storageFee));
            let storageFee = calculateStorageFee(productInfo.width, productInfo.height, productInfo.length, 30);
            $('#storage-fee').children('.num').children('span').text(formatFromIntToComma(storageFee));
            let totalFbaFee = pickAndPackFee+weightHandlingFee+storageFee;
            $('#total-fba-fee').children('.num').children('span').text(formatFromIntToComma(totalFbaFee));
            let deliveredFee = formatFromCommaToInt($('#delivered-fee').find('input').val());
            
            let totalSalesFee = totalExhibitantFee+totalFbaFee+deliveredFee;
            $('#total-sales-fee').children('.num').children('span').text(formatFromIntToComma(totalSalesFee));

            

        }).fail(function(xhr, status, error){
            $('#main').empty().append("<div id=\"error-title\"><span>Read Error:</span></div><div id=\"error-description\"><span>html file could not be loaded.</span></div>");
        });

    } else {// Amazon商品ページではない

    }
}



//$(function(){


    init();

      


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

    // $('#popup').on('keyup paste', '.format-num', function() {
    //     console.info('keypress');
    // });

    // ホバーツールチップイベント 画面外をクリックすると消える
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
    

//});


var app = angular.module('myApp', []);
app.filter('weight', ['$filter', function($filter) {
  return function(value, weightUnit) {
    // 数値の判定
    if (!angular.isNumber(value)) {
        return value;
    }
    if(weightUnit == 'kg') {
        return $filter('number')(value, 3);
    } else if (weightUnit == 'g') {
        return $filter('number')(value, 0);
    } else {
        console.info("root0",value);
        return value;//
    }
  };
}]).controller('myAppController', function($scope){
    let backgroundPage = chrome.extension.getBackgroundPage();
    $scope.productInfo = backgroundPage.page.productInfo;
    //$scope.productInfo.cost = 2000;
});