// 一个全局对象，用于保存与游戏相关的所有全局变量。
var matchingGame = {};

// 我们将在这个保存对象中保存需要保存的信息。
//这些信息包括游戏状态。
//信息例如哪个卡位于哪个位置，哪个卡被删除。
matchingGame.savingObject = {};

// 一个存放牌组的数组, 基本上是 matchingGame.deck 的克隆.
matchingGame.savingObject.deck = [];

// 一个通过存储它们的索引编号来存储移除的卡的数组。
matchingGame.savingObject.removedCards = [];

// 存储已经消耗的时间（归零）
matchingGame.savingObject.currentElapsedTime = 0;


// 牌组中每张牌的所有可能的值
matchingGame.deck = [
	'cardAK', 'cardAK',
	'cardAQ', 'cardAQ',
	'cardAJ', 'cardAJ',
	'cardBK', 'cardBK',
	'cardBQ', 'cardBQ',
	'cardBJ', 'cardBJ',	
];

// DOM加载完毕后，$(function(){})中的代码运行
$(function(){	
	//重新开始按钮——刷新页面
	$("#res1").click(function(){
			localStorage.removeItem("savingObject");
			window.location.href = window.location.href;
	});
	//清除纪录按钮
	$("#res2").click(function(){
			localStorage.removeItem("last-score");
	});
	
	// 洗牌（matchingGame.deck按照shuffle函数返回值执行sort排序）
	matchingGame.deck.sort(shuffle);
	
	// 重新创建保存的牌组
	var savedObject = savedSavingObject();
	if (savedObject != undefined)
	{
		matchingGame.deck = savedObject.deck;
	}
	
	// 将牌组复制到保存对象中。
	matchingGame.savingObject.deck = matchingGame.deck.slice();
	//【JS】slice()方法：从已有的数组中返回元素
	
	// 克隆12张卡片DOM的副本
	for(var i=0;i<11;i++){
		$(".card:first-child").clone().appendTo("#cards");
		//【JQ】clone()方法：克隆拷贝元素  【JQ】appendTo()方法：在被选元素的结尾(但仍在元素的内部)插入指定的内容
	}
	
	// 初始化每张卡片
	$("#cards").children().each(function(index) {
		//【JQ】children()方法：返回被选元素的所有直接子元素。
		//【JQ】each() 函数: 用于遍历指定的对象和数组。
		// 将卡片对齐，使其为4x4。
		$(this).css({
			"left" : ($(this).width()  + 20) * (index % 4),
			"top"  : ($(this).height() + 20) * Math.floor(index / 4)
		});
		
		// 从洗过的牌组中得到一个图案
		var pattern = matchingGame.deck.pop();
		//【JS】pop()方法：用于删除数组的最后一个元素并返回删除的元素。
		
		// 将图案应用于卡片的背面
		// 图案pattern的值实际上是一个CSS类，带有相应的扑克牌图像
		$(this).find(".back").addClass(pattern);
		//【JQ】find()方法：返回被选元素的后代元素 【JQ】addClass()方法：向被选元素添加一个或多个类名。

		// 将图案的数据嵌入到DOM的元素中
		$(this).data("pattern",pattern);
		//【JQ】data()方法：向被选元素附加数据
		
		// 将循环次数index保存到DOM元素中，这样我们以后就知道它是哪张卡了。
		$(this).attr("data-card-index",index);
						
		// 每个卡片 DIV元素上的click事件时执行selectCard函数。
		$(this).click(selectCard);				
	});
	
	// 移除在存储对象中已经移除的卡片
	if (savedObject != undefined)
	{
		matchingGame.savingObject.removedCards = savedObject.removedCards; 
		for(var i in matchingGame.savingObject.removedCards)
		{			
			$(".card[data-card-index="+matchingGame.savingObject.removedCards[i]+"]").remove();
		}
	}

	// 重置所耗时间
	matchingGame.elapsedTime = 0;
	
	// 还原保存的所耗时间
	if (savedObject != undefined)
	{
		matchingGame.elapsedTime = savedObject.currentElapsedTime; 
		matchingGame.savingObject.currentElapsedTime = savedObject.currentElapsedTime;
	}
			
	// 启动计时器
	matchingGame.timer = setInterval(countTimer, 1000);

});

// 计时器
function countTimer()
{

	matchingGame.elapsedTime++;
	
	// 将即时的所耗时间保存进savingObject.
	matchingGame.savingObject.currentElapsedTime = matchingGame.elapsedTime;
		
	// 转换分秒
	var minute = Math.floor(matchingGame.elapsedTime / 60);
	var second = matchingGame.elapsedTime % 60;	
	
	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	
	// 现实挑战时间
	$("#elapsed-time").html(minute+":"+second);
	
	// 执行saveSavingObject 保存进度
	saveSavingObject();
}



