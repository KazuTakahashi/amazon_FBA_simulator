// 外部読み込み用変数・関数(const,let宣言はchrome.extension.getBackgroundPage()から読み込めないので注意)
var page = page || {};// 名前空間page
page.asin = null;// ASIN
page.cartPrice = null;// カート価格

page.productInfo = page.productInfo || {};
page.productInfo.asin = "";
page.productInfo.title = "";
page.productInfo.cost = 0;
page.productInfo.cartPrice = 0;
page.productInfo.dimensionUnit = "";
page.productInfo.width = 0.0;
page.productInfo.height = 0.0;
page.productInfo.length = 0.0;
page.productInfo.weightUnit = "";
page.productInfo.weight = 0.0;
page.productInfo.referralFee = 0.0; //%
page.productInfo.closingFee = 0; //
page.productInfo.pickAndPackFee = 0; //
page.productInfo.weightHandlingFee = 0; //
page.productInfo.storageFee = 0; //
page.productInfo.state = 1000;// no data: 1000, processing: 1001, compleate: 1100, error: 2000

page.isAmazonProduct = false;// amazon商品ページならture
page.state = 1000;// normal: 1000, processing: 1001, error: 2000


page.testAsin = "B00H96GS8G";// テスト用asin
page.testCartPrice = 570;// テスト用カート価格
page.isTest = true;//

// 現在のアクティブタグでAMAZON商品ページならASINをcontent_scripts(content.js)から取得するため、
// イベントの通知をsendMessageをcontent.jsへ送る
// ページがAMAZON商品ページ以外はcommonページを取得
const sendToContent = function(command, focusedTab){
    chrome.tabs.sendMessage(
        focusedTab.id,
        { command: command },
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

const getProductInfoFromAmazonAPI = function(asin, lang, token, productInfo){
    page.productInfo.state = 1001;// 処理中に移行
    $.ajax({
        type: 'GET',
        url: 'https://sellercentral.amazon.co.jp/fba/profitabilitycalculator/productmatches',
        data: {
            searchKey: asin,
            language: lang,
            profitcalcToken: token
        },
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
            page.productInfo.state = 2000;// エラー状態
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
        
        getFeesFromAmazonAPI('JPY', 'A1VC38T7YXB528', data.data[0], productInfo);
        
    }).fail(function(data){
        console.log("通信エラー");
        page.productInfo.state = 2000;// エラー状態
        return;
    });
}


const getFeesFromAmazonAPI = function(currency, marketPlaceId, info, productInfo){
    $.ajax({
        type: 'POST',
        url: 'https://sellercentral-japan.amazon.com/fba/profitabilitycalculator/getafnfee?profitcalcToken=Z1UgBc1j2F027uhQmFIy9O4KzVy34j3D',
        //mimeType: "application/json",
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({// Jqueryがシリアライズするため、JSON文字列に変換する
            afnPriceStr: '1000',
            currency: currency,
            futureFeeDate: '2015-10-23 00:00:00',
            hasFutureFee: false,
            hasTaxPage: true,
            marketPlaceId: marketPlaceId,
            mfnPriceStr: '1000',
            mfnShippingPriceStr: '100',
            productInfoMapping: info
        }),
        dataType: 'json'
    }).done(function(data){
        console.log("user5:", data);
        // afnFees:{
        //  fixedClosingFee: {amount:, taxAmount:}　　カテゴリー成約料
        //  pickAndPackFee: {amount:, taxAmount:}　出荷作業手数料
        //  referralFee: {amount:, taxAmount:} 販売手数料
        //  storageFee: {amount:, taxAmount:}　月額保管手数料
        //  variableClosingFee: {amount:, taxAmount:}　カテゴリー成約料
        //  weightHandlingFee: {amount:, taxAmount:}　発送重量手数料
        // }
        // afnFutureFees: {}
        // mfnFees:{
        //  fixedClosingFee: {amount:, taxAmount:}　カテゴリー成約料
        //  referralFee: {amount:, taxAmount:} 販売手数料
        //  variableClosingFee: {amount:, taxAmount:}　　カテゴリー成約料
        // }
        // mfnFutureFees: {}

        if(data.succeed != "true") {
            page.productInfo.state = 2000;// エラー状態
            return;
        }

        console.log("user6:", data.data.afnFees);

        productInfo.referralFee = data.data.afnFees.referralFee.amount/1000;
        productInfo.closingFee = data.data.afnFees.fixedClosingFee.amount;
        productInfo.pickAndPackFee = data.data.afnFees.pickAndPackFee.amount;
        productInfo.weightHandlingFee = data.data.afnFees.weightHandlingFee.amount;
        productInfo.storageFee = data.data.afnFees.storageFee.amount;
        
        console.log("background.js 142:", productInfo);

        page.productInfo.state = 1100;// 処理の終了

    }).fail(function(data){
        console.log("通信エラー");
        page.productInfo.state = 2000;// エラー状態
        return;
    });
}

const init = function(tab){
    // 初期値をセット
    page.asin = null;
    page.cartPrice = null;
    page.isAmazonProduct = false;
    
    page.productInfo = page.productInfo || {};

    page.state = 1001;

    // ************************** テスト用 **************************
    // ポップアップページのURLを除外する。※リリース時はコメントアウト
    if(page.isTest){
        // pattern = new RegExp( '^chrome-extension://([a-z]{32})/popup.html$' );
        // result = url.match( pattern );
        
        page.asin = page.testAsin;// デバッグ用に仮のASINを返す
        console.log("テスト用にasinにpage.testAsinをセット");

        // ページからカート価格が取得できないので仮のカート価格をセット
        page.productInfo.cartPrice = page.testCartPrice;
        console.log("テスト用にcartPriceにpage.testCartPriceをセット");
        
        page.isAmazonProduct = true;

        getProductInfoFromAmazonAPI(page.asin, 'ja_JP', 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D', page.productInfo);


        return;
    }
    // ************************** ここまで **************************

    page.asin = getASINFromAmazonURL(tab.url);
    if(page.asin == null) {
        page.isAmazonProduct = false;
        return;
    }
    page.isAmazonProduct = true;

    // content.jsからカート価格を取得　chrome.runtime.onMessage.addListenerへ
    sendToContent('get_price', tab);

    // page.productInfo = getProductInfoFromAmazonAPI(page.asin, 'ja_JP', 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D', page.productInfo);
    // if(page.productInfo == null) page.state = 2000;
    // else page.state = 1000;
    console.log("background.js 173:", page.productInfo);

    
}

// 
chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        page.productInfo.cartPrice = request.cartPrice;
        console.log(page.cartPrice);
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
            init(tab);
        });
    }
});

// タブを切り替えたときにAMAZON商品ページならASINをURLから取得、
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onActivated.addListener(function(tab) {// タブ変更イベント 
    chrome.tabs.getSelected(null, function(tab) {
        init(tab);
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