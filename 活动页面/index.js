﻿var infoListNode,infoListNodeCopy,entryListNode,entryListNodeCopy;
var status;
var verifyTimeOut;
var verifyTimeFlag = false;
var typeValue,sectionIdValue;

var entryTimeFlag=false;
var entryTimeOut;

var clickType;

$(document).ready(function(){
    
    startSpinner();
    setHtmlFontSize();
    initWxSetting(initFormInfo,doSendShare,false,true,false);
   // initFormInfo();// debug
});

function initFormInfo(){


    // domNode copy
    infoListNode = $('[id="infoList"]')[0];
    var infoListNodeTmp = $('[infoResult="DisplayLine"]')[0];
    infoListNodeCopy = $(infoListNodeTmp).clone();
    $(infoListNodeTmp).remove();

    entryListNode = $('[id="entryList"]')[0];
    var entryListNodeTmp = $('[entryResult="SeckillSectionListInfo"]')[0];
    entryListNodeCopy = $(entryListNodeTmp).clone();
    $(entryListNodeTmp).remove();

    // 绑定事件
    $('#backPage').unbind("click").bind('click',function(){ //左上角返回
        gotoAppIndex()
    });
    $('[id="doEnterRecommend"]').unbind('click').bind('click',function(){ //我要推荐
        // baidu
        _hmt.push(['_trackEvent', '大众场首页-我要推荐', 'click',webClientService.getWebAppName()]);

        gotoVote();
    });

    $('[id="gotoMyList"]').unbind('click').bind('click',function(){ //我的战利品
        // baidu
        _hmt.push(['_trackEvent', '首页-我的战利品', 'click',webClientService.getWebAppName()]);

        clickType = 'zhanlipin';
        // 核身
        doFindEntryResult();

        // var url = webClientService.getWebAppName() + "/" + paramAppId + "/list.html?appId="+paramAppId+"&platform="+paramPlatform+"&userId="+paramUserId + "&sign="+paramSign + "&timeStamp="+(new Date()).getTime();
        // window.location = url;
    });

    $('[id="doEnterSlot"]').unbind('click').bind('click',function(){ //我要抽奖
        // showDialog.showInfoDialog({title : "提示信息", msgInfo : '本周五抽奖尚未开始'});
        // baidu
        _hmt.push(['_trackEvent', '大众场首页-我要抽奖', 'click',webClientService.getWebAppName()]);

        clickType = 'slot';
        // 核身
        doFindEntryResult();
    });
    $('[id="doShowInfo"]').unbind('click').bind('click',function(){ //活动规则
        $('[id="overLayer"]').show();
        $('[id="showInfo"]').show();
    });
    $('[id="closeBtn"]').unbind('click').bind('click',function(){ //关闭活动规则
        $('[id="overLayer"]').hide();
        $('[id="showInfo"]').hide();
    });
    doGetListInfo();

}

/**
 * 取得秒杀首页列表信息
 */
