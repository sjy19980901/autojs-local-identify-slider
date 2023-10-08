/**
 * 虎哥Autojs本地滑块识别插件
 * 
 * 支持所有分辨率
 * 
 */
// 初始化opencv
//引入包和类
importPackage(org.opencv.core);
importPackage(java.util);
importClass(org.opencv.imgcodecs.Imgcodecs);
importClass(org.opencv.imgproc.Imgproc);
importPackage(java.lang)

slidingBlock = {};

var imgPath, originThresholdImgPath, targetThresholdImgPath, gScale, gWidth, gHeight, gAreaOffset, mat, cList, isError = false, hasOrigin = false;
var soX1, soY1, soX2, soY2, stX1, stY1, stX2, stY2, sSim;
var shapeJudge = false;
var gRightX;
let oWidth,oHeight,oSim,imgWidth;

/**
 * 
 * @param {Image} img 滑块图片
 * @param {int} rScale 缩小比例，(0.1-1,省略默认1)
 * @param {JSON} rangObj 识别范围对象，用于检测缺口轮廓时识别的图片范围
 *      @param {int} x1 左
 *      @param {int} y1 上
 *      @param {int} x2 右
 *      @param {int} y2 下
 * @param {int} judgeType 检测轮廓机制 1=通过颜色判断轮廓和大小 2=通过二值化判断轮廓和大小
 * @param {JSON} colorObj (二选一)缺口颜色检测对象，当缺口颜色相同时使用
 *      @param {string} targetColor 目标缺口颜色
 *      @param {string} targetColorOffset 目标缺口颜色偏移(范围)(10-150,省略默认16)
 *      @param {string} originColor 源缺口颜色(可省略)
 *      @param {string} originColorOffset 源缺口颜色偏移(范围)(10-150,省略默认16)
 * @param {JSON} thresholdObj (二选一)缺口灰度值检测对象，当缺口颜色时使用
 *      @param {int} min 二值化的最小值
 *      @param {int} max 二值化的最大值
 * @param {JSON} sizeObj 缺口大小检测对象，当缺口大小相同时使用
 *      @param {int} width 缺口宽
 *      @param {int} height 缺口高
 *      @param {int} sizeOffset 大小相似度(0-20,省略默认5)
 * @param {JSON} shapeObj 可省略，缺口形状检测对象，当滑块具有干扰缺口时使用，用来判断源缺口与目标缺口形状是否相同。
 *      @param {JSON} origin 源缺口识别范围对象
 *          @param {int} x1 左
 *          @param {int} y1 上
 *          @param {int} x2 右
 *          @param {int} y2 下
 *      @param {JSON} target 目标缺口识别范围对象
 *          @param {int} x1 左
 *          @param {int} y1 上
 *          @param {int} x2 右
 *          @param {int} y2 下
 *      @param {int} sim 形状相似度(0-20,省略默认5)
 * @param {string} ImagePath 可省略，滑块图片保存路径
 * @returns 目标缺口中间x坐标值
 */
slidingBlock.discernSlidingblock = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {


    let times = slidingBlockCore(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);


    if (isError) {    //识别出错
        console.error("填写参数格式错误");
        return -1;
    } else if (cList.size() > 0) {    //说明找到了轮廓
        let points = cList.get(cList.size() - 1).toList();
        let rightX = getPoint(points, 2);
        let leftX = getPoint(points, 4);

        resultX = (leftX + (rightX - leftX) / 2) / rScale;
        console.log("用时毫秒:", times);
        console.info("最终滑块结果为:x=", resultX);
        return resultX;
    } else {  //未找到轮廓
        console.log("用时毫秒:", times);
        console.error("未找到x");
        return -1;
    }


}


