// һ��ȫ�ֶ������ڱ�������Ϸ��ص�����ȫ�ֱ�����
var matchingGame = {};

// ���ǽ��������������б�����Ҫ�������Ϣ��
//��Щ��Ϣ������Ϸ״̬��
//��Ϣ�����ĸ���λ���ĸ�λ�ã��ĸ�����ɾ����
matchingGame.savingObject = {};

// һ��������������, �������� matchingGame.deck �Ŀ�¡.
matchingGame.savingObject.deck = [];

// һ��ͨ���洢���ǵ�����������洢�Ƴ��Ŀ������顣
matchingGame.savingObject.removedCards = [];

// �洢�Ѿ����ĵ�ʱ�䣨���㣩
matchingGame.savingObject.currentElapsedTime = 0;


// ������ÿ���Ƶ����п��ܵ�ֵ
matchingGame.deck = [
	'cardAK', 'cardAK',
	'cardAQ', 'cardAQ',
	'cardAJ', 'cardAJ',
	'cardBK', 'cardBK',
	'cardBQ', 'cardBQ',
	'cardBJ', 'cardBJ',	
];

// DOM������Ϻ�$(function(){})�еĴ�������
$(function(){	
	//���¿�ʼ��ť����ˢ��ҳ��
	$("#res1").click(function(){
			localStorage.removeItem("savingObject");
			window.location.href = window.location.href;
	});
	//�����¼��ť
	$("#res2").click(function(){
			localStorage.removeItem("last-score");
	});
	
	// ϴ�ƣ�matchingGame.deck����shuffle��������ִֵ��sort����
	matchingGame.deck.sort(shuffle);
	
	// ���´������������
	var savedObject = savedSavingObject();
	if (savedObject != undefined)
	{
		matchingGame.deck = savedObject.deck;
	}
	
	// �����鸴�Ƶ���������С�
	matchingGame.savingObject.deck = matchingGame.deck.slice();
	//��JS��slice()�����������е������з���Ԫ��
	
	// ��¡12�ſ�ƬDOM�ĸ���
	for(var i=0;i<11;i++){
		$(".card:first-child").clone().appendTo("#cards");
		//��JQ��clone()��������¡����Ԫ��  ��JQ��appendTo()�������ڱ�ѡԪ�صĽ�β(������Ԫ�ص��ڲ�)����ָ��������
	}
	
	// ��ʼ��ÿ�ſ�Ƭ
	$("#cards").children().each(function(index) {
		//��JQ��children()���������ر�ѡԪ�ص�����ֱ����Ԫ�ء�
		//��JQ��each() ����: ���ڱ���ָ���Ķ�������顣
		// ����Ƭ���룬ʹ��Ϊ4x4��
		$(this).css({
			"left" : ($(this).width()  + 20) * (index % 4),
			"top"  : ($(this).height() + 20) * Math.floor(index / 4)
		});
		
		// ��ϴ���������еõ�һ��ͼ��
		var pattern = matchingGame.deck.pop();
		//��JS��pop()����������ɾ����������һ��Ԫ�ز�����ɾ����Ԫ�ء�
		
		// ��ͼ��Ӧ���ڿ�Ƭ�ı���
		// ͼ��pattern��ֵʵ������һ��CSS�࣬������Ӧ���˿���ͼ��
		$(this).find(".back").addClass(pattern);
		//��JQ��find()���������ر�ѡԪ�صĺ��Ԫ�� ��JQ��addClass()��������ѡԪ�����һ������������

		// ��ͼ��������Ƕ�뵽DOM��Ԫ����
		$(this).data("pattern",pattern);
		//��JQ��data()��������ѡԪ�ظ�������
		
		// ��ѭ������index���浽DOMԪ���У����������Ժ��֪���������ſ��ˡ�
		$(this).attr("data-card-index",index);
						
		// ÿ����Ƭ DIVԪ���ϵ�click�¼�ʱִ��selectCard������
		$(this).click(selectCard);				
	});
	
	// �Ƴ��ڴ洢�������Ѿ��Ƴ��Ŀ�Ƭ
	if (savedObject != undefined)
	{
		matchingGame.savingObject.removedCards = savedObject.removedCards; 
		for(var i in matchingGame.savingObject.removedCards)
		{			
			$(".card[data-card-index="+matchingGame.savingObject.removedCards[i]+"]").remove();
		}
	}

	// ��������ʱ��
	matchingGame.elapsedTime = 0;
	
	// ��ԭ���������ʱ��
	if (savedObject != undefined)
	{
		matchingGame.elapsedTime = savedObject.currentElapsedTime; 
		matchingGame.savingObject.currentElapsedTime = savedObject.currentElapsedTime;
	}
			
	// ������ʱ��
	matchingGame.timer = setInterval(countTimer, 1000);

});