function selectCard() {
	// 已经有两张牌被翻开时不执行任何操作
	if ($(".card-flipped").size() > 1)
	{
		return;
	}
	
	// 添加 "card-flipped" 类.
	// 浏览器将在当前状态和卡片翻转状态之间设置样式动画。
	$(this).addClass("card-flipped");
	
	// 0.5秒后检查两张翻转卡牌的图案。
	if ($(".card-flipped").size() == 2)
	{
		setTimeout(checkPattern,500);
	}
}
// 检查两张牌是否相同并执行操作
function checkPattern()
{
	if (isMatchPattern())
	{
		play1();//执行play1() （播放匹配成功音效）
		
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		
		// 转换完成后删除卡牌DOM节点。
		$(".card-removed").bind("webkitTransitionEnd", removeTookCards);
	}
	else
	{
		play2(); //执行play2() （播放匹配失败音效）
		$(".card-flipped").removeClass("card-flipped");
	}
}
// 检查两张牌是否匹配，返回布尔运算值
function isMatchPattern()
{
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}

// 一个能够返回一个-0.5到0.5内的随机数的函数
function shuffle()
{
	// 向matchingGame.deck.sort这个排序函数中返回一个随机数。
	// sort排序函数的运行由正数和负数决定
	// Math.random() 范围是0-1, 0.5 - Math.random() 可能是正数可能是复数.	
	return 0.5 - Math.random();
}



// 删去已经被移除的卡
function removeTookCards()
{
	// 将每个已经被移除的卡牌添加到用来存储已经被移除的卡牌的数组当中
	$(".card-removed").each(function(){
		matchingGame.savingObject.removedCards.push($(this).data("cardIndex"));
		$(this).remove();
	});		
	
	// 检查卡牌是否已经清空，如果是，执行gameover()
	if ($(".card").length == 0)
	{
		gameover();
	}
	
}

//游戏结束
function gameover()
{
	// 停止计时器
	clearInterval(matchingGame.timer);
	
	// 显示所耗时间
	$(".score").html($("#elapsed-time").html());
	
	// 加载存储中的历史纪录信息
	var lastScore = localStorage.getItem("last-score");
	
	// 检查是否没有历史纪录
	lastScoreObj = JSON.parse(lastScore);
	if (lastScoreObj == null)
	{
		// 如果没有历史纪录，先创建一个空纪录
		lastScoreObj = {"savedTime": "no record", "score": 0};
	}	
	var lastElapsedTime = lastScoreObj.score;
		
	// 检查是否是新纪录，如果是现实新纪录图标并修改记录存储
	if (lastElapsedTime == 0 || matchingGame.elapsedTime < lastElapsedTime)
	{
		$(".ribbon").removeClass("hide");
		// 获取当前时间
		var currentTime = new Date();
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();	
		if (minutes < 10) minutes = "0" + minutes;
		var seconds = currentTime.getSeconds();
		if (seconds < 10) seconds = "0" + seconds;
		var now = year+"/"+month+"/"+day+" "+hours+":"+minutes+":"+seconds;
		//构造存储纪录时间的对象
		var obj = { "savedTime": now, "score": matchingGame.elapsedTime};
		// 将纪录保存进本地存储
		localStorage.setItem("last-score", JSON.stringify(obj));
	}
	lastScore = localStorage.getItem("last-score");
	lastScoreObj = JSON.parse(lastScore);
	lastElapsedTime = lastScoreObj.score;
	// 转换分秒格式
	var minute = Math.floor(lastElapsedTime / 60);
	var second = lastElapsedTime % 60;	
	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	// 显示挑战时间
	$(".last-score").html(minute+":"+second);
	// 显示纪录
	var savedTime = lastScoreObj.savedTime;
	$(".saved-time").html(savedTime);

	//显示游戏结束的弹窗
	$("#popup").removeClass("hide");
	
	play3();//执行play3()（播放游戏成功音效）

	//清除纪录按钮
	$("#res4").click(function(){
			localStorage.removeItem("last-score");
			$(".last-score").html("00:00");
			$(".saved-time").html("no record");
	});

	// 清除savingObject存储
	localStorage.removeItem("savingObject");

	//重新游戏按钮
	$("#res3").click(function(){
			window.location.href = window.location.href;
			});
}


 
  
function play1() {
  var audio = new Audio('https://downsc.chinaz.net/Files/DownLoad/sound1/202204/y758.mp3');
  audio.play();
}
 
function play2() {
  var audio = new Audio('https://downsc.chinaz.net/Files/DownLoad/sound1/202108/14656.mp3');
  audio.play();
}
 
function play3() {
  var audio = new Audio('https://downsc.chinaz.net/files/download/sound/huang/cd9/wav/505.mp3');
  audio.play();
}


//把savingObject对象编码成JSON字符串并存储
function saveSavingObject()
{
	
	localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
}

//将JSON字符串变回savingObject对象 并返回
function savedSavingObject()
{
	
	var savingObject = localStorage["savingObject"];
	if (savingObject != undefined)
	{
		savingObject = JSON.parse(savingObject);
	}
	return savingObject;
}
