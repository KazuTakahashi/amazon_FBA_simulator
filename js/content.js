// ￥(全角)+カンマを取り除きIntへ変換
const formatFromCommaToInt = function(str){
    return parseInt(str.replace("￥ ", "").split(',').join('').trim());
};

const sendDataToBackground = function(dataArr){
    chrome.runtime.sendMessage(// background.jsにデータを受け渡す
        dataArr,
        function(response) {
            console.log("content.js 10:", response);
    });
};


$(function() {
    // let asin = $('#ASIN').val();// amazon商品ページからASINを取得
    // sendASINToBackground({ asin: asin });
    
    chrome.runtime.onMessage.addListener(
        function(msg, sender, callback) {
            if (msg.command && (msg.command == "get_price")) {// タブチェンジイベントをbackground.jsから取得
                //;// amazon商品ページから価格を取得
                sendDataToBackground({ cartPrice: formatFromCommaToInt($('#priceblock_ourprice').text()) });
            }
        }
    );
});

/*title = document.getElementById('productTitle').nodeValue;

console.log(title);
*/
/*chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.command && (msg.command == "change_title")) {
        //$('div').css("color","red");
        //alert("実行");
        var src = document.getElementsByTagName("title")[0].innerHTML;
        var dst = msg.title;
        document.getElementsByTagName("title")[0].innerHTML = dst;
        sendResponse("the page title's changed: '" + src + "' -> '" + dst + "'");
    }
  });*/

//$(function() {
    //var classVal = $('.size-weight').eq(0).children().eq(0).text(); // classの値を取得
    //var classVal = $('.size-weight').text(); // classの値を取得

    //var classVal = $('.size-weight:first td:nth-child(2)').text(); // classの値を取得

    //console.log(classVal);
    //var classVals = classVal.split(' '); // 取得した値を分割

    // 配列になっているのでforで一つずつ取得できる
    //for (var i = 0; i < classVals.length; i++) {
    //    console.log(classVals[i]);
    //}

//});
