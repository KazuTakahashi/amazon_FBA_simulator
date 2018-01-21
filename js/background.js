// 外部読み込み用関数(const,let宣言はchrome.extension.getBackgroundPage()から読み込めないので注意)

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

let asin = null;
var getASIN = function(){// var宣言でないと動かない
    console.log("user5:", asin);
    return asin;
};

let product = null;
var getProduct = function(){// var宣言でないと動かない
    return product;
};

// 
chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        // chrome.tabs.getSelected(function(tab) {
        //     callback(tab.title);
        // });
        asin = request;
        console.log("user3:", asin);
        
        return true;// 非同期のため明示的にtrueを返す
    }
);

/*chrome.browserAction.onClicked.addListener(function(tab) {
});*/


// タブを切り替えたときにAMAZON商品ページならASINをcontent_scripts(content.js)から取得、
// イベントの通知をsendMessageをcontent.jsへ送る
// ページがAMAZON商品ページ以外はcommonページを取得
chrome.tabs.onActivated.addListener(function(tab) {// タブ変更イベント 
    console.log("change tabs");

    chrome.tabs.getSelected(null, function(tab) {
        //console.log(tab.title + "\n" + tab.url);

        // Amazonページの判定
        let pattern = new RegExp( '^https?://(?:[^.]+\.)?(?:images-)?amazon\\.(?:com|ca|co\.uk|de|co\\.jp|jp|fr|cn)(/.+)$' );
        let result = tab.url.match( pattern );
        if(result) {
            //console.log(result);
            console.log("amazonページ");
        } else {
            console.log("amazonページではない");
            asin = null;
            return true;
        }
        
        // Amazon商品ページの判定
        pattern = new RegExp( '(?:/asin/|%2fasin%2f|&asins?=|%26asins?%3d|=asin/|%3dasin%2f|&a=|%26a%3d|/dp/|%2fdp%2f|/dp/accessories/|%2fdp%2faccessories%2f|/dp/artist-redirect/|%2fdp%2fartist-redirect%2f|/dp/product-details/|%2fdp%2fproduct-details%2f|/dp/samples/|%2fdp%2fsamples%2f|/exec/obidos/isbn/| %2fexec%2fobidos%2fisbn%2f|/gp/offer-listing/|%2fgp%2foffer-listing%2f|/gp/product/| %2fgp%2fproduct%2f|/gp/product/images/|%2fgp%2fproduct%2fimages%2f/gp/product/product-description/| %2fgp%2fproduct%2fproduct-description%2f|/gp/product/toc/|%2fgp%2fproduct%2ftoc%2f|/images/p/| %2fimages%2fp%2f|/product-reviews/|%2fproduct-reviews%2f|/sim/|%2fsim%2f)([0-9A-Z]{10})(?:/|\\?|\\&|\\.|%|$)' );

        result = tab.url.match( pattern );
        if(result) {
            console.log("商品ページ");
            console.log(result[1]);
            asin = result[1];
        }else{
            console.log("商品ページではない");
            asin = null;
            return true;
        }
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




//タブ移動、ページ遷移両方に同じイベント