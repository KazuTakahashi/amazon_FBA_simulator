// 外部読み込み用変数・関数(const,let宣言はchrome.extension.getBackgroundPage()から読み込めないので注意)
var page = page || {};// 名前空間page
page.isAmazonProduct = false;// amazon商品ページならture
page.isTest = true;//

var test = test || {};// 名前空間page
test.asin = "4798149810";// テスト用asin
test.cartPrice = 570;// テスト用カート価格

// ポップアップ表示用データ
var productInfo = productInfo || {};
productInfo.asin = "";
productInfo.title = "";
productInfo.cost = 400;
productInfo.cartPrice = 0;
productInfo.dimensionUnit = "";
productInfo.width = 0.0;
productInfo.height = 0.0;
productInfo.length = 0.0;
productInfo.weightUnit = "";
productInfo.weight = 0.0;
productInfo.currency = 'JPY'; //
productInfo.referralFee = 0; //
productInfo.referralFeeRatio = 0.0; //%
productInfo.fixedClosingFee = 0; //
productInfo.variableClosingFee = 0; //
productInfo.pickAndPackFee = 0; //
productInfo.weightHandlingFee = 0; //
productInfo.storageFee = 0; //
productInfo.deliveredFee = 150; //
productInfo.totalSalesFee = 0; //
productInfo.totalCost = 0; //
productInfo.profit = 0; //
productInfo.profitMargin = 0.0; //
productInfo.roi = 0.0; //
productInfo.state = 1000;// no data: 1000, processing: 1001, compleate: 1100, error: 2000

// 設定用データ
var config = config || {};
config.language = 'ja_JP';
config.profitcalcToken = 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D';
config.marketPlaceId = 'A1VC38T7YXB528';
config.isProMerchant = false;
config.storagePeriod = 30;

// API 'productmatches'用データ
var productmatches = productmatches || {};
productmatches.url = 'https://sellercentral.amazon.co.jp/fba/profitabilitycalculator/productmatches';
productmatches.data = productmatches.data || {};
productmatches.data.searchKey = '';// asin
productmatches.data.language = config.language;
productmatches.data.profitcalcToken = config.profitcalcToken;

// API 'getafnfee'用データ
var getafnfee = getafnfee || {};
getafnfee.url = 'https://sellercentral-japan.amazon.com/fba/profitabilitycalculator/getafnfee'
getafnfee.profitcalcToken = 'Z1UgBc1j2F027uhQmFIy9O4KzVy34j3D';//
getafnfee.data = getafnfee.data || {};
getafnfee.data.afnPriceStr = '1000';// 基準価格
getafnfee.data.mfnPriceStr = '1000';// 使用しない
getafnfee.data.mfnShippingPriceStr = '100';// 使用しない
getafnfee.data.currency = productInfo.currency;
getafnfee.data.marketPlaceId = config.marketPlaceId;
getafnfee.data.futureFeeDate = '2015-10-23 00:00:00';
getafnfee.data.hasFutureFee = false;
getafnfee.data.hasTaxPage = true;
getafnfee.data.productInfoMapping = null;

// content_scripts連携用
// var ContentScripts = function() {
//     if(!(this instanceof ContentScripts)) {
//         return new ContentScripts();
//     }
//     this.commands = {
//         getCartPrice: {
//             sendData: {},
//             recieveData: {},
//             state: 1000,
//             isValid: true
//         },
//         getAsin: {
//             sendData: {},
//             recieveData: {},
//             state: 1000,
//             isValid: true
//         }
//     };
// }
// ContentScripts.prototype.send = function(tab) {
//     chrome.tabs.sendMessage(
//         tab.id,
//         this.cartPrice,
//         function(msg) {
//             console.log("background.js 18:", "result message:", msg);
//     });
// }
// ContentScripts.prototype.recieve = function(value) {

// }
// var contentScripts = new ContentScripts();


// contentScripts = contentScripts || {};
// contentScripts.command = '';
// contentScripts.state = 1000;
// contentScripts.data = null;


// 現在のアクティブタグでAMAZON商品ページならASINをcontent_scripts(content.js)から取得するため、
// イベントの通知をsendMessageをcontent.jsへ送る
// ページがAMAZON商品ページ以外はcommonページを取得
const sendToContent = function(command, focusedTab){
    console.log("background.js 113:");
    chrome.tabs.sendMessage(
        focusedTab.id,
        { command: command },
        //ContentScriptsObj,
        function(msg) {
            console.log("background.js 18:", "result message:", msg);
    });
};

