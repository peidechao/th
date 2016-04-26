/**
 * dialog
 * 弹出层组件，主要功能：
 *      1.可自定义控制显示背景遮罩层，关闭图标按钮，自定义弹框标题与按钮；
 *      2.显示与关闭弹出窗都有回调接口；
 *      3.支持自定义元素及事件绑定。
 *      4.扩展了二个简便调用函数:
 *			msgDialog:	用于简单展示文字信息类，点击确认按钮关闭，无绑定函数操作；
 *			simpleDialog:	用于简单展示文字信息类，确认和取消按钮都可绑定回调函数;
 * @param options (配置项，值类型：Object,可配置参数及功能如下)
 *      id:string  必配项，配置弹窗名字，以此区分及定位弹窗;
 *      className:string 可配项，自定义类名，用来覆盖初始类名样式，在功能需求相同时可以按照需求来显示不同的界面;
 *      bgSwitch:boolean 可配项，背景遮罩层控制开关;
 *      closeSwitch:boolean 可配项，关闭图标控制开关;
 *      tip:boolean 可配项，显示后是否自动关闭;
 *      bgFn:boolean 可配项，点击背景层是否关闭;
 *      title:string 可配项，配置弹窗标题；
 *      content:string 可配项，弹窗主体显示的内容;
 *      footer:array 可配项，数组元素为object，配置弹窗按钮文字及对应类名，对应配置名如下:
 *          name:string 按钮要显示的文字；
 *          className:string 可配项,此按钮类名。
 *      blindEvent:array 可配项，数组元素为object，配置弹窗内元素的事件，对应配置名如下：
 *          ele:string 元素；
 *          type:string 事件类型，如“click,mousehover”等；
 *          fn:function 触发后执行的函数。
 * @return 返回一个对象，具体返回值如下：
 *      el:DOM元素，指向这个弹窗；
 *      options：object,配置的具体值；
 *      open:function ，显示弹出层，可配回调函数；
 *      close:function，关闭弹出层，可配回调函数。
 * Created by pdc on 2015/10/3.
 */
