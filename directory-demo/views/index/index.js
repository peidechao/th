/**
 * Created by pdc on 2016/4/14.
 */
require(["avalon","common","dataApi"],function(avalon,app,dataApi){
    var index=avalon.define({
        $id:"index",
        name:"pdc"
    });
    avalon.scan()
    var a=app.num.format(123456789,3),
        b=app.num.digita(a);
    console.log(a)
    dataApi.test("pdc","men").done().fail()
})