function doGetListInfo(){

    clientService.doPost({
        target: "com.ebuy.seckill2.spdweek.service.SeckillService",
        method: "getListInfo",
        dataObj: {
            appId: paramAppId,
            sectionNo: paramSectionNo,
            authTicket: cookieAuthTicket,
            userId: paramUserId,
            sign: paramSign
        },
        callBackWhenSucceed: "afterGetListInfo",
        callBackWhenError: "doError"
    })
}
function afterGetListInfo(returnValue){

    $('[id="entryList"]').empty();
    stopSpinner();

    //   if(isEmpty(returnValue)){
    //       doError();
    //     return;
    //  }

    var rootXmlNode = easyJsDomUtil.parseXML(returnValue);
    var errorCode = $(rootXmlNode).find('SeckillListPageInfo').find('errorCode').text();

    if(errorCode == 0){ //正常
        $(rootXmlNode).find('SeckillListPageInfo').find('SeckillSectionListInfo').each(function(index){
            var cloneNode = $(entryListNodeCopy).clone();
            $(cloneNode).find('[entryResult="icon"]').val($(this).find('icon').text());
            $(cloneNode).find('[entryResult="type"]').val($(this).find('type').text());
            $(cloneNode).find('[entryResult="nextSectionNo"]').val($(this).find('nextSectionNo').text());
            $(cloneNode).find('[entryResult="sectionId"]').val($(this).find('section_id').text());

            // 设置图片 按钮
            $(cloneNode).find('[id="public_img_url"]').attr('src',$(this).find('icon').text());
            var type = $(this).find('type').text();
            if(type == 'MORNING'){ //上午场
                $(cloneNode).addClass('am');
                $(cloneNode).find('[id="seckillTips"]').html('上午<br/><span>抽</span>资格');
            }else if(type == 'AFTERNOON'){
                $(cloneNode).find('[id="seckillTips"]').html('下午<br/><span>抢</span>爆品');
            }

            var arrLines = $(this).find('arrLines');
            $(arrLines).find('DisplayLine').each(function(num){
                var cloneInfoNode = $(infoListNodeCopy).clone();
                $(cloneInfoNode).find('[infoResult="name"]').val($(this).find('name').text());
                $(cloneInfoNode).find('[infoResult="value"]').val($(this).find('value').text());
                $(cloneInfoNode).find('.nameValue').html($(this).find('name').text()+$(this).find('value').text());
                $(cloneNode).find('[id="infoList"]').append(cloneInfoNode);
            });

            // 按钮绑定事件
            $(cloneNode).find('[id="doEnterLottery"]').unbind('click').bind('click',function(){ //上午场立即进入抽奖
                // baidu
                _hmt.push(['_trackEvent', '大众场首页-抽取资格', 'click',webClientService.getWebAppName()]);

                sectionIdValue = $(cloneNode).find('[entryresult="sectionId"]').val();
                clickType = 'shangwu';

                // 核身
                doFindEntryResult();

                // var url = webClientService.getWebAppName() + "/" + paramAppId + "/lottery.html?appId="+paramAppId+"&sectionId="+sectionIdValue+"&platform="+paramPlatform+"&userId="+paramUserId + "&sign="+paramSign + "&timeStamp="+(new Date()).getTime();
                // window.location = url;
            });

            $(cloneNode).find('[id="doWhite"]').unbind('click').bind('click',function(){ //下午场立即验证
                // baidu
                _hmt.push(['_trackEvent', '大众场首页-下午场验证', 'click',webClientService.getWebAppName()]);

                typeValue = $(cloneNode).find('[entryresult="type"]').val();
                sectionIdValue = $(cloneNode).find('[entryresult="sectionId"]').val();
                startSpinner();
                clickType = 'xiawu';

                // 核身
                doFindEntryResult();

                // doWhite();
                // debug
                // afterDoWhite('<WhiteResult><errorCode>0</errorCode><errorMsg>对不起，系统错误</errorMsg><status>0</status></WhiteResult>');
            });
            $(cloneNode).find('[id="doEnterList"]').unbind('click').bind('click',function(){ //我的战利品
                // baidu
                _hmt.push(['_trackEvent', '大众场首页-我的战利品', 'click',webClientService.getWebAppName()]);

                typeValue = $(cloneNode).find('[entryresult="type"]').val();
                clickType = 'zhanlipin';
                // 核身

                doFindEntryResult();

                // var url = webClientService.getWebAppName() + "/" + paramAppId + "/list.html?appId="+paramAppId+"&platform="+paramPlatform+"&userId="+paramUserId + "&type="+typeValue + "&sign="+paramSign + "&timeStamp="+(new Date()).getTime();
                // window.location = url;
            });

            $(entryListNode).append(cloneNode);
        });

        stopSpinner();
        $('[id="page"]').removeClass('vis_h');
    }else{
        var errorMsg = $(rootXmlNode).find('SeckillListPageInfo').find('errorMsg').text();
        showDialog.showInfoDialog({title : "提示信息", msgInfo : errorMsg});
    }
}

//核身
function doFindEntryResult(){
    clientService.doPost({
        target: "com.ebuy.seckill2.spdweek.service.SeckillService",
        method: "findEntryResult",
        dataObj: {
            appId: paramAppId,
            authTicket: cookieAuthTicket,
            userId: paramUserId,
            sign: paramSign
        },
        callBackWhenSucceed: "afterDoFindEntryResult",
        callBackWhenError: "afterDoFindEntryResult"
    })
}