/**
 * 展示经过范围检测后的图片，范围检测为第一步
 * @param {Image} img 滑块图片
 * @param {int} rScale 缩小比例，(0.1-1,省略默认1)
 * @param {JSON} rangObj 识别范围对象，用于检测缺口轮廓时识别的图片范围
 *      @param {int} x1 左
 *      @param {int} y1 上
 *      @param {int} x2 右
 *      @param {int} y2 下
 * @param {int} judgeType 检测轮廓机制 1=通过颜色判断轮廓和大小 2=通过二值化判断轮廓和大小
 * @param {JSON} colorObj (二选一)缺口颜色检测对象，当缺口颜色相同时使用
 *      @param {string} targetColor 目标缺口颜色
 *      @param {string} targetColorOffset 目标缺口颜色偏移(范围)(10-150,省略默认16)
 *      @param {string} originColor 源缺口颜色(可省略)
 *      @param {string} originColorOffset 源缺口颜色偏移(范围)(10-150,省略默认16)
 * @param {JSON} thresholdObj (二选一)缺口灰度值检测对象，当缺口颜色时使用
 *      @param {int} min 二值化的最小值
 *      @param {int} max 二值化的最大值
 * @param {JSON} sizeObj 缺口大小检测对象，当缺口大小相同时使用
 *      @param {int} width 缺口宽
 *      @param {int} height 缺口高
 *      @param {int} sizeOffset 大小相似度(0-20,省略默认5)
 * @param {JSON} shapeObj 可省略，缺口形状检测对象，当滑块具有干扰缺口时使用，用来判断源缺口与目标缺口形状是否相同。
 *      @param {JSON} origin 源缺口识别范围对象
 *          @param {int} x1 左
 *          @param {int} y1 上
 *          @param {int} x2 右
 *          @param {int} y2 下
 *      @param {JSON} target 目标缺口识别范围对象
 *          @param {int} x1 左
 *          @param {int} y1 上
 *          @param {int} x2 右
 *          @param {int} y2 下
 *      @param {int} sim 形状相似度(0-20,省略默认5)
 * @param {string} ImagePath 可省略，滑块图片保存路径
 * @param {string} writePath 
 * @param {int} showType 展示形式 1=展示轮廓图，2=展示二值化图
 * @param {int} showPos 展示图片位置 1=展示处理目标缺口后的图片，2=展示处理源缺口后的图片，可以与展示形式配合使用，如果展示形式等于1，那么将展示所有的轮廓(源缺口+目标缺口)(可省略，默认为1)
 */
slidingBlock.discernSlidingblockTestByRange = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath, writePath, showType, showPos) {

    let list = getOutlineList1(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);
    slidingBlock.showImage(list, writePath, showType, showPos);
}

/**
 * 展示经过大小检测后的图片，大小检测为第二步
 */
slidingBlock.discernSlidingblockTestBySize = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath, writePath, showType, showPos) {

    let list = getOutlineList2(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);
    slidingBlock.showImage(list, writePath, showType, showPos);
}


/**
 * 展示经过形状检测(去除干扰项)后的图片，形状检测为第三步
 */
slidingBlock.discernSlidingblockTestByShape = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath, writePath, showType, showPos) {

    let list = getOutlineList3(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);
    slidingBlock.showImage(list, writePath, showType, showPos);
}


/**
 * 展示图片，内部方法
 * @param {Array} list 轮廓列表
 * @param {string} writePath 图片写入路径
 * @param {int} showType 展示形式：1=展示轮廓图，2=展示二值化图
 * @param {int} showPos 展示图片位置 1=展示处理目标缺口后的图片，2=展示处理源缺口后的图片，可以与展示形式配合使用，如果展示形式等于1，那么将展示所有的轮廓(源缺口+目标缺口)(可省略，默认为1)
 * @returns 
 */
slidingBlock.showImage = function(list, writePath, showType, showPos) {
    if (isError) {
        console.error("填写参数格式错误");
        return;
    }

    writePath = writePath == undefined || writePath == null ? "/sdcard/Pictures/sliding/-1.png" : writePath;
    showPos = showPos == undefined || showPos == null ? 1 : showPos;

    discernSlidingblockTestByList(list, writePath, showType, showPos)
}


/**
 * 被showImage调用，通过list轮廓列表展示图片，内部方法
 * @param {Array} list 轮廓列表
 * @param {string} writePath 图片写入路径
 * @param {int} showType 展示形式：1=展示轮廓图，2=展示二值化图
 * @param {int} showPos 展示图片位置 1=展示处理目标缺口后的图片，2=展示处理源缺口后的图片，可以与展示形式配合使用，如果展示形式等于1，那么将展示所有的轮廓(源缺口+目标缺口)(可省略，默认为1)
 */
function discernSlidingblockTestByList(list, writePath, showType, showPos) {
    let mat3;

    if (showType == 1) {
        // 读图片路径转为mat
        mat3 = Imgcodecs.imread(imgPath, 1);
        // 绘制轮廓
        Imgproc.drawContours(mat3, list, -1, new Scalar(0, 255, 0), Imgproc.LINE_4, Imgproc.LINE_AA);
        Imgcodecs.imwrite(writePath, mat3);
        app.viewFile(writePath);    //显示图片
    } else if (showType == 2) {
        if (showPos == 2) {
            mat3 = Imgcodecs.imread(originThresholdImgPath, 0);
        } else if (showPos == 1) {
            mat3 = Imgcodecs.imread(targetThresholdImgPath, 0);
        }

        Imgcodecs.imwrite(writePath, mat3);
        app.viewFile(writePath);    //显示图片
    }

}

