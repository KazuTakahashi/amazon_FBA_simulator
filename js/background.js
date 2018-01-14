//console.log("background.js");

var asin;
var getASIN = function(){
    return asin;
};
var product;
var getProduct = function(){
    return product;
};

chrome.runtime.onMessage.addListener(
    function(request, sender, callback) {
        chrome.tabs.getSelected(function(tab) {
            callback(tab.title);
        });

        asin = request;
        console.log(asin);
        
        $.ajax({
            type: 'GET',
            url: 'https://sellercentral.amazon.co.jp/fba/profitabilitycalculator/productmatches',
            data: {
                searchKey: asin.asin,
                language: 'ja_JP',
                profitcalcToken: 'ibHsrDQYkpn6kkFIiBxJFTFw21gj3D'
            },
            dataType: 'json'
        }).done(function(data){
            //alert('success!!');
            console.log(data.data[0]);
            product = data.data[0];

        }).fail(function(data){
            //alert('error!!!');
            console.log("通信エラー");
        });
        
        //var str2 = classVal.replace(/[^0-9^\.]/g,"");
        return true;// 非同期のため明示的にtrueを返す
    }
);

/*chrome.browserAction.onClicked.addListener(function(tab) {


    
    chrome.tabs.sendMessage(// content.jsにアクションボタンが押されたことを伝える
        tab.id,
        { command: "actbtn_push" },
        function(msg) {
            console.log("result message:", msg);
        
    });
});*/



chrome.tabs.onActivated.addListener(function(tab) {// タブ変更イベント 
    //console.log("change tabs");

    // 現在のウィンドウの取得(別ウィンドウを開いている場合の対策)
    // windowとtabがスコープの外側で処理ができなかったため、スコープの内側でcontent側と通信している
    // 
    chrome.windows.getCurrent({populate: true}, function(window) {// 現在のアクティブウィンドウの取得
        console.log(window);

        chrome.tabs.query({active: true}, function(tabs) {// 現在のアクティブタグの取得
            console.log(tabs);
            let focusedTab;
            for(let i = 0; i < tabs.length; i++) {// 変更されたタブ(フォーカスがある)を探索
                //console.log(tabs[i]);
                if(window.id == tabs[i].windowId) {
                    //console.log("the tab is focused", tabs[i].id);
                    focusedTab = tabs[i];
                }
            }
            
            // amazonの商品ページなら処理を継続
            if ( focusedTab.url.match(/^https:\/\/www\.amazon\.co\.jp*/)) {
                //strにhogeを含む場合の処理
                
                chrome.tabs.sendMessage(// content.jsにタブ変更を伝える
                    focusedTab.id,
                    { command: "tab_change" },
                    function(msg) {
                        console.log("result message:", msg);
                });
            }

        });
    });

});


//タブ移動、ページ遷移両方に同じイベント