'use strict';
(function(root,factory){
	if(typeof define ==="function" && (define.amd||define.cmd)){
		define(factory);
	}else{
		root.app=root.app||{};
		root.app=factory();
	}
})(this,function(){
	var DOC=document;
	var currZIndex= 0,
		H=window.innerHeight,
		bodyH=DOC.body.clientHeight;

	//IE9不兼容classList，做处理
	if (!("classList" in document.documentElement)) {
		Object.defineProperty(HTMLElement.prototype, 'classList', {
			get: function() {
				var self = this;
				function update(fn) {
					return function(value) {
						var classes = self.className.split(/\s+/g),
							index = classes.indexOf(value);

						fn(classes, index, value);
						self.className = classes.join(" ");
					}
				}

				return {
					add: update(function(classes, index, value) {
						if (!~index) classes.push(value);
					}),

					remove: update(function(classes, index) {
						if (~index) classes.splice(index, 1);
					}),

					toggle: update(function(classes, index, value) {
						if (~index)
							classes.splice(index, 1);
						else
							classes.push(value);
					}),

					contains: function(value) {
						return !!~self.className.split(/\s+/g).indexOf(value);
					},

					item: function(i) {
						return self.className.split(/\s+/g)[i] || null;
					}
				};
			}
		});
	}

	function getEle(ele){
		return DOC.querySelector(ele);
	}

	function __dialog(options){
		this.options={
			bgSwitch:true
		};
		for(var name in options){
			this.options[name]=options[name];
		}
		this.__creat();
	}
	__dialog.prototype={
		constructor:__dialog,
		__creat:function(){
			var frag=DOC.createDocumentFragment(),
				modal=DOC.createElement("article"),
				modalWrap=DOC.createElement("div"),
				OP=this.options,
				str,
				_this=this,
				cb=(function(){//防止在短时间内多次点击，确保只执行一次；
					var bool=true,i=0;
					return function(e){
						if(bool&&e.target.id==_this.options.id){
							bool=false;
							_this.close.call(_this);
							setTimeout(function(){bool=true},700);
						}
					}
				})();
			modal.id=OP.id;
			modal.className=OP.className?"dialog "+OP.className:"dialog";
			modalWrap.className="dialog-wrap";
			str=OP.title?"<div class='dialog-head'><h5>"+OP.title+"</h5></div>":"";
			if(OP.content){
				str+="<div class='dialog-content'>"+OP.content+"</div>"
			}
			if(OP.footer){
				str+="<div class='dialog-footer'>"+(function(){
						var str="";
						for(var i= 0,l=OP.footer.length;i<l;i++){
							if(OP.footer[i].name){
								str+="<button type='button'";
								OP.footer[i].className&&(str+="class="+OP.footer[i].className);
								str+=">"+OP.footer[i].name+"</button>"
							}
						}
						return str;
					})()+"</div>";
			}
			if(OP.closeSwitch){
				str+="<div class='dialog-close'><i class='font-icon close'></i></div>"
			}
			modalWrap.innerHTML=str;
			modal.appendChild(modalWrap);
			frag.appendChild(modal);
			this.el&&(DOC.body.removeChild(this.el),this.el=null);
			DOC.body.appendChild(frag);
			this.el=getEle("#"+OP.id);
			if(OP.bgFn){
				this.el.addEventListener("click",cb,false)
			}
		},
		__open: function (callBack) {
			var _this=this,
				el=this.el,
				OP=this.options,
				dialogWrap=el.querySelector(".dialog-wrap"),
				elHeight,
				scrollHeight=DOC.body.scrollTop,

				hasBlind=(function(){
					var bool=true;
					return function(){
						if(bool){
							bool=false;
							return !bool;
						}
						return bool
					}
				})();
			el.style.display="block";
			elHeight=dialogWrap.clientHeight;
			if(elHeight<=H){//弹出层高度小于等于窗口高度时
				dialogWrap.style.top=(scrollHeight+(H-elHeight)/2)+"px";
			}else if(H<elHeight&&H>=bodyH){//弹出层高度大于窗口高度并且文档高度小于窗口高度时
				dialogWrap.style.height=H-40+"px";
				dialogWrap.style.top="20px";
			}else if(H<elHeight&&elHeight<bodyH-scrollHeight){//弹出层高度大于窗口高度并且小于剩余文档高度
				dialogWrap.style.top=scrollHeight+Math.min((bodyH-scrollHeight-elHeight)/2,20)+"px";
			}else if(H<elHeight&&elHeight>=bodyH-scrollHeight){//弹出层高度大于窗口高度并且大于剩余文档高度
				dialogWrap.style.height=(bodyH-scrollHeight-40)+"px";
				dialogWrap.style.top=(scrollHeight+Math.min((H-bodyH+scrollHeight+40)/2,20))+"px";
			}
			el.classList.add("in");
			if(OP.blindEvent){
				for(var i= 0,l=OP.blindEvent.length;i<l;i++){
					var array=OP.blindEvent[i];
					el.querySelector(array.ele).addEventListener(array.type,array.fn,false);
				}
			}
			callBack&&typeof callBack=="function"&&callBack();
			var Time;
			if(Time){
				clearTimeout(Time);
				Time=null;
			}
			Time=setTimeout(function(){
				el.classList.remove("in");
			},700);
			if(OP.tip){
				var time;
				if(time){
					clearTimeout(time);
					time=null;
				}
				time=setTimeout(function(){
					_this.close.call(_this);
				},2500)
			}
		},
		__close:function(callBack){
			var el=this.el,
				OP=this.options;
			el.classList.add("out");
			callBack&&typeof callBack=="function"&&callBack();
			if(OP.blindEvent){
				for(var i= 0,l=OP.blindEvent.length;i<l;i++){
					var array=OP.blindEvent[i];
					el.querySelector(array.ele).removeEventListener(array.type,array.fn,false);
				}
			};
			var Time;
			if(Time){
				clearTimeout(Time);
				Time=null;
			}
			Time=setTimeout(function(){
				el.classList.remove("out");
				el.style.display="none";
			},700);
		}
	};

	var DIALOG=(function(){
		var obj={},
			bgIndex=[];
		function showBg(){
			var bg=getEle(".modal-bg");
			if(!bg){
				var div=DOC.createElement("div");
				div.className="modal-bg"	;
				DOC.body.appendChild(div);
				bg=getEle(".modal-bg")
			}
			bg.style.display="block";
			bg.style.zIndex=currZIndex-50;
		}
		function closeBg(){
			var bg=getEle(".modal-bg");
			if(!bg){return}
			if(bgIndex.length>0){
				bg.style.zIndex=bgIndex[bgIndex.length-1]-50;
				return;
			}
			var Time;
			if(Time){
				clearTimeout(Time);
				Time=null;
			}
			Time=setTimeout(function(){
				bg.style.display="none";
			},700)
		}
		return {
			dialog:function(options,isMsg){
				if(!options||!options.id){
					console.log("配置参数的id是必要的");
					return
				}
				var Id=options.id,
					newDialog;
				if(!obj[Id]){
					newDialog=new __dialog(options);
					obj[Id]={};
					obj[Id].dialog=newDialog;
				}else{
					newDialog=obj[Id].dialog;
					if(isMsg=="msg"){
						newDialog.el.querySelector(".dialog-content").innerHTML=options.content;
					}else{
						var creatAgain=false;
						for(var name in options){
							if(options[name]!==newDialog.options[name]){
								newDialog.options[name]=options[name];
								creatAgain=true;
							}
						}
						if(creatAgain){
							newDialog.__creat()
						}
					}
				}
				newDialog.open=function(callBack){
					newDialog.__open(callBack);
					currZIndex+=100;
					for(var dialogs=DOC.querySelectorAll(".dialog"),l=dialogs.length;l>0;l--){
						dialogs[l-1].classList.remove("activeDialog")
					}
					newDialog.el.style.zIndex=currZIndex;
					newDialog.el.classList.add("activeDialog");
					newDialog.options.bgSwitch&&(bgIndex.push(currZIndex),showBg());
				};
				newDialog.close=function(callBack){
					newDialog.__close(callBack);
					currZIndex-=100;
					newDialog.el.classList.remove("activeDialog");
					newDialog.options.bgSwitch&&( bgIndex.pop(),closeBg());
				};
				return newDialog;
			},
			tipDialog:function(msg){
				var _msgDialog=this.dialog({
					id:"tipDialog",
					className:"tipDialog",
					bgSwitch:false,
					tip:true,
					closeSwitch:false,
					bgFn:false,
					content:"<div class='tipDialog-con'>"+msg+"</div>"
				},"msg");
				_msgDialog.open();
			},
			msgDialog:function(msg){
				var _msgDialog=this.dialog({
					id:"msgDialog",
					className:"msgDialog",
					bgSwitch:false,
					closeSwitch:false,
					bgFn:false,
					content:"<div class='msgDialog-con'>"+msg+"</div>",
					footer:[
						{name:"确定",className:"msgDialogBtn"}
					],
					blindEvent:[
						{
							ele:".msgDialogBtn",
							type:"click",
							fn:function(){
								_msgDialog.close();
							}
						}
					]
				},"msg");
				_msgDialog.open();
			},
			simpleDialog:function(msg,sureFunction,cancleFunction){
				var _simpleDialog=this.dialog({
					id:"simpleDialog",
					className:"simpleDialog",
					closeSwitch:false,
					bgFn:false,
					content:"<div class='simpleDialog-con'>"+msg+"</div>",
					footer:[
						{name:"确定",className:"simpleDialogSureBtn"},
						{name:"取消",className:"simpleDialogCancleBtn"}
					],
					blindEvent:[
						{
							ele:".simpleDialogSureBtn",
							type:"click",
							fn:function(){
								_simpleDialog.close(sureFunction);
							}
						},
						{
							ele:".simpleDialogCancleBtn",
							type:"click",
							fn:function(){
								_simpleDialog.close(cancleFunction);
							}
						}
					]
				});
				_simpleDialog.open();
			}
		}
	})();
	return DIALOG;
}) 