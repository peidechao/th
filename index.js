/**
 * Created by pdc on 2016/3/30.
 */
var fis=module.exports=require("fis3");
    fis.cli.name="th";
    fis.cli.info=require("./package.json");
    fis.cli.version=require('./version.js');
    fis.pagelet = require('./scene/pagelet')
    //alias
    Object.defineProperty(global, 'th', {
        enumerable : true,
        writable : false,
        value : fis
    });
