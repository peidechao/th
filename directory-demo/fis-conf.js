/*
* 项目目录
* components   (用来放内部编写的一些公有函数)
*       --common
*           --host-config.js    （配置调试IP）
*           --url.js    （配置项目内页面路径）
*           --common.js     （一些基础功能能函数封装）
*       --widget    （用来存放一些插件）
* lib   (用来存放外部获取的库,如jquery，bootstr)
*       --js
*       --styles
* views  (页面)
* */


/*
配置项目名，若是在同一服务器根目录下有多个项目，可以将路径加到项目名里
eg：www/ 根目录
      --川渝 子目录
     --云南  子目录
设置云南对应下的某个项目为
     fis.config.set('project',"云南/项目名");
*/
fis.config.set('project',"demo1");

/*
 * 配置rquire模块路径
 * */
fis.hook('amd',{
    /*baseUrl: './',*/
    paths: {
        $:"lib/js/jQuery.2.1.4.min",
        avalon:"lib/js/avalon.shim"
    },
    shim: {
        /* 'comp/2-0/2-0.js': {
         deps: ['jquery'],
         exports: 'myFunc'
         }*/
    }
});

//将 fis3 编译产出到指定目录
fis.match('**', {
   deploy: fis.plugin('local-deliver', {
         to: 'e:\\website\\AppServ\\www\\'
   })
 })