function afterDoFindEntryResult(a){
    // alert('afterDoFindEntryResult:'+a);
    clearTimeout(entryTimeOut);
    // if (isEmpty(a)) doError();

 doWhite();
 return;
	
        a = easyJsDomUtil.parseXML(a);
        var b = $(a).find("EntryResult").find("errorCode").text();
        var status = $(a).find("EntryResult").find("status").text();
        b=0;
        if(b == '0'){
			
            if(status == '0'){
					
                stopSpinner();
                $('[id="overLayer"]').show();
                $('[id="vote_loading"]').show();

                if(entryTimeFlag == false){
                    entryTimeOut = setTimeout("doFindEntryResult()",10);
                }
            }else if(status == '1'){ //成功
			
                entryTimeFlag = true;
                // 跳转
                if(clickType == 'shangwu'){
                    var url = webClientService.getWebAppName() + "/" + paramAppId + "/lottery.html?appId="+paramAppId+"&sectionId="+sectionIdValue+"&platform="+paramPlatform+"&userId="+paramUserId + "&sign="+paramSign + "&timeStamp="+(new Date()).getTime();
                    window.location = url;
                }else if(clickType == 'xiawu'){
                    doWhite();
                    // debug
                    // afterDoWhite('<WhiteResult><errorCode>0</errorCode><errorMsg>对不起，系统错误</errorMsg><status>0</status></WhiteResult>');
                }else if(clickType == 'zhanlipin'){
                    var url = webClientService.getWebAppName() + "/" + paramAppId + "/list.html?appId="+paramAppId+"&platform="+paramPlatform+"&userId="+paramUserId + "&type="+typeValue + "&sign="+paramSign + "&timeStamp="+(new Date()).getTime();
                    window.location = url;
                }else if(clickType == 'slot'){
                    var url = webClientService.getWebAppName() + "/" + paramAppId + "/slot.html?appId="+paramAppId+'&sectionNo='+paramSectionNo+"&platform="+paramPlatform+"&userId="+paramUserId+"&sign="+paramSign+"&timeStamp="+(new Date()).getTime();
                    window.location = url;
                }

            }else if(status == '2'){ //
			
                $('[id="overLayer"]').hide();
                $('[id="vote_loading"]').hide();
                entryTimeOut = setTimeout("doFindEntryResult()",10);
                //    entryTimeFlag = true;
                //   bindCard();
            }else{
					
                entryTimeOut = setTimeout("doFindEntryResult()",10);

            }
        }else if(b == '4003'){
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();

            entryTimeFlag = true;
            bindCard();
        }else if(b == '4001'){
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();

            entryTimeFlag = true;
            bindCard();
        }else{
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();

            entryTimeFlag = true;
            bindCard();
        }
}

function bindCard(){
    stopSpinner();
    showDialog.showConfirmDialog({
        title: "提示信息",
        msgInfo: '对不起，您还未绑定浦发信用卡！',
        btnOkTxt: "绑定",
        btnCancelTxt: "办卡",
        btnOk: function() {
            // baidu
            _hmt.push(['_trackEvent', '首页-未绑卡', 'click',webFolder]);

            showDialog.showInfoDialog({
                title: "提示信息",
                msgInfo: "返回浦发信用卡官方微信主页面，发送“绑定”，并根据提示进行绑定操作。"
            })
        },
        btnCancel: function() {
            // baidu
            _hmt.push(['_trackEvent', '首页-去办卡', 'click',webFolder]);

            window.location = "https://mbank.spdbccc.com.cn/creditcard/indexActivity.htm?data=000004"
        }
    });
}

/*
 资格验证
 */
