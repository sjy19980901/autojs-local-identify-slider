/**
 * 本地滑块识别
 * autojs测试版本：9.1.20
 * by：虎哥
 */
//  "ui";


slidingBlock = require("./sliding_block.js");

let colorObj = {};
let thresholdObj = {};
let sizeObj = {};
let shapeObj = {};
// var base64Image;


// ui.layout(
//     <frame>
//         <img w="40" h="40" src="{{base64Image}}" />
//         <seekbar id="seekbar" progress="30" w="*" margin="18" />
//     </frame>
// );


init();
test();



function test(){

    // 测试真快乐APP滑块,1表示识别路径为"真快乐APP/1.png"
    // showHappy(2);
    // findHappy();

    // 测试QQ滑块,1表示识别路径为"QQ/1.png"
    // showQQ(1);
    // findQQ();

    // 测试中国国航滑块,2表示识别路径为"中国国航/2.png"
    // showAir(2);
    // findAir();

    // 测试微信小程序极验滑块验证，带拖动
    // showWeixin(2);
    // findWeixin();
    swipeWeixin();

    $debug.gc(); //此处可以进行内存垃圾回收
}


function init(){
    $debug.setMemoryLeakDetectionEnabled(false); //autojs机制即使图片回收了也会显示内存泄漏，于是就让它不显示~
    console.show();
    unlock();
    if($images.getScreenCaptureOptions() == null){
        if(!requestScreenCapture()){
            toast("请求申请截图权限失败");
            exit();
        }
    }
    auto.waitFor();
}

/**
 * 配置真快乐APP滑块检测对象
 */
 function initHappy(){
    // 设置缺口颜色检测对象
    // ------------------------
    colorObj.targetColor = "#444444";
    colorObj.targetColorOffset = 80;
    colorObj.originColor = "#92B150";
    colorObj.originColorOffset = 110;
    // -------------------------
    // 设置缺口大小检测对象
    sizeObj.width = 100;
    sizeObj.height = 100;
    sizeObj.sizeOffset = 40;
    // -------------------------
    // 设置缺口形状检测对象
    shapeObj.origin = {};
    shapeObj.origin.x1 = 0;
    shapeObj.origin.y1 = 0;
    shapeObj.origin.x2 = 170;
    shapeObj.origin.y2 = 400;
    shapeObj.target = {};
    shapeObj.target.x1 = 170;
    shapeObj.target.y1 = 0;
    shapeObj.target.x2 = 822;
    shapeObj.target.y2 = 400;
    shapeObj.sim = 3;
}

//对4 错3
function findHappy(){
    initHappy();

    let successCount = 0,errorCount = 0;
    for(let i=1;i <= 7;i++){
        let img = imgByRead("./真快乐APP/" + i+".png"); //读取图片

        // 下面这行代码就是插件的核心识别功能
        // img=滑块图片
        // 1=缩小比例(0.1-1)，识别慢的时候使用
        // null=识别缺口范围，不填则全图识别
        // 1=通过颜色检测缺口轮廓，2=通过灰度值检测缺口轮廓，当颜色随机时使用(检测轮廓机制)
        // colorObj=缺口颜色检测对象，当缺口颜色相同时使用
        // null=缺口灰度值检测对象，当缺口颜色随机时使用，colorObj与此对象二选一
        // sizeObj=缺口大小检测对象，当缺口大小相同时使用，主要轮廓检测功能，排除多余的干扰轮廓，如果缺口大小波动较大，则调高sizeObj.sizeOffset的值
        // shapeObj=缺口形状检测对象，用于存在干扰项缺口时使用，里面填写源缺口和目标缺口的识别范围，必须全部填写。
        let x = slidingBlock.discernSlidingblock(img,0.5,null,1,colorObj,null,sizeObj,shapeObj); 
        if(x == -1){
            errorCount++;
        }else{
            successCount++;
        }
    }

    console.info("识别成功数量：",successCount);
    console.info("识别失败数量：",errorCount);
    console.info("识别总数：",successCount+errorCount);
}