// AMAZON商品ページのURLからASINを取得
// ※デバッグ用にブラウザーアクションのポップアップも除外
// 戻り値：ASIN、AMAZON商品ページ以外ならnullを返す
const getASINFromAmazonURL = function(url){
    let asin = null;
    if(url == null) return null;

    // Amazonページの判定
    let pattern = new RegExp( '^https?://(?:[^.]+\.)?(?:images-)?amazon\\.(?:com|ca|co\.uk|de|co\\.jp|jp|fr|cn)(/.+)$' );
    let result = url.match( pattern );
    if(!result) {
        console.log("amazonページではない");
        return null;
    }
    
    // Amazon商品ページの判定
    pattern = new RegExp( '(?:/asin/|%2fasin%2f|&asins?=|%26asins?%3d|=asin/|%3dasin%2f|&a=|%26a%3d|/dp/|%2fdp%2f|/dp/accessories/|%2fdp%2faccessories%2f|/dp/artist-redirect/|%2fdp%2fartist-redirect%2f|/dp/product-details/|%2fdp%2fproduct-details%2f|/dp/samples/|%2fdp%2fsamples%2f|/exec/obidos/isbn/| %2fexec%2fobidos%2fisbn%2f|/gp/offer-listing/|%2fgp%2foffer-listing%2f|/gp/product/| %2fgp%2fproduct%2f|/gp/product/images/|%2fgp%2fproduct%2fimages%2f/gp/product/product-description/| %2fgp%2fproduct%2fproduct-description%2f|/gp/product/toc/|%2fgp%2fproduct%2ftoc%2f|/images/p/| %2fimages%2fp%2f|/product-reviews/|%2fproduct-reviews%2f|/sim/|%2fsim%2f)([0-9A-Z]{10})(?:/|\\?|\\&|\\.|%|$)' );

    result = url.match( pattern );
    if(result) {
        asin = result[1];
    }else{
        console.log("商品ページではない");
        return null;
    }
    return asin;
};

const getProductInfoFromAmazonAPI = function(productmatches, getafnfee, productInfo){
    $.ajax({
        type: 'GET',
        url: productmatches.url,
        data: productmatches.data,
        dataType: 'json'
    }).done(function(data){
        console.log("user4:", data);
        // asin:
        // binding:
        // dimensionUnit:
        // dimensionUnitString:
        // encryptedMarketplaceId:
        // gl:
        // height:
        // imageUrl:
        // isAsinLimits:
        // isWhiteGloveRequired:
        // length:
        // link:
        // originalUrl:
        // productGroup:
        // subCategory:
        // thumbStringUrl:
        // title:
        // weight:
        // weightUnit:
        // weightUnitString:
        // width:
        if(data.succeed != "true") {
            productInfo.state = 2000;// エラー状態
            return;
        }
        productInfo.asin = data.data[0].asin;
        productInfo.title = data.data[0].title;
        productInfo.dimensionUnit = data.data[0].dimensionUnit;
        productInfo.width = data.data[0].width;
        productInfo.height = data.data[0].height;
        productInfo.length = data.data[0].length;
        if(data.data[0].weightUnit == 'kilograms') productInfo.weightUnit = 'kg'
        else if(data.data[0].weightUnit == 'grams') productInfo.weightUnit = 'g'
        else productInfo.weightUnit = data.data[0].weightUnit;
        productInfo.weight = data.data[0].weight;

        getafnfee.data.productInfoMapping = data.data[0];
        getFeesFromAmazonAPI(getafnfee, productInfo);
        
    }).fail(function(data){
        console.log("通信エラー");
        productInfo.state = 2000;// エラー状態
        return;
    });
}


const getFeesFromAmazonAPI = function(getafnfee, productInfo){
    $.ajax({
        type: 'POST',
        url: getafnfee.url + '?profitcalcToken=' + getafnfee.profitcalcToken,
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(getafnfee.data),// Jqueryがシリアライズするため、JSON文字列に変換する
        dataType: 'json'
    }).done(function(data){
        console.log("user5:", data);
        // afnFees:{
        //  fixedClosingFee: {amount:, taxAmount:}　　基本成約料(小口のみ)
        //  pickAndPackFee: {amount:, taxAmount:}　出荷作業手数料
        //  referralFee: {amount:, taxAmount:} 販売手数料
        //  storageFee: {amount:, taxAmount:}　月額保管手数料
        //  variableClosingFee: {amount:, taxAmount:}　カテゴリー成約料
        //  weightHandlingFee: {amount:, taxAmount:}　発送重量手数料
        // }
        // afnFutureFees: {}
        // mfnFees:{
        //  fixedClosingFee: {amount:, taxAmount:}　基本成約料(小口のみ)
        //  referralFee: {amount:, taxAmount:} 販売手数料
        //  variableClosingFee: {amount:, taxAmount:}　　カテゴリー成約料
        // }
        // mfnFutureFees: {}

        if(data.succeed != "true") {
            productInfo.state = 2000;// エラー状態
            return;
        }

        console.log("user6:", data.data.afnFees);

        productInfo.referralFeeRatio = data.data.afnFees.referralFee.amount/parseInt(getafnfee.data.afnPriceStr);// 率に直す
        productInfo.fixedClosingFee = data.data.afnFees.fixedClosingFee.amount;
        productInfo.variableClosingFee = data.data.afnFees.variableClosingFee.amount;
        productInfo.pickAndPackFee = data.data.afnFees.pickAndPackFee.amount;
        productInfo.weightHandlingFee = data.data.afnFees.weightHandlingFee.amount;
        productInfo.storageFee = data.data.afnFees.storageFee.amount;
        
        console.log("background.js 142:", productInfo);

        productInfo.state = 1100;// 処理の終了

    }).fail(function(data){
        console.log("通信エラー");
        productInfo.state = 2000;// エラー状態
        return;
    });
}

