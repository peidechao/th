/**
 * Created by pdc on 2016/4/10.
 */

var $=require("$"),
    url=require("url"),
    host=require("host-config"),
    dialog=require("dialog");
    var debug=true,
        rword = /[, ]+/g,
        DOC=document;

    var loading=(function(){
        var count= 0,
            div,
            imgSrc=__uri('images/loading.gif?__inline');
        return {
            show:function(target){
                var target=target||"body",parent=$(target),
                    loader=div;
                if(count<1){
                    if(!loader){
                        div=DOC.createElement("div");
                        div.className="loader";
                        div.innerHTML="<img src="+imgSrc+">"
                    }
                    parent[0].appendChild(div);
                }
                count++;
            },
            hide:function(target){
                var target=target||"body",parent=$(target),
                    loader=div;
                if(count<=1&&loader){
                    parent[0].removeChild(loader)
                }
                count--;
            }
        };
    })();
    function setCookie(c_name,value,expiredays){
        var exdate=new Date()
        exdate.setDate(exdate.getDate()+expiredays)
        DOC.cookie=c_name+ "=" +decodeURI(value)+
            ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
    }
    function getCookie(cookieName){
        var start = DOC.cookie.indexOf(cookieName+"=");
        if (start ==-1) {return "";}
        start = start+cookieName.length+1;
        var end = DOC.cookie.indexOf(";",start);
        if (end==-1) {end = DOC.cookie.length;}
        return decodeURIComponent(DOC.cookie.substring(start,end));
    }
    //存储键值对
    function storeValue(key,value,type){
        var type=type||"url";
        switch(type){
            case "url":
                return "&"+encodeURIComponent(key)+"="+encodeURIComponent(value);
            case "local":
                if(!window.localStorage){
                    return false;
                }
                localStorage.setItem(host.prefix+key,value);
                break;
            case "session":
                if(!window.sessionStorage){
                    return false;
                }
                sessionStorage.setItem(host.prefix+key,value);
                break;
            case "cookie":
                setCookie(host.prefix+key,value);
                break;
        }
    };
    //提取值
    function getValue(key,type){
        var type=type||"url";
        switch(type){
            case "url":
                return getParamValue(key);
                break;
            case "local":
                return localStorage.getItem(host.prefix+key);
                break;
            case "session":
                return sessionStorage.getItem(host.prefix+key);
                break;
            case "cookie":
                return getCookie(host.prefix+key);
                break;
        }
    };
    //删除值
    function deleteValue(key,type){
        var type=type||"all";
        if(!key){
            localStorage.clear();
            sessionStorage.clear();
            return;
        }
        switch(type){
            case "all":
                localStorage.removeItem(host.prefix+key);
                sessionStorage.removeItem(host.prefix+key);
                setCookie(host.prefix+key,"",-1);
                break;
            case "local":
                localStorage.removeItem(host.prefix+key);
                break;
            case "session":
                sessionStorage.removeItem(host.prefix+key);
                break;
            case "cookie":
                setCookie(host.prefix+key,"",-1);
                break;
        }
    };

    //url中提取值辅助函数
    function getUrlparams(){
        var src=window.location.search,
            arr=src.substr(1,src.length-1).split("&"),
            returnObj={};
        if(arr!==null){
            for(var i=0,l=arr.length;i<l;i++){
                var value=arr[i].split("=");
                if(value&&value.length>1){returnObj[decodeURIComponent(value[0])]=decodeURIComponent(value[1])}
            }
        }
        return returnObj;
    };
    //url中提取值
    function getParamValue(name){
        var param=getUrlparams();
        if(param[name]){
            return param[name];
        }
        return null;
    }
    //调试信息打印
    function log(){
        if (window.console &&debug) {
            Function.apply.call(console.log, console, arguments)
        }
    }
    function linkTo(name,obj,location){
        if(url[name]){
            var Url=url[name].url+".html?",
                _window=this.window||window;
           // LINK[name].js&&(Url+="&js=1");
            if(obj){
                for(var _name in obj){
                    Url+="&"+encodeURIComponent(_name)+"="+encodeURIComponent(obj[_name]);
                }
            }
            _window.location.href=location?location+Url:"../"+Url;
        }
    }
    //接口调用控制
    function useApi(apiName,apiSource){
        var source=apiSource||{},
            apiObj=source[apiName];
        if(!apiObj){
            log("未找到"+apiName+"接口相关数据");
            return false;
        }
        var competence=(apiObj.competence&&apiObj.competence)||true;
        if(competence){
            return {
                url:host.port+apiObj.url,
                data: function () {
                    var str=apiObj.param,
                        _data={};
                    if(str){
                        str=str.split(rword);
                        var len=str.length,
                            pop=Array.prototype.pop;
                        while(str[len-1]){
                            var name=str[len-1],
                                value=pop.apply(arguments);
                            _data[name]=value=="undefined"?"":value;
                            len--;
                        }
                    }
                    return _data;
                }
            }
        }else{
            apiObj.error&&apiObj.error();
        }
    }

    //封装带有loading图标的ajax请求
    function loadAjax(param){
        loading.show();
        return $.ajax({
            type:param.type||"post",
            url:param.url,
            data:param.data,
            async:param.async||true
        }).fail(
            function(data){
                if(data.msg){
                    dialog.tipDialog(data.msg)
                }
            }
        ).always(
            function(date){
                loading.hide();
                param.complete&&param.complete(date);
            }
        )
    }

    //MODULE生成对应返回接口工厂函数
    function moduleFactory(data){
        var obj={};
        $.each(data,function(name,value){
            obj[name]=function(){
                var api=useApi(name,data);
                if(data[name].fn){
                    return data[name].fn.call(this,api.url,api.data.apply(this,arguments))
                }else{
                    return loadAjax({
                        url:api.url,
                        data:api.data.apply(this,arguments)
                    })
                }
            }
        })
        return obj;
    }

    var num={
        format:function (num,options) {
            var opt = {
                    type: "division",//类型：intercept  截取  ；division  分割  ;
                    section: 3,//处理区间长度
                    separator: ","//分隔符
                },
                type = typeof(options);
            switch (type) {
                case "string":
                    options == "intercept" ? (opt.type = options, opt.separator = "0") : opt.separator = options;
                    break;
                case "number":
                    opt.section = options
                    break;
                case "object":
                    for (var i in opt) {
                        options[i] && (opt[i] = options[i])
                    }
                    break;
            }
            var _se = opt.section - 1,
                num = (num + "").split(""),
                l = num.length,
                _num = "";
            if (opt.type == "division") {
                while (l) {
                    _num = num.pop() + _num;
                    if (_se) {
                        _se -= 1
                    } else {
                        l !== 1 && (_num = opt.separator + _num);
                        _se = opt.section;
                    }
                    l--
                }
            } else {
                while (_se) {
                    var str = num.pop();
                    _num = (str ? str : opt.separator) + _num;
                    _se--;
                }
            }
            return _num;
        },
        digita:function(num,separator){
            var separator=separator||",",
                _num=num.split(separator),
                l=_num.length,
                value="";
            while(l){
                value=(_num.pop()+"")+value;
                l--
            }
            return parseInt(value,10);
        }
    };

    return {
        storeValue:storeValue,
        getValue:getValue,
        deleteValue:deleteValue,
        useApi:useApi,
        moduleFactory:moduleFactory,
        num:num
    }
