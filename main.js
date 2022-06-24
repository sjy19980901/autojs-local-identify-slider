/**
 * 随机测试7张滑块图片
 * autojs测试版本：9.1.20
 * 
 * 一般情况下，只要识别到了错误率是很低的。
 * 图片越大，识别速度越慢，可通过images.resize进行适当缩小，加快识别速度
 *      提示：如果使用了images.resize，建议定义变量的形式进行缩小图片比例，并把返回的x坐标通过此变量进行相乘。
 * 7张图片测试结果：
 * 成功：7
 * 失败：0
 * 
 * 
 * by：虎哥
 */




slidingBlock = require("./sliding_block.js");


test();

function test(){

    // 请求截图
    // if($images.getScreenCaptureOptions() == null){
    //     if(!requestScreenCapture()){
    //         toast("请求截图失败");
    //         exit();
    //     }
    // }
    // auto.waitFor();
    console.show();

    let successCount = 0,errorCount = 0;
    for(let i=1;i <= 7;i++){
        let img = imgByRead(i); //读取图片
        let x = slidingBlock.discernSlidingblock(img,"#77F27C","#111111"); //识别滑块

        img.recycle();
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
 * 测试获取指定图片
 * @returns 指定图片
 */
function imgByRead(index){
    let path = files.path("./" + index+".png"); 
    return images.read(path);
}