const init = function(tab, productmatches, getafnfee, productInfo){
    // 初期値をセット
    // asin = null;
    // cartPrice = null;
    // isAmazonProduct = false;
    
    // productInfo = productInfo || {};

    productInfo.state = 1001;// 読み込み

    // ************************** テスト用 **************************
    // ポップアップページのURLを除外する。※リリース時はコメントアウト
    // if(page.isTest){
    //     // pattern = new RegExp( '^chrome-extension://([a-z]{32})/popup.html$' );
    //     // result = url.match( pattern );

    //     productInfo.asin = test.asin;// デバッグ用に仮のASINを返す
    //     productmatches.data.searchKey = test.asin;
    //     console.log("テスト用にasinにtestAsinをセット");

    //     // ページからカート価格が取得できないので仮のカート価格をセット
    //     productInfo.cartPrice = test.cartPrice;
    //     console.log("テスト用にcartPriceにtestCartPriceをセット");
        
    //     page.isAmazonProduct = true;

    //     getProductInfoFromAmazonAPI(productmatches, getafnfee, productInfo);


    //     return;
    // }
    // ************************** ここまで **************************

    // URLからASINを取得
    productInfo.asin = getASINFromAmazonURL(tab.url);
    if(productInfo.asin == null) {
        page.isAmazonProduct = false;
        return;
    }
    page.isAmazonProduct = true;
    productmatches.data.searchKey = productInfo.asin;

    // content.jsからカート価格を取得　chrome.runtime.onMessage.addListenerへ
    sendToContent('get_price', tab);
    //sendToContent(new ContentScripts('get_price', null), tab);
    

    getProductInfoFromAmazonAPI(productmatches, getafnfee, productInfo);
    console.log("background.js 173:", productInfo);
}

// content.jsからデータを受け取る(カート価格の取得)
chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        productInfo.cartPrice = request.cartPrice;
        console.log("background.js 310:",request.cartPrice);
        return true;// 非同期のため明示的にtrueを返す
    }
);

// ページを読み込んだときAMAZON商品ページならASINをURLから取得、
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status == "loading") {

    }
    else if(changeInfo.status == "complete") {// ページがすべて読み込まれ完了したとき
        chrome.tabs.getSelected(null, function(tab) {
            init(tab, productmatches, getafnfee, productInfo);
        });
    }
});

// タブを切り替えたときにAMAZON商品ページならASINをURLから取得、
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onActivated.addListener(function(tab) {// タブ変更イベント 
    chrome.tabs.getSelected(null, function(tab) {
        init(tab, productmatches, getafnfee, productInfo);
    });
});



    // 現在のウィンドウの取得(別ウィンドウを開いている場合の対策)
    // windowとtabがスコープの外側で処理ができなかったため、スコープの内側でcontent側と通信している
    // 
    // chrome.windows.getCurrent({populate: true}, function(window) {// 現在のアクティブウィンドウの取得
    //     console.log(window);

    //     chrome.tabs.query({active: true}, function(tabs) {// 現在のアクティブタグの取得
    //         console.log(tabs);
    //         let focusedTab = "";
    //         for(let i = 0; i < tabs.length; i++) {// 変更されたタブ(フォーカスがある)を探索
    //             //console.log(tabs[i]);
    //             if(window.id == tabs[i].windowId) {
    //                 //console.log("the tab is focused", tabs[i].id);
    //                 focusedTab = tabs[i];
    //             }
    //         }
            
    //         // amazonの商品ページなら処理を継続
    //         if ( focusedTab.url.match(/^https:\/\/www\.amazon\.co\.jp*/)) {
    //             //strにhogeを含む場合の処理
    //             sendToContent("tab_change", focusedTab);// content.jsにタブ変更を伝える
    //         }
    //     });
    // });

/*chrome.browserAction.onClicked.addListener(function(tab) {
});*/


//タブ移動、ページ遷移両方に同じイベント