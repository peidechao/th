//vi foo/index.js
var fis = module.exports =  require('fis3');

fis.require.prefixes.unshift('th1');
fis.cli.name = 'th1';
fis.cli.info = require('./package.json');
fis.cli.version = require('./version.js');

fis.match('::package', {
  // npm install [-g] fis3-postpackager-loader
  // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
  postpackager: fis.plugin('loader', {
    resourceType: 'amd',
    useInlineMap: true // 资源映射表内嵌
  })
});


//启用 lint 插件进行代码检查
/*fis.match('*.js', {
  lint: fis.plugin('js', {
  })
});*/
//转换less文件
/* fis.match('*.less', {
 parser: fis.plugin('node-less'), //启用fis-parser-less插件
 rExt: '.css'
 });*/
//转换sass文件
fis.match('*.scss', {
  parser: fis.plugin('node-sass'), //启用fis-parser-node-sass插件
  rExt: '.css'
});

fis.match(/^\/(views\/modules|components)\/.*?([^/]+)\.js$/, {
    isMod: true,
    moduleId:"$2",
    id: '$2'
 });

/*fis.match('**', {
 useMap: false,
 useHash: false
 });*/

//用来控制合并时的顺序，值越小越在前面。配合 packTo 一起使用。
fis.match('/{views,components}/**.css', {
    useSprite: true,
    packTo:"/${project}/static/style.css",
    release:"/${project}/static/style.css"
});
fis.match('/components/common/reset.css', {
    packOrder: -100
});

fis.match('/components/common/**.js', {
    packTo:"/${project}/static/app.js",
    release:"/${project}/static/app.js"
});
fis.match('/lib/**', {
    //useSprite: true,
    release:"/${project}/static/$0"
});
fis.match('::image', {
    useHash: true,
    release: '/${project}/static/images/$1'
});

fis.match(/^\/(views|components\/widget|static)\/.*?([^/]+\.js)$/, {
    //useHash: true,
    release: '/${project}/static/$2'
});
fis.match(/.*?([^/]+\.html)$/, {
    /*query: '?=t' + fis.get('new date'),*/
    release: '/${project}/$1'
});


fis.match('/views/**', {
    useSameNameRequire: true
});

//下划线开头的文件不发布
fis.match('**/_*', {
    release: false
});

fis.match(/\/README\.md$/i, {
    release: false
});
fis.match(/\.idea\**/i, {
    release: false
});

fis.media('prod')
    .match('**.js', {
      optimizer: fis.plugin('uglify-js')
    })
    .match(/^\/(views|components\/widget|static)\/.*?([^/]+\.js)$/, {
        useHash: true,
    })
    .match('**.css', {
      optimizer: fis.plugin('clean-css')
    })
    .match('/static/style.css',{
        useHash: true
    })
    .match('**.html', {
      //invoke fis-optimizer-html-minifier
      optimizer: fis.plugin('html-minifier')
    })
    .match('*.png', {
      optimizer: fis.plugin('png-compressor')
    });


