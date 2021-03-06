var itemDetailPage = new ItemDetailPage();

if(window.__skipInitPage == undefined || !window.__skipInitPage) {
    $(document).ready(function() {
    	//TODO test
		// commonShare.initWxSetting(indexPage.initPage,indexPage.doSendShare,false,true);
    	itemDetailPage.initPage();
        console.log("$(document).ready() initPage");
    });
}

function ItemDetailPage() {

	var _this = this;
	var _appId = "";
	var activityItemId = "";
	var _buy_limit_qty = '';
	var _shopListUrl = '';

	_buy_limit_qty = $('#buy_limit_qty').val();
	this.initPage = function() {
	
        _appId = $my.getUrlParam('appId');
    	_this.activityItemId = $my.getUrlParam('activityItemId');

        $my.async.series([
            initFormInfo,
            loadShopListUrl,
        ], function (totalCount, doneCount, error) {
            if (totalCount == doneCount) {
                console.log("indexPage initPage() done");
            }
        });
    };

    function initFormInfo(callback) {
        setHtmlFontSize();
        $('[id="page"]').removeClass('vis_h');

        initProImgSwipe();
        $('#addCart').unbind('click').bind('click', addCartItem);
        $('#payNow').unbind('click').bind('click', buyItemPayNow);

        $('#shopList').unbind('click').bind('click', gotoShopList);
        $('#proDetail').unbind('click').bind('click', gotoItemDetail);
        $('#buyNow').bind('click', function () {
            buyItem();
        });

        $('.dialog_close').bind('click', function () {
            $('.overLayer').hide();
            $('.m_pay_fast').hide();
        });

        if (callback) {
            callback();
        }
    }

    // 产品图片轮播
    function initProImgSwipe() {
        mSlideSwipe = new Swiper('#m_slide_swipe', {
            pagination: '.pagination',
            autoplay: 3000,
            grabCursor: true,
            loop: true,
            followFinger: false,
            paginationClickable: true,
            onSwiperCreated: function (mSlideSwipe) {
            },
            onSlideChangeStart: function (mSlideSwipe) {
            },
            onSlideChangeEnd: function (mSlideSwipe) {
                mSlideSwipe.startAutoplay();
            }
        });
    }

    function addCartItem() {
        $my.async.series([
            doAddCartItem,
        ], function (totalCount, doneCount, error) {
            if (totalCount == doneCount) {
                console.log("OrderPlacedPage buy done");

             }
         });
	}


    function loadShopListUrl(callback) {
        var activity_item_id = $('#activity_item_id').val();
        $my.ajax({
            url: $my.getCloudDataServiceUrl(),
            data: {
                serviceType: "com.ebuy.shop.web.service.ItemSearchService",
                serviceMethod: "getShopListUrl",
                activity_id: activity_item_id,
            },
            success: function (response) {
                if (response && response.length > 0) {
                    _this._shopListUrl = response;
                    $('#shop_list').show();
                }

                if (callback) {
                    callback();
                }
            },
            error: function (response) {
                if (callback) {
                    callback();
                }
            },
        });
    }

    //该方法同时存在于 item_page.js, cart.js, orderPlaced.js 中
    function checkResponseCodeIsAllow(code) {
        var msgInfo = "", allow = false;
        switch (code) {
            case '-9999':
                msgInfo = "登录失效，请重新登录。";
                break;
            case '-1':
                msgInfo = "未知错误";
                break;
            case '100':
                msgInfo = "不在白名单中，不能抢购。";
                break;
            case '10':
                msgInfo = "商品已下架！";
                break;
            case '9':
            case '8':
                // msgInfo = "客官，当前产品已被疯抢完毕，请移步其他产品吧";
                msgInfo = "商品已兑完";
                break;
            case '24':
                msgInfo = "每人限制购买" + _buy_limit_qty + "件";
                break;
            case '25':
                msgInfo = "请输入订单商品数量";
                break;
            case '30':
                msgInfo = "没有查到符合你选择的支付类型";
                break;
            case '31':
                msgInfo = "请输入选择支付类型";
                break;
            case '32':
                msgInfo = "没有查到该商品描述";
                break;
            case '33':
                msgInfo = "没有查到该商品的所包含的支付方式";
                break;
            case '34':
                msgInfo = "解析该商品所有支付方式列表异常";
                break;
            case '35':
                msgInfo = "未到兑换时间";
                break;
            case '37':
                msgInfo = "没有查找到购物车相关信息";
                break;
            case '38':
                msgInfo = "没有查找到商品信息";
                break;
            case '':
                msgInfo = "网络繁忙，请重试！";
                break;
            default :
                allow = true;
                break;
        }
        if (!allow) {
            showDialog.showInfoDialog({
                title: "提示信息",
                msgInfo: msgInfo
            });
        }
        return allow;
    }


    /**
     * 添加购物车
     * @param callback
     */
    function doAddCartItem(callback) {
        var itemId = $('#activity_item_id').val();
        var shipping_type = $('#shipping_type').val();
        var pay_type_id = $('.on #pay_type_id').val();
        //	针对于原先生成的静态页面没有pay_type_id的，默认赋值pay_type_id=1
        if ($my.string.isEmpty(pay_type_id)) {
            pay_type_id = 1;
        }

        var skuId = "";
        var installment_num = 1;
        var itemQty = 1;

        $my.ajax({
            url: $my.getCloudDataServiceUrl(),
            data: {
                serviceType: "com.ebuy.shop.web.service.UserCartService",
                serviceMethod: "setCartItem",
                activity_item_id: itemId,
                sku_id: skuId,
                pay_type_id: pay_type_id,
                installment_num: installment_num,
                item_quantity: itemQty,
                selected: false,
                parentId: "",
                activityItemId: "",
                shareTime: "",
                shareSign: "",
                shipping_type: shipping_type
            },
            success: function (response) {
                if (response == 0) {
                    showDialog.showConfirmDialog({
                        title: "提示信息", msgInfo: "已加入兑换篮，是否前往查看？", btnOk: function () {
                            window.location = $my.getWebApp() + '/cart.html?timeStamp=' + (new Date()).getTime();
                        }
                    });
                }
                else if (response == 1) {
                    showDialog.showConfirmDialog({
                        title: "提示信息", msgInfo: "兑换篮已存在相同商品，是否前往查看？", btnOk: function () {
                            window.location = $my.getWebApp() + '/cart.html?timeStamp=' + (new Date()).getTime();
                        }
                    });
                }
                else {
                    checkResponseCodeIsAllow(response);
                }
                if (callback) {
                    callback();
                }
            },
            error: function (response) {
                if (callback) {
                    callback();
                }
            },
        });
    }

    function buyItem() {
        $my.async.series([
            showBuyItemDialog,
        ], function (totalCount, doneCount, error) {
            if (totalCount == doneCount) {
                console.log("OrderPlacedPage buy done");

            }
        });
    }

    function buyItemPayNow() {
        $my.async.series([
            doBuyItem,
        ], function (totalCount, doneCount, error) {
            if (totalCount == doneCount) {
                console.log("OrderPlacedPage buy done");

            }
        });
    }

    function showBuyItemDialog() {

        $('.overLayer').show();
        $('.m_pay_fast').show();
    }

    function doBuyItem(callback) {
        var activity_item_id = $('#activity_item_id').val();
        var shipping_type = $('#shipping_type').val();
        var pay_type_id = $('.on #pay_type_id').val();
        var sku_id = "";
        var item_qty = 1;
        //	针对于原先生成的静态页面没有pay_type_id的，默认赋值pay_type_id=1
        if ($my.string.isEmpty(pay_type_id)) {
            pay_type_id = 1;
        }
        $my.ajax({
            url: $my.getCloudDataServiceUrl(),
            data: {
                serviceType: "com.ebuy.shop.web.service.UserOrderService",
                serviceMethod: "checkStockNumAndBuyTime",
                activity_item_id: activity_item_id,
                sku_id: sku_id,
                item_qty: item_qty
            },
            success: function (response) {
                if (response && response.length > 0) {
                    var retCode = response;
                    //if (checkResponseCodeIsAllow(retCode)) {
                    if (true) {
                        if (shipping_type == '3') {
                            //alert('填写物流');
                            window.location = $my.getWebApp() + '/orderPlaced.html?activity_item_id=' + activity_item_id
                                + '&sku_id=' + sku_id
                                + '&shipping_type=' + shipping_type
                                + '&pay_type_id=' + pay_type_id
                                + '&timeStamp=' + (new Date()).getTime();
                        } else {
                            var installment_num = 1;

                            $my.ajax({
                                url: $my.getCloudDataServiceUrl(),
                                data: {
                                    serviceType: "com.ebuy.shop.web.service.UserOrderService",
                                    serviceMethod: "getNewOrderForBuy",
                                    activity_item_id: activity_item_id,
                                    sku_id: sku_id,
                                    installment_num: installment_num,
                                    item_qty: item_qty,
                                    shipping_type: shipping_type,
                                    pay_type_id: pay_type_id
                                },
                                success: function (response) {
                                    if (response && response.length > 0) {
                                        var retCode = response;
										// <EtcPayRequest>
  // <callBackurl>https://pay2.e-pointchina.com/spdpay/pay_servlet/etccreditcard_pay_notify_ecitic</callBackurl>
  // <orderId>17041913055d003997</orderId>
  // <ordernfo>transDate%3D20170419%26transTime%3D13050005%26merchantID%3Dzxscyb%26merchantName%3D%25E6%2598%2593%25E7%2599%25BE%25E4%25BF%25A1%25E6%2581%25AF%25E6%258A%2580%25E6%259C%25AF%26batchNo%3D170419%26serialNo%3D013275%26orderID%3D17041913055d003997%20%26productType%3DQ98107%26productNum%3D01%26productDesc%3D%25E5%25B0%258F%25E6%259D%25A8%25E7%2594%259F%25E7%2585%258E20%25E5%2585%2583%25E4%25BB%25A3%25E9%2587%2591%25E5%2588%25B8%26transAmt%3D0000000000900%26timeStamp%3D20170419130500005%26signature%3DHsJp4rw%2B3vYSoQsoA3Ynnq26hbEwq%2FvsopN9QBan9KgXeVvdF6doTfRcrt2lHj1OBDM0EEgM5bzn4KJVFYLfGX0svo8V0WEBfpZ%2FaL9t9rt1xTS6fFuWZ7hCSFJQmQUwnFwabeu9dg6HnXCKrPmPaf2pnkPZ5eWcmQS6VlW70pY%3D%26cashAmt%3D0000000000000%26payWay%3D03%26OpenID%3D31d28a2f1ae31d3a530175c8b8a006bf%26dividedNum%3D01%26unitPrice%3D0</ordernfo>
  // <skey>A451C9EC7F008C1832C43D6C87A8CEA9</skey>
// </EtcPayRequest>
										
                                        //alert(retCode);
                                     // if (checkResponseCodeIsAllow(retCode)) {
										   if (true) {
                                            afterRequestConfirmPay(response);
                                        }
                                    }
                                    if (callback) {
                                        callback();
                                    }
                                },
                                error: function (response) {
                                    if (callback) {
                                        callback();
                                    }
                                },
                            });
                        }
                    }
                }
            }
        });

    }

    function afterRequestConfirmPay(returnValue) {

        var shipping_type = $('#shipping_type').val();

		alert(returnValue);
		console.log(returnValue);
		//return;
      //  if ($my.string.isEmpty(returnValue)) {
        //    doError();
          //  return;
        //}

        var infoNode = easyJsDomUtil.parseXML(returnValue);
        var callBackUrl = $(infoNode).find("callBackurl").text();
        var ordernfo = $(infoNode).find("ordernfo").text();
        var skey = $(infoNode).find("skey").text();

        var info = "map://PayComm('" + callBackUrl + "','" + ordernfo + "','" + skey + "')";
        execute(info);
    }

    function gotoShopList() {
        if (_this._shopListUrl && _this._shopListUrl.length > 0) {
            var url = _this._shopListUrl + '&timeStamp=' + (new Date()).getTime();
            //alert(url);
            window.location = url;
        }
    }

    function gotoItemDetail() {
        var activity_item_id = $('#activity_item_id').val();
        window.location = $shop.getItemDetailPageUrl(activity_item_id);
    }

    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return { //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }

    function execute(url) {
        if (browser.versions.ios) {
            //ios设备，采用此方法调用
            var iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", url);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        } else {
            //其他设备，调用此方法
            window.location = url;
        }
    }
}