// ��ʱ��
function countTimer()
{

	matchingGame.elapsedTime++;
	
	// ����ʱ������ʱ�䱣���savingObject.
	matchingGame.savingObject.currentElapsedTime = matchingGame.elapsedTime;
		
	// ת������
	var minute = Math.floor(matchingGame.elapsedTime / 60);
	var second = matchingGame.elapsedTime % 60;	
	
	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	
	// ��ʵ��սʱ��
	$("#elapsed-time").html(minute+":"+second);
	
	// ִ��saveSavingObject �������
	saveSavingObject();
}



function selectCard() {
	// �Ѿ��������Ʊ�����ʱ��ִ���κβ���
	if ($(".card-flipped").size() > 1)
	{
		return;
	}
	
	// ��� "card-flipped" ��.
	// ��������ڵ�ǰ״̬�Ϳ�Ƭ��ת״̬֮��������ʽ������
	$(this).addClass("card-flipped");
	
	// 0.5��������ŷ�ת���Ƶ�ͼ����
	if ($(".card-flipped").size() == 2)
	{
		setTimeout(checkPattern,500);
	}
}
// ����������Ƿ���ͬ��ִ�в���
function checkPattern()
{
	if (isMatchPattern())
	{
		play1();//ִ��play1() ������ƥ��ɹ���Ч��
		
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		
		// ת����ɺ�ɾ������DOM�ڵ㡣
		$(".card-removed").bind("webkitTransitionEnd", removeTookCards);
	}
	else
	{
		play2(); //ִ��play2() ������ƥ��ʧ����Ч��
		$(".card-flipped").removeClass("card-flipped");
	}
}
// ����������Ƿ�ƥ�䣬���ز�������ֵ
function isMatchPattern()
{
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}

// һ���ܹ�����һ��-0.5��0.5�ڵ�������ĺ���
function shuffle()
{
	// ��matchingGame.deck.sort����������з���һ���������
	// sort�������������������͸�������
	// Math.random() ��Χ��0-1, 0.5 - Math.random() ���������������Ǹ���.	
	return 0.5 - Math.random();
}



// ɾȥ�Ѿ����Ƴ��Ŀ�
function removeTookCards()
{
	// ��ÿ���Ѿ����Ƴ��Ŀ�����ӵ������洢�Ѿ����Ƴ��Ŀ��Ƶ����鵱��
	$(".card-removed").each(function(){
		matchingGame.savingObject.removedCards.push($(this).data("cardIndex"));
		$(this).remove();
	});		
	
	// ��鿨���Ƿ��Ѿ���գ�����ǣ�ִ��gameover()
	if ($(".card").length == 0)
	{
		gameover();
	}
	
}

//��Ϸ����
function gameover()
{
	// ֹͣ��ʱ��
	clearInterval(matchingGame.timer);
	
	// ��ʾ����ʱ��
	$(".score").html($("#elapsed-time").html());
	
	// ���ش洢�е���ʷ��¼��Ϣ
	var lastScore = localStorage.getItem("last-score");
	
	// ����Ƿ�û����ʷ��¼
	lastScoreObj = JSON.parse(lastScore);
	if (lastScoreObj == null)
	{
		// ���û����ʷ��¼���ȴ���һ���ռ�¼
		lastScoreObj = {"savedTime": "no record", "score": 0};
	}	
	var lastElapsedTime = lastScoreObj.score;
		
	// ����Ƿ����¼�¼���������ʵ�¼�¼ͼ�겢�޸ļ�¼�洢
	if (lastElapsedTime == 0 || matchingGame.elapsedTime < lastElapsedTime)
	{
		$(".ribbon").removeClass("hide");
		// ��ȡ��ǰʱ��
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
		//����洢��¼ʱ��Ķ���
		var obj = { "savedTime": now, "score": matchingGame.elapsedTime};
		// ����¼��������ش洢
		localStorage.setItem("last-score", JSON.stringify(obj));
	}
	lastScore = localStorage.getItem("last-score");
	lastScoreObj = JSON.parse(lastScore);
	lastElapsedTime = lastScoreObj.score;
	// ת�������ʽ
	var minute = Math.floor(lastElapsedTime / 60);
	var second = lastElapsedTime % 60;	
	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	// ��ʾ��սʱ��
	$(".last-score").html(minute+":"+second);
	// ��ʾ��¼
	var savedTime = lastScoreObj.savedTime;
	$(".saved-time").html(savedTime);

	//��ʾ��Ϸ�����ĵ���
	$("#popup").removeClass("hide");
	
	play3();//ִ��play3()��������Ϸ�ɹ���Ч��

	//�����¼��ť
	$("#res4").click(function(){
			localStorage.removeItem("last-score");
			$(".last-score").html("00:00");
			$(".saved-time").html("no record");
	});

	// ���savingObject�洢
	localStorage.removeItem("savingObject");

	//������Ϸ��ť
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


//��savingObject��������JSON�ַ������洢
function saveSavingObject()
{
	
	localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
}

//��JSON�ַ������savingObject���� ������
function savedSavingObject()
{
	
	var savingObject = localStorage["savingObject"];
	if (savingObject != undefined)
	{
		savingObject = JSON.parse(savingObject);
	}
	return savingObject;
}
