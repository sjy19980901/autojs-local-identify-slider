/**
 * 本地滑块识别
 * autoxjs
 * by：虎哥
 */
//  "ui";
runtime.images.initOpenCvIfNeeded();

importClass(org.opencv.imgproc.Imgproc);

slidingBlock = require("./sliding_block.js");

let sizeObj = {};
let colorObj = {}


init();
test(); //斗鱼滑块可直接测试使用


function initDM(){
    
    // 设置缺口颜色检测对象
    // ------------------------
    colorObj.targetColor = "#333333";
    colorObj.targetColorOffset = 60;
    colorObj.originColor = "#B7D340";
    colorObj.originColorOffset = 80;


    // -------------------------
    // 设置缺口大小检测对象
    sizeObj.width = 150;
    sizeObj.height = 150
    sizeObj.sizeOffset = 50;
    sizeObj.sim = 30
}

function showDM(){
    initDM();

    let picObj = idContains("captcha").findOne(5000).child(0).child(0);
    sleep(1000)
    let rect = picObj.bounds();
    let img = capturePic(rect.left,rect.top,rect.width(),rect.height());
    slidingBlock.discernSlidingblockTestByShape(img,1,null,1,colorObj,null,sizeObj,null,"/sdcard/Pictures/sliding/result1.png","/sdcard/Pictures/sliding/show.png",1,1); 
}



function test(){
    showDM();
}


function init(){
    console.show();
    if(!requestScreenCapture()){
        toast("请求申请截图权限失败");
        exit();
    }
    auto.waitFor();
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



