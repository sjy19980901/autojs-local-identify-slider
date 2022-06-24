/**
 * 虎哥Autojs本地滑块识别插件
 * 
 * 支持所有分辨率
 * 支持所有图形
 * 200毫秒以内识别
 * 原理上支持市面所有滑块
 * 99%的识别率
 * 
 * 说下算法思路：
 * 1、首先通过找色工具，获取两个图标(源图标,目标图标)的相同区域的色值。(重点)
 *      什么是相同区域的色值呢？就是对于图标的外线的相对区域的色值，如果色值找准确了，
 *      那么这两个区域的形状应该是相同的，我建议目标图标的区域形状需要比源图标的区域形状稍大一些，可更容易找到x坐标，
 *      改变形状大小可通过颜色偏移来修改，偏移越小，获取到的点越少，区域也越小，反之亦然。
 * 2、找色值的偏移，一般情况下，目标图标需要比源图标区域大一些，一样也可以，自己多测试，
 * 我这里使用的是按键精灵的找色工具，或者图灵识别，看二值化的图很方便。
 * 3、把找到的源图标色值，偏移带入到方法images.findAllPointsForColor中，用于找到相关色值的所有坐标。
 * 4、取出源图标的区域范围，通过坐标的上下左右最大值获取即可。
 * 5、从左边x坐标的最大值中取出对应的y坐标，得到最左边的x，y坐标，也就是一个最左边的点
 * 6、把第5步获取的点与所有的坐标进行对比，取出这些坐标相对于最左边点的所有相对坐标，用于多点找色。
 * 7、依据搜索类型来判断搜索次数。
 * 8、通过第4步获取到的源图标区域范围，取出目标图标的查找区域范围(用于减少搜索区域面积)
 *      原理：因为都是横着滑，所以目标图标的topY与bottomY与源图标是一样的，或者增加3-5像素，减少找不到的可能性。
 * 9、把图片二值化处理，用于多点找色。
 * 10、把第2、6、7、9步得到的结果放入方法images.findMultiColors中，因为是循环查找，每次循环将会使阈值累加5点，直到找到为止。
 * 
 * 
 * B站演示视频：https://www.bilibili.com/video/BV17f4y1f7Yo?spm_id_from=333.999.0.0&vd_source=e6ebbd11cb537395ed4cdaf9d72e8d5c
 * 脚本技术交流群：756920516
 * 
 */



slidingBlock = {};




/**
 * 识别滑块图片并返回目标x坐标
 * threshold：找色时颜色相似度的临界值，范围为0 ~ 255（越小越相似，0为颜色相等，255为任何颜色都能匹配）。
 * 默认为4。threshold和浮点数相似度(0.0~1.0)的换算为 similarity = (255 - threshold) / 255.
 * @param {Image} img 滑块图片
 * @param {string} oColor 源图标16进制颜色
 * @param {string} tColor 目标图标16进制颜色
 * @param {int} oThreshold 源图标相似度临界值(可选)
 * @param {int} tByteThreshold 缺口二值化相似度临界值(可选)
 * @param {int} searchType 查找形式：0=快速查找，找不到可能性较大。1=中速查找，可能找不到(默认)。2=慢速查找，一定会找到，但可能位置有问题。
 * @returns x坐标
 */
 slidingBlock.discernSlidingblock = function(img,oColor,tColor,oThreshold,tByteThreshold,searchType) {
    let start = new Date().getTime();

    oThreshold = oThreshold == undefined ? 32 : oThreshold;
    tByteThreshold = tByteThreshold == undefined ? 30 : tByteThreshold;
    searchType = searchType == undefined ? 1 : searchType;
    let findColor = "#FFFFFF";

    let arr = images.findAllPointsForColor(img, oColor,{threshold:oThreshold});

    // 获取上下左右每个坐标的最大值，用于进行后续的目标图标区域查找
    let pArr = slidingBlock.getRectPos(arr);
    let leftX = pArr[0],topY = pArr[1],rightX = pArr[2],bottomY = pArr[3];
    
    // 获取最左边的x坐标对应的y坐标
    let y = slidingBlock.getPosY(arr,leftX);
    let posArr = [];firstColor = [leftX,y];

    // 以最左边的坐标为基准，查找所有与它相同颜色的坐标偏移，对应目标图标查找的posArr
    for(let i=0;i < arr.length;i++){
        let point = arr[i];
        let xOffset = point.x - firstColor[0];
        let yOffset = point.y - firstColor[1];
        posArr[i] = [xOffset,yOffset,findColor];
    }

    // 根据查找形式进行搜索次数的赋值
    var searchCount;
    if(searchType == 0){
        searchCount = 1;
    }else if(searchType == 1){
        searchCount = 10;
    }else{
        searchCount = 100;
    }
    
    // 查找目标图标的区域范围
    let arr3 = [rightX, topY-5, img.getWidth() - rightX, bottomY - topY+5];
    console.log("查找图片范围："+arr3);
    let aSearchCount = 0;


    var p;
    for(let i =0 ; i < searchCount;i++){
        // 将图片二值化
        let thImg = images.interval(img, tColor,tByteThreshold + i * 5);

        // 用于不产生异常，如果不加会报数组索引过界异常，异常原因现不明确。
        images.save(thImg,files.getSdcardPath() + "/1.png");
        p = images.findMultiColors(thImg,findColor, posArr, {
            region: arr3,
            threshold:0
        });

        thImg.recycle();
        aSearchCount++;
        if(p != null ){
            break;
        }
    }
    console.log("查找次数：",aSearchCount);

    img.recycle();
    if(p != null){
        // 如果找到了，那么这个点是最左边的，我们要取中间点
        resultX = p.x + (rightX - leftX) / 2;

        // 如果使用了缩小比例，那么就将坐标对应放大
        // resultX *= reduceRide;
        console.info("最终滑块结果为:x=",resultX);
        let end = new Date().getTime();
        console.log("用时毫秒:",end-start);
        return resultX;
    }else{
        let end = new Date().getTime();
        console.log("用时毫秒:",end-start);
        console.error("未找到x");
        return -1;
    }
}

/**
 * 返回x坐标对应的y坐标
 * @param {Array} arr 坐标数组
 * @param {int} x x坐标
 * @returns y坐标
 */
 slidingBlock.getPosY = function(arr,x){
    for(let i =0;i < arr.length;i++){
        if(arr[i].x == x){
            return arr[i].y;
        }
    }
}



/**
 * 返回所有坐标的上下左右最大值
 * @param {Array} arr 关于某个颜色及偏移的所有坐标数组
 * @returns 上下左右最大值数组
 */
 slidingBlock.getRectPos = function(arr){
    let rightX = 0,leftX = 9999,topY=9999,bottomY=0;
    for(let i=0;i < arr.length;i++){
        let point = arr[i];
        if(rightX < point.x){
            rightX = point.x;
        }
        if(leftX > point.x){
            leftX = point.x;
        }
        if(topY>point.y){
            topY = point.y;
        }
        if(bottomY < point.y){
            bottomY = point.y; 
        }
    }

    //左，上，右，下
    return [leftX,topY,rightX,bottomY];
}

module.exports = slidingBlock;//回调