/**
 * 放大或缩小长度，取决于gScale的值
 * @param {int} len 
 * @returns 
 */
function getLengthByScale(len) {
    return len * gScale;
}

/**
 * 获取第一步(范围检测)处理完的轮廓列表
 * @returns 轮廓列表
 */
function getOutlineList1(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {


    let targetColor, targetColorOffset, originColor, originColorOffset, width, height, sizeOffset, tMin, tMax, targetTempPath;
    let oX1, oY1, oX2, oY2;
    gScale = rScale;

    if (rangeObj == null) {
        // 如果为空则为全图范围查找
        oX1 = 0;
        oY1 = 0;
        oX2 = img.getWidth();
        oY2 = img.getHeight();
    } else {
        oX1 = rangeObj.x1;
        oY1 = rangeObj.y1;
        oX2 = rangeObj.x2;
        oY2 = rangeObj.y2;
    }

    oX1 = getLengthByScale(oX1);
    oY1 = getLengthByScale(oY1);
    oX2 = getLengthByScale(oX2);
    oY2 = getLengthByScale(oY2);


    if (sizeObj == null || sizeObj == undefined) {
        return setError("请添加大小判断对象!");
    }

    if (shapeObj != null && shapeObj != undefined) {
        shapeJudge = true;
        soX1 = getLengthByScale(shapeObj.origin.x1);
        soY1 = getLengthByScale(shapeObj.origin.y1);
        soX2 = getLengthByScale(shapeObj.origin.x2);
        soY2 = getLengthByScale(shapeObj.origin.y2);

        stX1 = getLengthByScale(shapeObj.target.x1);
        stY1 = getLengthByScale(shapeObj.target.y1);
        stX2 = getLengthByScale(shapeObj.target.x2);
        stY2 = getLengthByScale(shapeObj.target.y2);
        sSim = getLengthByScale(shapeObj.sim);
    }

    width = getLengthByScale(sizeObj.width);
    height = getLengthByScale(sizeObj.height);
    oWidth = width;
    oHeight = height
    oSim = sizeObj.sim
    sizeOffset = getLengthByScale(sizeObj.sizeOffset) == undefined ? getLengthByScale(16) : getLengthByScale(sizeObj.sizeOffset);
    targetTempPath = "/sdcard/Pictures/sliding/-2.png";
    originTempPath = "/sdcard/Pictures/sliding/-3.png";
    ImagePath = ImagePath == undefined ? "/sdcard/Pictures/sliding/-99.png" : ImagePath;
    gWidth = width;
    gHeight = height;
    gAreaOffset = sizeOffset;
    imgPath = ImagePath;
    originThresholdImgPath = originTempPath;
    targetThresholdImgPath = targetTempPath;

    img = images.scale(img, rScale, rScale);
    imgWidth = img.getWidth();
    imgHeight = img.getHeight();
    images.save(img, ImagePath);
    mat = Imgcodecs.imread(ImagePath, 1);

    if (judgeType == 1) {
        if (colorObj == null || colorObj == undefined) {
            return setError("当前检测轮廓机制为颜色检测(1),请添加颜色判断对象!");
        }

        targetColor = colorObj.targetColor;
        targetColorOffset = colorObj.targetColorOffset == undefined ? 16 : colorObj.targetColorOffset;
        let image1 = images.interval(img, targetColor, targetColorOffset);
        images.save(image1, targetTempPath);
        image1.recycle();

        if (colorObj.originColor != undefined) {
            hasOrigin = true;
            originColor = colorObj.originColor;
            originColorOffset = colorObj.originColorOffset == undefined ? 16 : colorObj.originColorOffset;
            let image2 = images.interval(img, originColor, originColorOffset);
            images.save(image2, originTempPath);
            image2.recycle();
        }
    } else if (judgeType == 2) {
        if (thresholdObj == null || thresholdObj == undefined) {
            return setError("当前检测轮廓机制为二值化检测(2),请添加灰度值判断对象!");
        }


        if(shapeObj == null || shapeObj.target == null || shapeObj.origin == null){
            soX1 = 0;
            soY1 = 0;
            soX2 = img.getWidth() / 4;
            soY2 = img.getHeight();
            stX1 = soX2;
            stY1 = 0
            stX2 = img.getWidth()
            stY2 = img.getHeight();
        }else{
            soX1 = getLengthByScale(shapeObj.origin.x1);
            soY1 = getLengthByScale(shapeObj.origin.y1);
            soX2 = getLengthByScale(shapeObj.origin.x2);
            soY2 = getLengthByScale(shapeObj.origin.y2);

            stX1 = getLengthByScale(shapeObj.target.x1);
            stY1 = getLengthByScale(shapeObj.target.y1);
            stX2 = getLengthByScale(shapeObj.target.x2);
            stY2 = getLengthByScale(shapeObj.target.y2);
            sSim = getLengthByScale(shapeObj.sim);
        }


        //原缺口mat图像
        console.info(img.getWidth(),img.getHeight());
        console.info(soX2,soY2);
        let oPath = "/sdcard/Pictures/sliding/oImg.png";
        let oImg = images.clip(img, soX1, soY1, soX2-soX1, soY2-soY1);
        images.save(oImg,oPath);
        let oMat = Imgcodecs.imread(oPath, 1);
        oMin = thresholdObj.origin.min < 0 ? 0 : thresholdObj.origin.min;
        oMax = thresholdObj.origin.max > 255 ? 255 : thresholdObj.origin.max;
        let onMat = new Mat();
        Imgproc.threshold(oMat, onMat, oMin, oMax, Imgproc.THRESH_BINARY_INV);

        //目标缺口mat图像
        let tPath = "/sdcard/Pictures/sliding/tImg.png";
        let tImg = images.clip(img, stX1, stY1, stX2-stX1, stY2-stY1);
        images.save(tImg, tPath);
        let tMat = Imgcodecs.imread(tPath, 1);
        tMin = thresholdObj.target.min < 0 ? 0 : thresholdObj.target.min;
        tMax = thresholdObj.target.max > 255 ? 255 : thresholdObj.target.max;
        let tnMat = new Mat();
        Imgproc.threshold(tMat, tnMat, tMin, tMax, Imgproc.THRESH_BINARY);

        let concatMat = new Mat( img.getHeight(), img.getWidth(), onMat.type());
        Core.hconcat([onMat, tnMat], concatMat);
        
        Imgcodecs.imwrite(targetTempPath, concatMat);
        Imgcodecs.imwrite(imgPath, concatMat);


        oImg.recycle();
        tImg.recycle();
    }

    img.recycle(); 

    let mat2 = Imgcodecs.imread(targetTempPath, 0);
    let list = new ArrayList();
    let hierarchy = new Mat();
    Imgproc.findContours(mat2, list, hierarchy, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_NONE);
    if (hasOrigin) {
        let mat3 = Imgcodecs.imread(originTempPath, 0);
        let list2 = new ArrayList();
        let hierarchy2 = new Mat();
        Imgproc.findContours(mat3, list2, hierarchy2, Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_NONE);
        list.addAll(list2);
    }


    list = getGraphRangePointList(list, oX1, oY1, oX2, oY2);

    return list;
}



/**
 * 获取第二步(大小检测)处理完的轮廓列表
 * @returns 轮廓列表
 */
function getOutlineList2(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {
    let list = getOutlineList1(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);

    if (list.size() > 1) {
        list = getShapePointList(list);
    }

    return list;
}

/**
 * 获取第三步(形状检测)处理完的轮廓列表
 * 废除的方法
 * @returns 轮廓列表
 */
function getOutlineList3(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {
    let list = getOutlineList2(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);

    if (list.size() > 1) {
        list = getSizePointList(list);
    }

    return list;
}


function getSizePointList(filteredContours){
    filteredContours = sortFilter(filteredContours,"height",oHeight-oSim*oHeight/100,oHeight+oSim*oHeight/100);
    filteredContours = sortFilter(filteredContours,"width",oWidth-oSim*oWidth/100,oWidth+oSim*oWidth/100);
    filteredContours = sortFilter(filteredContours,"y",0,imgWidth);
   
    let isResult = false;
    if(filteredContours.size() > 1){
        for (let i = 0; i < filteredContours.size(); i++) {
            let rect = Imgproc.boundingRect(filteredContours.get(i));
            if(rect.x < imgWidth / 5){
                isResult = true;
                break;
            }
        }
    }

    if(!isResult){
        filteredContours = new ArrayList();
    }
    console.log("最终结果数量:%d个", filteredContours.size());

    return filteredContours;
}

/**
 * 排序过滤
 * @returns
 */
function sortFilter(list,property,minFilter,maxFilter){
    let filteredContours4 = new ArrayList();
    //排序 过滤y
    for (let i = 0; i < list.size(); i++) {
        let inserted = false;
        let e = list.get(i);
        for (let j = 0; j < filteredContours4.size(); j++) {

            let rect1 = Imgproc.boundingRect(e);
            let rect2 = Imgproc.boundingRect(list.get(j));
            let r = eval("rect1."+property + " < " + "rect2." + property);
            if (r) {
                filteredContours4.add(j, e);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            filteredContours4.add(e);
        }
    }

    let filteredContours5 = new ArrayList();
    let sim = oSim

    console.log(filteredContours4.size())
    for (let i = 0; i < filteredContours4.size(); i++) {
        for (let j = i + 1; j < filteredContours4.size(); j++) {

            let rect1 = Imgproc.boundingRect(filteredContours4.get(i));
            let rect2 = Imgproc.boundingRect(filteredContours4.get(j));
            let difference =eval("Math.abs(rect1."+property+" - rect2."+property+")");
            let threshold = eval("rect1."+property + " * sim / 100");
            let evalStr = "rect1."+property +" >= " + minFilter +" && rect1."+property + " <= " + maxFilter;
            let r = eval(evalStr);
            console.log("形状筛选"+property+":"+JSON.stringify(rect1)+","+JSON.stringify(rect2) + "--"+ r);
            if ( difference <= threshold && r) {
                console.log("形状筛选合格值"+property+":"+JSON.stringify(rect1)+","+JSON.stringify(rect2));
                filteredContours5.add(filteredContours4.get(i));
                filteredContours5.add(filteredContours4.get(j));
                break;
            }
        }
    }

    let filteredContoursSet5 = new HashSet(filteredContours5);
    filteredContours5 = new ArrayList(filteredContoursSet5)

    return filteredContours5;
}


/**
 * 内部调用滑块识别方法，计算出图形x坐标位置并返回处理时间
 * @returns
 */
function slidingBlockCore(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {

    let start = new Date().getTime();
    let list = getOutlineList3(img, rScale, rangeObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);

    cList = list;

    let end = new Date().getTime();
    return end - start;
}

/**
 * 当识别出错时产生报错，一般出现于用户参数填写错误。
 * @param {string} str 报错信息
 * @returns x坐标，直接返回-1
 */
function setError(str) {
    console.error(str);
    isError = true;
    return -1;
}


/**
 * 
 * 通过形状检测(去除干扰项)查找符合条件的list轮廓列表，并将符合的列表返回
 * @param {Array} list 轮廓列表
 * @param {int} soX1 源缺口查找范围最左边
 * @param {int} soY1 源缺口查找范围最上边
 * @param {int} soX2 源缺口查找范围最右边
 * @param {int} soY2 源缺口查找范围最下边
 * @param {int} stX1 目标缺口查找范围最左边
 * @param {int} stY1 目标缺口查找范围最上边
 * @param {int} stX2 目标缺口查找范围最右边
 * @param {int} stY2 目标缺口查找范围最下边
 * @param {int} sSim 源缺口与目标缺口相似度，(0-15，一般5就可以了)
 * @returns 轮廓列表
 */
function getShapePointList(list) {

    let filteredContours = new ArrayList();
    let minArea = oHeight * oWidth / 30 //面积
    let maxLength = 12 * (oHeight + oWidth) //周长
    let sim = oSim
    console.log(minArea +":"+maxLength+":"+sim);

    // //排序
    // for (let i = 0; i < list.size(); i++) {
    //     let inserted = false;
    //     let e = list.get(i);
    //     for (let j = 0; j < filteredContours.size(); j++) {
    //         if (Imgproc.contourArea(e) < Imgproc.contourArea(filteredContours.get(j))) {
    //             filteredContours.add(j, e);
    //             inserted = true;
    //             break;
    //         }
    //     }
    //     if (!inserted) {
    //         filteredContours.add(e);
    //     }
    // }

    // let filteredContours1 = new ArrayList()

    // for (let i = 0; i < filteredContours.size(); i++) {
    //     for (let j = i + 1; j < filteredContours.size(); j++) {

    //         let area1 = Imgproc.contourArea(filteredContours.get(i));
    //         let area2 = Imgproc.contourArea(filteredContours.get(j));
    //         let difference = Math.abs(area1 - area2);
    //         let threshold = area1 * sim / 100; // 计算阈值

    //         console.log(area1,area2)
    //         if (minArea <= area1 && minArea <= area2 && difference <= threshold) {
    //             console.log("面积筛选合格值:"+area1+","+area2);
    //             filteredContours1.add(filteredContours.get(i));
    //             filteredContours1.add(filteredContours.get(j));
    //             break;
    //         }
    //     }
    // }

    let filteredContoursSet = new HashSet(list);
    filteredContours1 = new ArrayList(filteredContoursSet)

    let filteredContours2 = new ArrayList();
    //排序
    for (let i = 0; i < filteredContours1.size(); i++) {
        let inserted = false;
        let e = filteredContours1.get(i);
        for (let j = 0; j < filteredContours2.size(); j++) {
            if ( Imgproc.arcLength(new MatOfPoint2f(e.toArray()),true) < Imgproc.arcLength(new MatOfPoint2f(filteredContours2.get(j).toArray()),true)) {
                filteredContours2.add(j, e);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            filteredContours2.add(e);
        }
    }

    let filteredContours3 =  new ArrayList()
    for (let i = 0; i < filteredContours2.size(); i++) {
        for (let j = i + 1; j < filteredContours2.size(); j++) {

            let length1 = Imgproc.arcLength(new MatOfPoint2f(filteredContours2.get(i).toArray()),true);
            let length2 = Imgproc.arcLength(new MatOfPoint2f(filteredContours2.get(j).toArray()),true);
            let difference = Math.abs(length1 - length2);
            let threshold = length1 * sim / 100; // 计算阈值

            console.log(length1,length2)
            if (difference <= threshold && length1 < maxLength) {
                console.log("周长筛选合格值:"+length1+","+length2);
                filteredContours3.add(filteredContours2.get(i));
                filteredContours3.add(filteredContours2.get(j));
                break;

            }
        }
    }


    let filteredContoursSet3 = new HashSet(filteredContours3);
    filteredContours3 = new ArrayList(filteredContoursSet3)

    console.log("通过周长面积特征对比发现符合特征轮廓数量：%d个", filteredContours3.size());

    return filteredContours3;
}




/**
 * 求出近似范围数组
 * @param {int} ArrayList 
 * @returns 
 */
function findNumbersWithinRange(array,sim) {
    let result = new ArrayList();

    // 对数组进行排序
    Arrays.sort(array);

    for (let i = 0; i < array.size() - 1; i++) {
        for (let j = i + 1; j < array.size(); j++) {
            let difference = Math.abs(array.get(i) - array.get(j));
            let threshold = array.get(i) * sim / 100; // 计算阈值

            if (difference <= threshold) {
                result.add(array.get(i));
                result.add(array.get(j));
            }
        }
    }

    return result;
}


/**
 * 通过大小检测查找符合条件的list轮廓列表，并将符合的列表返回
 * @param {Array} list 轮廓列表
 * @returns 轮廓列表
 */
function getGraphSizePointList(list) {
    let points = new ArrayList();
    for (let i = 0; i < list.size(); i++) {
        let matOfPoint = list.get(i);
        let ofPoint = judgeSize(matOfPoint, gWidth, gHeight, gAreaOffset);
        if (ofPoint != null) {
            points.add(ofPoint);
        }
    }
    console.log("通过缺口大小对比发现符合特征轮廓数量：%d个", points.size());
    return points;
}


/**
 * 通过范围检测查找符合条件的list轮廓列表，并将符合的列表返回
 * @param {Array} list 轮廓列表
 * @param {int} leftX 图片最左边
 * @param {int} topY 图片最上边
 * @param {int} rightX 图片最右边
 * @param {int} bottomY 图片最下边
 * @returns 轮廓列表
 */
function getGraphRangePointList(list, leftX, topY, rightX, bottomY) {
    let points = new ArrayList();
    for (let i = 0; i < list.size(); i++) {
        let matOfPoint = list.get(i);
        let maxY = getPoint(matOfPoint.toList(), 1);
        let maxX = getPoint(matOfPoint.toList(), 2);
        let minY = getPoint(matOfPoint.toList(), 3);
        let minX = getPoint(matOfPoint.toList(), 4);
        if (minX >= leftX && maxX <= rightX && minY >= topY && maxY <= bottomY) {
            points.add(matOfPoint);
        }
    }
    console.log("通过缺口位置范围对比发现符合特征轮廓数量：%d个", points.size());
    if (points.size() == 0) {
        console.error("请检查坐标范围数组是否填写正确!");
    }
    return points;
}

/**
 * 判断当前传入的轮廓是否符合指定大小，符合返回此轮廓，不符合返回null
 * @param {Object} point 单个轮廓
 * @param {int} width 检测轮廓宽度
 * @param {int} height 检测轮廓高度
 * @param {int} offset 检测轮廓大小相似度(0-20)
 * @returns 单个轮廓
 */
function judgeSize(point, width, height, offset) {
    let points = point.toList();
    let maxY = 0;
    let maxX = 0;
    let minY = Integer.MAX_VALUE;
    let minX = Integer.MAX_VALUE;
    for (let i = 0; i < points.size(); i++) {
        let point1 = points.get(i);

        if (point1.y > maxY) {
            maxY = point1.y;
        }

        if (point1.x > maxX) {
            maxX = point1.x;
        }

        if (point1.y < minY) {
            minY = point1.y;
        }

        if (point1.x < minX) {
            minX = point1.x;
        }
    }

    let maxWidth = maxX - minX;
    let maxHeight = maxY - minY;

    if (maxWidth <= (width + offset) && maxWidth >= (width - offset) && maxHeight <= (height + offset) && maxHeight >= (height - offset)) {
        return point;
    }

    return null;
}

/**
 * 获取极限坐标值
 * @param list 坐标数组
 * @param type 获取坐标类型：1=最长y，2=最长x，3=最短y，4=最短x
 * @return  指定坐标值
 */
function getPoint(list, type) {
    let maxY = 0;
    let maxX = 0;
    let minY = Integer.MAX_VALUE;
    let minX = Integer.MAX_VALUE;
    for (let i = 0; i < list.size(); i++) {
        let point = list.get(i);

        if (type == 1 && point.y > maxY) {
            maxY = point.y;
        }

        if (type == 2 && point.x > maxX) {
            maxX = point.x;
        }

        if (type == 3 && point.y < minY) {
            minY = point.y;
        }

        if (type == 4 && point.x < minX) {
            minX = point.x;
        }
    }

    let result = -1;
    if (maxY > 0) {
        result = maxY;
    } else if (maxX > 0) {
        result = maxX;
    } else if (minY < Integer.MAX_VALUE) {
        result = minY;
    } else if (minX < Integer.MAX_VALUE) {
        result = minX;
    }

    return result;
}

/**
 * 获取第一波大致结果
 */
slidingBlock.getFirstSlideResult = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {

    let list = getOutlineList2(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);
    return list;
}

/**
 * 获取结果
 */
slidingBlock.getSlideResult = function (img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath) {

    let list = getOutlineList3(img, rScale, rangObj, judgeType, colorObj, thresholdObj, sizeObj, shapeObj, ImagePath);
    return list;
}



/**
 * 仿人工滑动滑块
 * @param {int} x1 滑动初始x坐标
 * @param {int} y1 滑动初始y坐标
 * @param {int} x2 滑动目标x坐标
 * @param {int} y2 滑动目标y坐标
 * @param {int} x3 滑块图片的右坐标
 * @param {int} type 仿人工滑动类型
 *      0=机器滑动(均匀速度滑动)
 *      1=超出滑块缺口后慢慢返回直到对准缺口(默认)
 *      2=当快到达滑块缺口后慢慢滑动直到对准缺口
 *      3=四阶贝塞尔曲线方式滑动，四阶贝塞尔曲线百度地址：https://baike.baidu.com/item/%E8%B4%9D%E5%A1%9E%E5%B0%94%E6%9B%B2%E7%BA%BF
 */
slidingBlock.personSwipe = function (x1, y1, x2, y2, x3, type) {
    type = type == undefined || type == null ? 1 : type;
    gRightX = x3;
    var runSwipe = "swipe" + type + "(" + x1 + "," + y1 + "," + x2 + "," + y2 + ")"
    eval(runSwipe);
}

/**
 * 滑块拖动0：机器滑动(均匀速度滑动)
 * @param {int} x1 滑动初始x坐标
 * @param {int} y1 滑动初始y坐标
 * @param {int} x2 滑动目标x坐标
 * @param {int} y2 滑动目标y坐标
 */
function swipe0(x1, y1, x2, y2) {
    let stayTimes = (x2 - x1) * 5;
    swipe(x1, y1, x2, y2, stayTimes);
}

/**
 * 滑块拖动1：超出滑块缺口后慢慢返回直到对准缺口
 * @param {int} x1 滑动初始x坐标
 * @param {int} y1 滑动初始y坐标
 * @param {int} x2 滑动目标x坐标
 * @param {int} y2 滑动目标y坐标
 */
function swipe1(x1, y1, x2, y2) {
    let x4 = (x2 + 100) > gRightX ? gRightX : x2 + 100
    let times = (parseInt((x4 - x1) / 3) + 200 + 100 * 5) * 5
    console.log("滑动用时:"+times);
    let posArr = [0,times]; //滑动坐标数组
    
    for(let i=x1;i <=x4;i+=3){
        posArr.push(pushPosArr(i,y2))
    }

    let stayX = posArr[posArr.length-1][0];
    for(let i = stayX;i >= (stayX-2);i-=0.01){
        posArr.push([i,y2]);
    }

    x4 = x4 - 2;
    for(let i = x4; i >= x2; i-=0.2){
        posArr.push(pushPosArr(i,y2))
    }

    gestures(posArr);
}


/**
 * 滑块拖动2：当快到达滑块缺口后慢慢滑动直到对准缺口
 * @param {int} x1 滑动初始x坐标
 * @param {int} y1 滑动初始y坐标
 * @param {int} x2 滑动目标x坐标
 * @param {int} y2 滑动目标y坐标
 */
function swipe2(x1, y1, x2, y2) {

    let x4 = (x2 - 100) < x1 ? x1 : x2 - 100
    let times = (parseInt((x4 - x1) / 3) + 200 + (x2 - x4) * 5) * 5
    console.log("滑动用时:"+times);
    let posArr = [0,times]; //滑动坐标数组
    
    for(let i=x1;i <=x4;i+=3){
        posArr.push(pushPosArr(i,y2))
    }

    let stayX = posArr[posArr.length-1][0];
    for(let i = stayX;i <= (stayX+2);i+=0.01){
        posArr.push([i,y2]);
    }

    x4 = x4 + 2;
    for(let i = x4; i <= x2; i+=0.2){
        posArr.push(pushPosArr(i,y2))
    }

    gestures(posArr);
}

/**
 * 滑块拖动3：四阶贝塞尔曲线方式滑动
 * @param {int} x1 滑动初始x坐标
 * @param {int} y1 滑动初始y坐标
 * @param {int} x2 滑动目标x坐标
 * @param {int} y2 滑动目标y坐标
 */
function swipe3(x1, y1, x2, y2) {
    randomSwipe(x1, y1, x2, y2);
}


function bezierCreate(x1, y1, x2, y2, x3, y3, x4, y4) {
    //构建参数
    var h = 100;
    var cp = [{ x: x1, y: y1 + h }, { x: x2, y: y2 + h }, { x: x3, y: y3 + h }, { x: x4, y: y4 + h }];
    var numberOfPoints = 100;
    var curve = [];
    var dt = 1.0 / (numberOfPoints - 1);
    //计算轨迹
    for (var i = 0; i < numberOfPoints; i++) {
        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;
        var result_x, result_y;
        cx = 3.0 * (cp[1].x - cp[0].x);
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;
        ax = cp[3].x - cp[0].x - cx - bx;
        cy = 3.0 * (cp[1].y - cp[0].y);
        by = 3.0 * (cp[2].y - cp[1].y) - cy;
        ay = cp[3].y - cp[0].y - cy - by;
        var t = dt * i
        tSquared = t * t;
        tCubed = tSquared * t;
        result_x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
        result_y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
        curve[i] = {
            x: result_x,
            y: result_y
        };
    }

    //轨迹转路数组
    var array = [];
    for (var i = 0; i < curve.length; i++) {
        try {
            var j = (i < 100) ? i : (199 - i);
            xx = parseInt(curve[j].x)
            yy = parseInt(Math.abs(100 - curve[j].y))
        } catch (e) {
            break
        }
        array.push([xx, yy])
    }
    return array
}



/**
 * 把x和y坐标放入数组中
 * @param {int} x x坐标
 * @param {int} y y坐标
 */
 function pushPosArr(x,y){
    let y2 = randomNum(y-5, y+5);
    return [x,y2];
}

/**
 * 生成随机数
 * @param {int} min 最小值
 * @param {int} max 最大值 
 * @returns 随机数
 */
function randomNum(min, max) {
    // console.log(min,max);
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    // console.log(r);
    return r;
}


/**
* 真人模拟滑动函数
*
* 传入值：起点终点坐标
* 效果：模拟真人滑动
*/
function randomSwipe(sx, sy, ex, ey) {
    //设置随机滑动时长范围
    var timeMin = 2500
    var timeMax = 3500
    //设置控制点极限距离
    var leaveHeightLength = 500
    //根据偏差距离，应用不同的随机方式
    if (Math.abs(ex - sx) > Math.abs(ey - sy)) {
        var my = (sy + ey) / 2
        var y2 = my + random(0, leaveHeightLength)
        var y3 = my - random(0, leaveHeightLength)
        var lx = (sx - ex) / 3
        if (lx < 0) { lx = -lx }
        var x2 = sx + lx / 2 + random(0, lx)
        var x3 = sx + lx + lx / 2 + random(0, lx)
    } else {
        var mx = (sx + ex) / 2
        var y2 = mx + random(0, leaveHeightLength)
        var y3 = mx - random(0, leaveHeightLength)

        var ly = (sy - ey) / 3
        if (ly < 0) { ly = -ly }
        var y2 = sy + ly / 2 + random(0, ly)
        var y3 = sy + ly + ly / 2 + random(0, ly)
    }

    //获取运行轨迹，及参数
    var time = [0, random(timeMin, timeMax)]
    var track = bezierCreate(sx, sy, x2, y2, x3, y3, ex, ey)
    console.log("滑动用时:"+time[1]);

    //滑动
    let str = time.concat(track);
    gestures(str)
}



module.exports = slidingBlock;//回调