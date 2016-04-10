/**
 * Created by pdc on 2016/4/1.
 */
module.exports=function(options){
    fis.hook('amd',{
        //baseUrl: './modules',
        paths: {
            //$: 'jquery/jquery-1.11.2.js'
        },
        shim: {
           /* 'comp/2-0/2-0.js': {
             deps: ['jquery'],
             exports: 'myFunc'
             }*/
        }
    });
    fis.match('/modules/(**).js', {
        isMod: true,
        moduleId: '$1'
    });

    fis.match('/lib/**', {
        //isMod: true, // 设置 comp 下都是一些组件，组件建议都是匿名方式 define
        release: '/static/$0'
    });

    fis.match('::package', {
        // npm install [-g] fis3-postpackager-loader
        // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
        postpackager: fis.plugin('loader', {
            resourceType: 'amd',
            useInlineMap: true // 资源映射表内嵌
        })
    })

    //TODO: uae
    /*fis.match('::package', {
        prepackager: plugins.uae,
        postpackager: plugins.pagelet
    });*/

    //下划线开头的文件不发布
    fis.match('**/_*', {
        release: false
    }, true);

    fis.match(/\/README\.md$/i, {
        release: false
    });
    fis.match(/{\.idea,tpl}\**/i, {
        release: false
    });

    //启用 lint 插件进行代码检查
    fis.match('*.js', {
        lint: fis.plugin('js', {
        })
    })
    //转换less文件
    fis.match('*.less', {
        parser: fis.plugin('less'), //启用fis-parser-less插件
        rExt: '.css'
    });
    //转换sass文件
    fis.match('*.sass', {
        parser: fis.plugin('sass'), //启用fis-parser-sass插件
        rExt: '.css'
    });
    //用来控制合并时的顺序，值越小越在前面。配合 packTo 一起使用。
    fis.match('/{views,components}/**/*.css', {
        packTo: 'static/styles.css'
    })

    fis.match('/reset.css', {
        packOrder: -100
    })

    /*fis.match('**', {
        useMap: false,
        useHash: false,
        useCompile: false
    });*/

    fis.match(/^\/components\/(.*)$/i, {
        isMod: true,
        useSprite: true,
    });

    fis.match(/^\/views\/(.*\.html)$/i, {
        useHash: true,
        url: 'views/$1',
        release: '/views/$1'
    });
    //匹配文件类型为图片的文件
    fis.match('::image', {
        release: '/static/images/$1'
    });

    fis.match('/{views,components}/**/*.{js,css}', {
        useMap: true,
        useHash: true,
        release: '/static/$1'
    });
    fis.match('/{views,widget}/**', {
        useSameNameRequire: true
    });

    fis.media('prod')
        .match('/{views,components}/**/*.js', {
            useHash: true,
            optimizer: fis.plugin('uglify-js')
        })
        .match('/{views,components}/**/*.css', {
            useHash: true,
            optimizer: fis.plugin('clean-css')
        })
        .match('*.html', {
            //invoke fis-optimizer-html-minifier
            optimizer: fis.plugin('html-minifier')
        })
        .match('*.png', {
            optimizer: fis.plugin('png-compressor')
        });
    //将 fis3 编译产出到指定目录
    /*fis.match('*.js', {
        deploy: fis.plugin('local-deliver', {
            to: '/var/www/myApp'
        })
    })*/

}