function doWhite(){

    clientService.doPost({
        target: "com.ebuy.seckill2.spdweek.service.SeckillService",
        method: "doWhite",
        dataObj: {
            appId: paramAppId,
            sectionId: sectionIdValue,
            authTicket: cookieAuthTicket,
            userId: paramUserId,
            sign: paramSign
        },
        callBackWhenSucceed: "afterDoWhite",
        callBackWhenError: "doError"
    })

    // debug
    // afterDoWhite('<WhiteResult><errorCode>0</errorCode><errorMsg>对不起，系统错误</errorMsg><status>1</status></WhiteResult>');
}
function afterDoWhite(returnValue){
   
    clearTimeout(verifyTimeOut);
    stopSpinner();
	// 开始的时候需要放开
 //  if(isEmpty(returnValue)){
   //     doWhite();
     //   return;
    //}

    var rootXmlNode = easyJsDomUtil.parseXML(returnValue);
    var errorCode = $(rootXmlNode).find('WhiteResult').find('errorCode').text();
	errorCode=0;
    if(errorCode == '0'){ //正常
        status = $(rootXmlNode).find('WhiteResult').find('status').text();
status=1;
        if(status == "0"){ //等待
            $('[id="overLayer"]').show();
            $('[id="vote_loading"]').show();

            if(verifyTimeFlag == false){
                verifyTimeOut = setTimeout("doWhite()",10);
            }
        }else if(status == "1"){ //成功
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();

            if(typeValue == 'AFTERNOON'){ //下午场
                //showDialog.showInfoDialog({title : "提示信息", msgInfo : "恭喜您获得本周四抢兑资格！<br/><span class='normal'>（抢兑资格条件以活动规则为准）</span>",btnOkTxt:'去抢兑',btnOk:function(){
                // baidu
                _hmt.push(['_trackEvent', '大众场首页-进入秒杀', 'click',webClientService.getWebAppName()]);

                var url = webClientService.getWebAppName() + "/" + paramAppId + "/seckill.html?appId="+paramAppId+'&sectionNo='+paramSectionNo+'&type='+typeValue+'&sectionId='+sectionIdValue+"&platform="+paramPlatform+"&userId="+paramUserId + "&sign="+paramSign + "&type=" + typeValue+ "&timeStamp="+(new Date()).getTime();
                window.location = url;
                //  }});
            }
        }else if(status == "2"){ //失败
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();
            showDialog.showInfoDialog({title : "提示信息", msgInfo : "你未获得本周四抢兑资格<br/><span class='normal'>（抢兑资格条件以活动规则为准）</span>"});
        }else if(status == "9"){ //错误
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();
            showDialog.showInfoDialog({title : "提示信息", msgInfo : "系统出错！<br/><span class='normal'>（抢兑资格条件以活动规则为准）</span>"});
        }else if(status == "-2"){ //未到时间
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();
            showDialog.showInfoDialog({title : "提示信息", msgInfo : "本期名单未公布！<br/><span class='normal'>（抢兑资格条件以活动规则为准）</span>"});
        }else if(status == "-1"){
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();
            showDialog.showInfoDialog({title : "提示信息", msgInfo : "您还未进行验证！<br/><span class='normal'>（抢兑资格条件以活动规则为准）</span>"});
        }else if(status == "99"){
            verifyTimeFlag = true;
            $('[id="overLayer"]').hide();
            $('[id="vote_loading"]').hide();
            showDialog.showInfoDialog({title : "提示信息", msgInfo : "本期活动已经结束！"});
        }
    }else if(errorCode == "4003"){  //未办卡
        verifyTimeFlag = true;
        $('[id="overLayer"]').hide();
        $('[id="vote_loading"]').hide();
        var errorMsg = $(rootXmlNode).find('WhiteResult').find('errorMsg').text();
        showDialog.showConfirmDialog({title : "提示信息", msgInfo : errorMsg,btnOkTxt:'绑定',btnCancelTxt:'办卡',btnOk:function(){
            // baidu
            _hmt.push(['_trackEvent', '大众场首页-未绑定', 'click',webClientService.getWebAppName()]);

            showDialog.showInfoDialog({title : "提示信息", msgInfo : "返回浦发信用卡官方微信主页面，发送“绑定”，并根据提示进行绑定操作。" });
        },btnCancel:function(){
            // baidu
            _hmt.push(['_trackEvent', '大众场首页-去办卡', 'click',webClientService.getWebAppName()]);

            window.location = 'https://mbank.spdbccc.com.cn/creditcard/indexActivity.htm?data=000004';
        }});
    }else{
		doWhite();
       // verifyTimeFlag = true;
        $('[id="overLayer"]').hide();
        $('[id="vote_loading"]').hide();
        var errorMsg = $(rootXmlNode).find('WhiteResult').find('errorMsg').text();
     //   showDialog.showInfoDialog({title : "提示信息", msgInfo : errorMsg});
    }
}

/**
 * app端左上角返回
 * @return {[type]} [description]
 */
function gotoAppIndex(){
    var osType = getOsType();
    if(osType == 1){//安卓
        window.jsspdb.lifeGoBack();
    }else if(osType == 0){// ios
        document.location="jsspdb:;lifeCall:,close";
    }
}