/**
 * 用于展示指定索引经过某个阶段处理后的图片，通过手机自带图片查看器查看，此方法展示的是真快乐APP滑块图片
 * @param {int} i 图片索引
 */
function showHappy(i){
    initHappy();

    let img = imgByRead("./真快乐APP/" + i+".png"); //读取图片

    //下面的调用函数中，后面比slidingBlock.discernSlidingblock多出三个参数，下面解释这三个参数含义
    //null=存放当前传入图片的路径，用于后面的轮廓图展示
    //null=存放程序计算过程中的临时图片路径
    //1=展示轮廓图，2=展示二值化图(展示形式)
    //1=展示目标缺口处理后的图，2=展示源缺口处理后的图，可以与展示形式配合使用，如果展示形式等于1，那么将展示所有的轮廓(源缺口+目标缺口)(展示位置)

    //展示经过范围检测后的图片，范围检测为第一步
    // slidingBlock.discernSlidingblockTestByRange(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过大小检测后的图片，大小检测为第二步
    // slidingBlock.discernSlidingblockTestBySize(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过形状检测(去除干扰项)后的图片，形状检测为第三步
    slidingBlock.discernSlidingblockTestBySize(img,1,null,1,colorObj,null,sizeObj,shapeObj,null,null,1,2); 
}



/**
 * 配置QQ滑块检测对象
 */
function initQQ(){
    // 设置缺口颜色检测对象
    // ------------------------
    colorObj.targetColor = "#BBBBBB";
    colorObj.targetColorOffset = 30;
    // -------------------------
    // 设置缺口大小检测对象
    sizeObj.width = 90;
    sizeObj.height = 90;
    sizeObj.sizeOffset = 10;
}

//对1 没找太多图片
function findQQ(){
    initQQ();

    let successCount = 0,errorCount = 0;
    for(let i=1;i <= 1;i++){
        let img = imgByRead("./QQ/" + i+".png"); //读取图片

        // 下面这行代码就是插件的核心识别功能
        // img=滑块图片
        // 1=缩小比例(0.1-1)，识别慢的时候使用
        // null=识别缺口范围，不填则全图识别
        // 1=通过颜色检测缺口轮廓，2=通过灰度值检测缺口轮廓，当颜色随机时使用(检测轮廓机制)
        // colorObj=缺口颜色检测对象，当缺口颜色相同时使用
        // null=缺口灰度值检测对象，当缺口颜色随机时使用，colorObj与此对象二选一
        // sizeObj=缺口大小检测对象，当缺口大小相同时使用，主要轮廓检测功能，排除多余的干扰轮廓，如果缺口大小波动较大，则调高sizeObj.sizeOffset的值
        let x = slidingBlock.discernSlidingblock(img,1,null,1,colorObj,null,sizeObj); 
        if(x == -1){
            errorCount++;
        }else{
            successCount++;
        }
    }

    console.info("识别成功数量：",successCount);
    console.info("识别失败数量：",errorCount);
    console.info("识别总数：",successCount+errorCount);
}

/**
 * 用于展示指定索引经过某个阶段处理后的图片，通过手机自带图片查看器查看，此方法展示的是QQ滑块图片
 * @param {int} i 图片索引
 */
