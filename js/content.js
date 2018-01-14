

//$(function() {
/*var asin = $('#ASIN').val();// amazon商品ページからASINを取得
console.log(asin);
//
chrome.runtime.sendMessage(// background.jsにasinデータを受け渡す
    { asin: asin },
    function(response) {
        console.log(response);
});
*/


//});

chrome.runtime.onMessage.addListener(
    function(msg, sender, callback) {
        if (msg.command && (msg.command == "tab_change")) {
            asin = $('#ASIN').val();// amazon商品ページからASINを取得
            console.log(msg);

            chrome.runtime.sendMessage(// background.jsにasinデータを受け渡す
                { asin: asin },
                function(response) {
                    console.log(response);
            });
        }
    }
);
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


