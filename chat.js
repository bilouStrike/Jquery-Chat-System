var nwin = 0;
var width = 0;
var chatboxwithnb = 0;
var audio;
var windowFocus;
var messageUsr = '';
var bool = false;
var getUrl = window.location;
var base_url = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1] + "/" ;
var boxOpened = new Array();
$(document).ready(function(){
	$([window]).blur(function(){
		 	windowFocus = false;
        	 loadchat(windowFocus);	 
		}).focus(function(){
		windowFocus = true;
		chatBoxOpen();
	    loadchat(windowFocus);	 
 	    minimized_chat_box();
	});
});
var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();
function loadchat(windowFocus){
    var visible = vis();
	getMessages = function(){
	$.getJSON(base_url+'chat/get',function(data){
	    if(data!='')
		{
		   	starchat(data[0]['user_chat'] , data[0]['from_user'] );
			play_audio();
			placedata(data);
		}
	    });
		setTimeout(function(){
	    	getMessages();
	    },5000);
	 }
	if(windowFocus == true)
	{
    	 getMessages();
	}
}
function placedata(data)
{
	$('#chat_body_text-'+data[0]['user_chat']+'_'+data[0]['from_user'])
	.append('<div class="chat_msg"><img class="img_user" src="'+base_url+'/img/128.png"/><div class="triangle-left"></div><div class="medai-body msg-text"><h5 class="media-heading">'+data[0]['user_chat']+'</h5><p>'+data[0]['message']+'</p></div></div>');   
	    var scrolltoh = $('#chat_body_text-'+data[0]['from_user'])[0].scrollHeight;
        $('#chat_body_text-'+data[0]['user_chat']+'_'+data[0]['from_user']).scrollTop(scrolltoh); 
		if($(".chat_body_"+data[0]['user_chat']+'_'+data[0]['from_user']).css('display')== 'none' )
		{ 
		  $('#notifi-'+data[0]['user_chat']+'_'+data[0]['from_user']+'').addClass('notification').html('1').animate({top:30 ,bottom : 30},100000);
		}
}
function showhidechat(username,user_id)
{
  	var toggleState = $(".chat_body_"+username+'_'+user_id).css('display');
  	if(toggleState == 'block')
    {
		var box_id = username+'_'+user_id;
		if($.cookie('box_minimized'))
		{
			box_id += '|'+$.cookie('box_minimized');
		}
		$.cookie('box_minimized', box_id,{ path : '/'}  );
		$(".chat_body_"+username+"_"+user_id).css('display','none');
    }
	else
	{ 
		var arr = new Array();
		var box_id = '';
		var size = 0;
		if($.cookie('box_minimized'))
		{
			arr = $.cookie('box_minimized').split(/\|/);
		}
		size  = objSize (arr);
		for (j=0; j< size ; j++)
		{ 
		  if(arr[j] != username+'_'+user_id)
			{
			  box_id += arr[j]+'|';
			}
		}
    	box_id = box_id.slice(0, -1);
	    $.cookie('box_minimized', box_id,{ path : '/'}  );
        $(".chat_body_"+username+"_"+user_id).css('display','block');
		$('#notifi-'+username+'_'+user_id).removeClass('notification').html('');
    }
}
function minimized_chat_box()
{
	var arr_box = new Array();
	var arr_size = 0;
	if($.cookie('box_minimized'))
	{
	  	arr_box = $.cookie('box_minimized').split(/\|/);
	}
	arr_size = objSize(arr_box);
	for (i = 0; i < arr_size ; i++) 
	{
	   $(".chat_body_"+arr_box[i]).css('display','none');
	}
}
var objSize = function(obj) {
    var count = 0;
    if (typeof obj == "object") {
    
        if (Object.keys) {
            count = Object.keys(obj).length;
        } else if (window._) {
            count = _.keys(obj).length;
        } else if (window.$) {
            count = $.map(obj, function() { return 1; }).length;
        } else {
            for (var key in obj) if (obj.hasOwnProperty(key)) count++;
        }
    } 
    return count;
}
function starchat(username,user_id)
{
	var dt = '';
	var oldmsg = '';
	var user_id = user_id ;
    $.ajax({
     	type:'post',
	 	url:base_url+'chat/starChatWith',                  
	 	data:'with='+user_id,                                       
	 	dataType:'json',
	 	cache:false, 
	 	success:function(data){
		}		
	});	
	$.ajax({
     	type:'post',
	 	url:base_url+'chat/history',                  
	 	data:'with='+user_id,                                       
	 	dataType:'json',
	 	cache:false, 
	 	success:function(data){
		if(data){	
			$.each(data.items.reverse(),function(i,v){
		  	if(v.s==1)
		  	{
				oldmsg+='<div class="chat_msg_right"><div class="triangle-right"></div><div class="medai-body msg-text-right"><p>'+v.m+'</p></div></div>';
		  	} else
		 	{
				oldmsg+='<div class="chat_msg"><img class="img_user" src="'+base_url+'/img/128.png"/><div class="triangle-left"></div><div class="medai-body msg-text"><h5 class="media-heading">'+v.to+'</h5><p>'+v.m+'</p></div></div>';
		  	} 
			});
	    }
	 	createnewchat(username,oldmsg,user_id);
	}
	});
}	
function chatBoxOpen()
{
	$.getJSON(base_url+'chat/GetChatBox',function(data){
      $.each(data ,function (i,v)
		{
		   var u = v.split("|");
		   starchat( u[0] , u[1] );
		}
	  );
	});
}
function closeChat(username,user_id)
{
    var datas = 'with='+ username +'&id='+ user_id;
	$.ajax({
	    type:'post',
		url:base_url+'chat/ChatOff',                                                
		data : datas, 
		dataType:'json',
		cache:false, 
			 success:function(data){
			}		
		});
		$('#chat_box'+username+'_'+user_id).css('display','none');
	nwin--;
}
function chat(event,textarea,username,user_id){
	if(event.keyCode == 13 && event.shiftKey == 0)  {
	   	message = $(textarea).val();
		message = message.replace(/^\s+|\s+$/g,"");
		post_data = {'to':user_id,'message':message};
		$(textarea).val('');
		$(textarea).focus();
		$.post(base_url+'chat/send',post_data,function(data) {
		$('#chat_body_text-'+username+"_"+user_id)
		.append('<div class="chat_msg_right"><div class="triangle-right"></div><div class="medai-body msg-text-right"><p>'+message+'</p></div></div>');
	        var scrolltoh = $('#chat_body_text-'+username+"_"+user_id)[0].scrollHeight;
	        $('#chat_body_text-'+username+"_"+user_id).scrollTop(scrolltoh);          
	        })
		return false;
	}
}
function createnewchat(username,oldmsg,user_id)
{
	var arr1 = new Array();
	var arr1_size = 0; var pt = 0;
	if ($("#chat_box"+username+"_"+user_id).length > 0) {
		if ($("#chat_box"+username+"_"+user_id).css('display') == 'none') {
			$("#chat_box"+username+"_"+user_id).css('display','block');
		}
		if($.cookie('box_minimized'))
	    {
	  		arr1 = $.cookie('box_minimized').split(/\|/);
	    }
		arr1_size = objSize(arr1);
	    for (i = 0; i < arr1_size ; i++) 
	    {
		    if(username+'_'+user_id == arr1[i])
		    {
			  pt++;
		    }	
	    }
		if(pt == 0)
		{
		  $(".chat_body_"+username+"_"+user_id).css('display','block');
		}
	} 
	else
	{
		$("<div />").attr("id","chat_box"+username+"_"+user_id)
		.addClass("chatbox")
	    .html('<audio id="audio"><source src="'+base_url+'sound/notife.mp3" type="audio/mpeg"></audio><div class="chat_header bg-blue"><div class="chat_tools"><span id="notifi-'+username+'_'+user_id+'"></span><a onclick="javascript:closeChat(\''+username+'\',\''+user_id+'\');" href="javascript:void(0)" data-widget="collapse" class="btn btn_chat_tools"> <i class="fa fa-remove"></i></a>     <a onclick="javascript:showhidechat(\''+username+'\',\''+user_id+'\');" href="javascript:void(0)" data-widget="remove" class="btn btn_chat_tools"> <i class="fa fa-minus"></i></a></div><h4>'+username+'</h4></div><div class="chat_body_'+username+'_'+user_id+'"><div class="chat_body_text" id="chat_body_text-'+username+'_'+user_id+'">'+oldmsg+'</div><div class="chat_footer"><div class="form-group"><textarea name="message" onkeydown="javascript:chat(event,this,\''+username+'\',\''+user_id+'\');" placeholder="ابدأ بالدردشة ..." class="form-control" type="text"></textarea></div></div></div></div>')
		.appendTo($("body"));
		width = nwin*290+20;
		$("#chat_box"+username+"_"+user_id).css('right',width+'px');
		$('#chat_body_text-'+username+"_"+user_id).css('height','200px');
		 nwin++;
	}
	$("#chat_body_text-"+username+"_"+user_id).html(oldmsg);
	var scrolltoh = $('#chat_body_text-'+username+"_"+user_id)[0].scrollHeight;
    $('#chat_body_text-'+username+"_"+user_id).scrollTop(scrolltoh); 
}
function play_audio(){
	audio = document.getElementById('audio');
	audio.play();
}