function showQQ(i){
    initQQ();

    let img = imgByRead("./QQ/" + i+".png"); //读取图片

    //下面的调用函数中，后面比slidingBlock.discernSlidingblock多出三个参数，下面解释这三个参数含义
    //null=存放当前传入图片的路径，用于后面的轮廓图展示
    //null=存放程序计算过程中的临时图片路径
    //1=展示轮廓图，2=展示二值化图(展示形式)

    //展示经过范围检测后的图片，范围检测为第一步
    // slidingBlock.discernSlidingblockTestByRange(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过大小检测后的图片，大小检测为第二步
    // slidingBlock.discernSlidingblockTestBySize(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过形状检测(去除干扰项)后的图片，形状检测为第三步
    slidingBlock.discernSlidingblockTestByShape(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 

}

/**
 * 配置中国国航滑块检测对象
 */
function initAir(){
    sizeObj.width = 50;
    sizeObj.height = 50;
    sizeObj.sizeOffset = 15;
    // -------------------------
    colorObj.targetColor = "#333333";
    colorObj.targetColorOffset = 60;
    // -------------------------
    shapeObj.origin = {};
    shapeObj.origin.x1 = 0;
    shapeObj.origin.y1 = 0;
    shapeObj.origin.x2 = 72;
    shapeObj.origin.y2 = 180;
    shapeObj.target = {};
    shapeObj.target.x1 = 72;
    shapeObj.target.y1 = 0;
    shapeObj.target.x2 = 355;
    shapeObj.target.y2 = 180;
    shapeObj.sim = 10;
}

//对7 无错
function findAir(){
    
    initAir();

    let successCount = 0,errorCount = 0;
    for(let i=1;i <= 7;i++){
        let img = imgByRead("./中国航空/" + i+".png"); //读取图片

        // 下面这行代码就是插件的核心识别功能
        // img=滑块图片
        // 1=缩小比例(0.1-1)，识别慢的时候使用
        // null=识别缺口范围，不填则全图识别
        // 1=通过颜色检测缺口轮廓，2=通过灰度值检测缺口轮廓，当颜色随机时使用(检测轮廓机制)
        // colorObj=缺口颜色检测对象，当缺口颜色相同时使用
        // null=缺口灰度值检测对象，当缺口颜色随机时使用，colorObj与此对象二选一
        // sizeObj=缺口大小检测对象，当缺口大小相同时使用，主要轮廓检测功能，排除多余的干扰轮廓，如果缺口大小波动较大，则调高sizeObj.sizeOffset的值
        // shapeObj=当滑块图片中有干扰项时使用，用于排除干扰项，具体使用方法请看slidingBlock.discernSlidingblock中的shapeObj的参数注解
        let x = slidingBlock.discernSlidingblock(img,1,null,1,colorObj,null,sizeObj,shapeObj); 
        if(x == -1){
            errorCount++;
        }else{
            successCount++;
        }
    }

    console.info("识别成功数量：",successCount);
    console.info("识别失败数量：",errorCount);
    console.info("识别总数：",successCount+errorCount);
}

/**
 * 用于展示指定索引经过某个阶段处理后的图片，通过手机自带图片查看器查看，此方法展示的是中国国航滑块图片
 * @param {int} i 图片索引
 */
function showAir(i){
    initAir();

    let img = imgByRead("./中国航空/" + i+".png"); //读取图片

    
    //下面的调用函数中，后面比slidingBlock.discernSlidingblock多出三个参数，下面解释这三个参数含义
    //null=存放当前传入图片的路径，用于后面的轮廓图展示
    //null=存放程序计算过程中的临时图片路径
    //1=展示轮廓图，2=展示二值化图(展示形式)

    //展示经过范围检测后的图片，范围检测为第一步
    // slidingBlock.discernSlidingblockTestByRange(img,1,null,1,colorObj,null,sizeObj,shapeObj,null,null,1); 
    //展示经过大小检测后的图片，大小检测为第二步
    // slidingBlock.discernSlidingblockTestBySize(img,1,null,1,colorObj,null,sizeObj,shapeObj,null,null,1); 
    //展示经过形状检测(去除干扰项)后的图片，形状检测为第三步
    slidingBlock.discernSlidingblockTestByShape(img,1,null,1,colorObj,null,sizeObj,shapeObj,null,null,1); 

}

/**
 * 配置微信小程序极验滑块识别
 */
function initWeixin(){
    // 设置缺口颜色检测对象
    // ------------------------
    colorObj.targetColor = "#444444";
    colorObj.targetColorOffset = 60;
    // -------------------------
    // 设置缺口大小检测对象
    sizeObj.width = 130;
    sizeObj.height = 130;
    sizeObj.sizeOffset = 40;
}


/**
 * 用于展示指定索引经过某个阶段处理后的图片，通过手机自带图片查看器查看，此方法展示的是微信极验滑块验证滑块图片
 * @param {int} i 图片索引
 */
 function showWeixin(i){
    initWeixin();

    let img = imgByRead("./微信极验滑块验证/" + i+".png"); //读取图片

    //下面的调用函数中，后面比slidingBlock.discernSlidingblock多出三个参数，下面解释这三个参数含义
    //null=存放当前传入图片的路径，用于后面的轮廓图展示
    //null=存放程序计算过程中的临时图片路径
    //1=展示轮廓图，2=展示二值化图(展示形式)

    //展示经过范围检测后的图片，范围检测为第一步
    // slidingBlock.discernSlidingblockTestByRange(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过大小检测后的图片，大小检测为第二步
    // slidingBlock.discernSlidingblockTestBySize(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 
    //展示经过形状检测(去除干扰项)后的图片，形状检测为第三步
    slidingBlock.discernSlidingblockTestByShape(img,1,null,1,colorObj,null,sizeObj,null,null,null,1); 

}


//对2 无错
function findWeixin(){
    
    initWeixin();

    let successCount = 0,errorCount = 0;
    for(let i=1;i <= 2;i++){
        let img = imgByRead("./微信极验滑块验证/" + i+".png"); //读取图片
        let x = slidingBlock.discernSlidingblock(img,1,null,1,colorObj,null,sizeObj); 
        if(x == -1){
            errorCount++;
        }else{
            successCount++;
        }
    }

    console.info("识别成功数量：",successCount);
    console.info("识别失败数量：",errorCount);
    console.info("识别总数：",successCount+errorCount);
}


/**
 * 微信小程序极验滑块识别
 * 测试方法：微信小程序搜索"极验行为验" -> 滑块拼图 -> 点击按钮开始验证 -> 开启脚本
 */
function swipeWeixin(){
    initWeixin();
    // console.log("3秒后开始验证");
    // sleep(3000);

    let picObj = textContains("请拖动滑块完成拼图").findOne().parent().parent().parent().child(1).child(0).child(0);
    let rect = picObj.bounds();
    let img = capturePic(rect.left,rect.top,rect.width(),rect.height());
    let x = slidingBlock.discernSlidingblock(img,1,null,1,colorObj,null,sizeObj); 

    if(x != -1){
        let btnObj = idContains("geetest_slide_btn").findOne();
        let x1 = btnObj.bounds().centerX();
        let y1 = btnObj.bounds().centerY();
        let x2 = btnObj.bounds().left + x;
        let y2 = btnObj.bounds().centerY();
        let x3 = rect.right;

        slidingBlock.personSwipe(x1,y1,x2,y2,x3,2);
    }else{
        console.error("未识别到x坐标");
    }

}




/**
 * 把屏幕中的滑块图片截取出来返回成image
 * @param {int} x 图片左坐标
 * @param {int} y 图片上坐标
 * @param {int} width 图片宽度
 * @param {int} height 图片高度
 * @returns 截取区域后的image图片
 */
function capturePic(x,y,width,height){
    let src = captureScreen();
    let clip =  images.clip(src,x,y,width,height);
    src.recycle();
    return clip;
}

/**
 * 解除autojs自带的对部分app无法识别控件的限制
 */
function unlock() {
    importClass(com.stardust.autojs.core.accessibility.AccessibilityBridge.WindowFilter);
    let bridge = runtime.accessibilityBridge;
    let bridgeField = runtime.getClass().getDeclaredField("accessibilityBridge");
    let configField = bridgeField.getType().getDeclaredField("mConfig");
    configField.setAccessible(true);
    configField.set(bridge, configField.getType().newInstance());
    bridge.setWindowFilter(new JavaAdapter(AccessibilityBridge$WindowFilter, {
        filter: function (info) {
            return true;
        }
    }));
}



/**
 * 测试获取指定图片
 * @returns 指定图片
 */
function imgByRead(str){
    let path = files.path(str); 
    return images.read(path);
}
