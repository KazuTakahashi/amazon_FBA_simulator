// 外部読み込み用変数・関数(const,let宣言はchrome.extension.getBackgroundPage()から読み込めないので注意)
var page = page || {};// 名前空間page
page.asin = null;// ASIN
page.url = null;// URL

// 現在のアクティブタグでAMAZON商品ページならASINをcontent_scripts(content.js)から取得するため、
// イベントの通知をsendMessageをcontent.jsへ送る
// ページがAMAZON商品ページ以外はcommonページを取得
const sendToContent = function(command, focusedTab){
    chrome.tabs.sendMessage(
        focusedTab.id,
        { command: command },
        function(msg) {
            console.log("result message:", msg);
    });
};

// AMAZON商品ページのURLからASINを取得
// ※デバッグ用にブラウザーアクションのポップアップも除外
// 戻り値：ASIN、AMAZON商品ページ以外ならnullを返す
const getASINFromAmazon = function(url){
    let asin = null;
    if(url == null) return null;
    // Amazonページの判定
    let pattern = new RegExp( '^https?://(?:[^.]+\.)?(?:images-)?amazon\\.(?:com|ca|co\.uk|de|co\\.jp|jp|fr|cn)(/.+)$' );
    let result = url.match( pattern );
    if(!result) {
        console.log("amazonページではない");

        // ************************* デバッグ用 *************************
        // ポップアップページのURLを除外する。※リリース時はコメントアウト
        // *************************************************************
        pattern = new RegExp( '^chrome-extension://([a-z]{32})/popup.html$' );
        result = url.match( pattern );
        if(result) {
            asin = "B0194P7RCU";// デバッグ用に仮のASINをセット
            return asin;
        }
        // *************************************************************
        // *************************************************************

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

// 
chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        // chrome.tabs.getSelected(function(tab) {
        //     callback(tab.title);
        // });
        page.asin = request;
        return true;// 非同期のため明示的にtrueを返す
    }
);

// ページを読み込んだときAMAZON商品ページならASINをURLから取得、
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status == "loading") {
        //page.url = changeInfo.url;
    }
    else if(changeInfo.status == "complete") {// ページがすべて読み込まれ完了したとき
        chrome.tabs.getSelected(null, function(tab) {
            page.asin = getASINFromAmazon(tab.url);
        });
    }
});

// タブを切り替えたときにAMAZON商品ページならASINをURLから取得、
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onActivated.addListener(function(tab) {// タブ変更イベント 
    chrome.tabs.getSelected(null, function(tab) {
        //console.log(tab.title + "\n" + tab.url);
        page.asin = getASINFromAmazon(tab.url);
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
});


/*chrome.browserAction.onClicked.addListener(function(tab) {
});*/


//タブ移動、ページ遷移両方に同じイベント