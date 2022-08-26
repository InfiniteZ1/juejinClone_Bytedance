class unlimitedSlide{
    constructor(options){
        this.opsCheck(options);
    }
// constructor 属性返回 Object 类型的构造函数（用于创建实例对象）。注意，此属性的值是对函数本身的引用，而不是一个包含函数名称的字符串。
    opsCheck(ops){  // 引入形参ops
        if(!ops || typeof ops !== 'object'){
            throw new Error('options are illegal');
        }
        
// opsCheck() 是对 创建实例对象 的检查：检查是否为object 或 空属性

        const {
            firstItemId,
            lastItemId,
            itemHeight,
            container,
            listSize,
            renderFunction
        } = ops;
// 可以理解为是一个对象 ？ 其被声明为 ops.firstItemId ......

        if (!firstItemId) {
        throw new Error('firstItemId can not be null');
        }

        if (!lastItemId) {
        throw new Error('lastItemId can not be null');
        }

        if (!itemHeight || typeof itemHeight !== 'number') {
        throw new Error('itemHeight is illegal');
        }

        if (!renderFunction || typeof renderFunction !== 'function') {
        throw new Error('lastItemId is illegal');
        }

        if (!listSize) {
        throw new Error('listSize is illegal');
        }

        if (!container || !container.nodeType) {
        throw new Error('root is illegal');
        }
// 为错误检查
        this.itemHeight = itemHeight;
        this.firstItemId = firstItemId;
        this.lastItemId = lastItemId;
        this.container = container;
        this.listSize = listSize;
        this.renderFunction = renderFunction;

        this.firstItem = document.getElementById(firstItemId);
        this.lastItem = document.getElementById(lastItemId);

        this.domDataCache = {
            currentPaddingTop: 0,
            currentPaddingBottom: 0,

            topSentinelPreviousY: 0,
            topSentinelPreviousRatio: 0,

            bottomSentinelPreviousY: 0,
            bottomSentinelPreviousRatio: 0,
            currentIndex: 0
        };
// 创建实例并且对其初始化 通过 this.xxx = xxx 创建实例
    }
    updateDomDataCache(params){
        Object.assign(this.domDataCache, params);
// 将param的更新合并至this.domDataCache
    }
// 该函数的本质就是更新Dom的数据缓存

    adjustPaddings(isScrollDown){
        const {container, itemHeight} = this;
        /*等同于
        .
        conts container = this.itemHeight;

        其中 itemHeight 即为每个元素高度
        */
        const {currentPaddingTop, currentPaddingBottom} = this.domDataCache;
       
        let newCurrentPaddingTop, newCurrentPaddingBottom;
        const remPaddingsVal = itemHeight * (Math.floor(this.listSize / 2));
// remPaddingsVal = 元素高度 * listSize高度的一半且向下取整
// 本质即为变长padding1的高度
        if(isScrollDown){
// 如何判断 是 isScrollDown?
            newCurrentPaddingTop = currentPaddingTop + remPaddingsVal;

            if(currentPaddingBottom === 0){
                newCurrentPaddingBottom = 0;
            }else{
                newCurrentPaddingBottom = currentPaddingBottom - remPaddingsVal;
            }
        }else{
            newCurrentPaddingBottom = currentPaddingBottom + remPaddingsVal;
        
            if(currentPaddingTop === 0){
                newCurrentPaddingTop = 0;
            }else{
                newCurrentPaddingTop = currentPaddingTop - remPaddingsVal;
            }
        }


        container.style.paddingBottom = `${newCurrentPaddingBottom}px`;
        container.style.paddingTop = `${newCurrentPaddingTop}px`;

        this.updateDomDataCache({
            currentPaddingTop: newCurrentPaddingTop,
            currentPaddingBottom: newCurrentPaddingBottom
        });
    }


    getWindowFirstIndex = (isScrollDown) => {
        const {currentIndex} = this.domDataCache;
    
        const increment = Math.floor(this.listSize / 2);
// 说明每次的增量(increment) 为全部容器内所有元素的一半
        let firstIndex;

        if(isScrollDown){
        firstIndex = currentIndex + increment;
        }else{
        firstIndex = currentIndex - increment;
        }
        if(firstIndex < 0){
            firstIndex = 0;
        }

        return firstIndex;
    }

// 上滑的精准判定
    topItemCb(entry){
        const {
            topSentinelPreviousY,
            topSentinelPreviousRatio
        } = this.domDataCache;
// 此两个const 用于精准监测 高度和百分比
        const currentY = entry.boundingClientRect.top;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;
// 关于 entry:在index.js里提及
        if(currentY > topSentinelPreviousY
            && isIntersecting && currentRatio >= topSentinelPreviousRatio){
                console.log('Slide top');
                const firstIndex = this.getWindowFirstIndex(false);
                this.renderFunction(firstIndex);
                this.adjustPaddings(false);

                this.updateDomDataCache({
                    currentIndex: firstIndex,
                    topSentinelPreviousY: currentY,
                    topSentinelPreviousRatio: currentRatio
                });
            }else{
                this.updateDomDataCache({
                    topSentinelPreviousY: currentY,
                    topSentinelPreviousRatio: currentRatio
                });
            }
    }


// 下滑的精准判定
    bottomItemCb(entry){
        const {
            bottomSentinelPreviousY,
            bottomSentinelPreviousRatio
        } = this.domDataCache;
        
        const currentY = entry.boundingClientRect.top;
        const currentRatio = entry.intersectionRatio;
        const isIntersecting = entry.isIntersecting;
/*
IntersectionObserver API -> IntersectionObserverEntry 接口
此处为entry
    boundingClientRect 只读属性 描述了一个包含整个目标元素的最小矩形 .top 即为矩形顶边
    intersectionRatio  只读属性 告诉您在根的交集比率内当前有多少目标元素是可见的，其值为 0.0 和 1.0 之间。
    isIntersecting 只读属性 其是一个布尔值，即目标元素与交叉观察者的根相交时 返回true
*/
         
            if (currentY < bottomSentinelPreviousY
                && currentRatio >= bottomSentinelPreviousRatio && isIntersecting){
                console.log('Slide down');
                const firstIndex = this.getWindowFirstIndex(true); 

                this.renderFunction(firstIndex);
                this.adjustPaddings(true);

                this.updateDomDataCache({
                    currentIndex: firstIndex,
                    bottomSentinelPreviousY: currentY,
                    bottomSentinelPreviousRatio: currentRatio
                });
            }else{
                this.updateDomDataCache({
                    bottomSentinelPreviousY: currentY,
                    bottomSentinelPreviousRatio: currentRatio
                });
            }
        }                                 
    /*
    我们以下滑的精准判定为例: bottomItemCb(entry)
    其将  bottomSentinelPreviousY,bottomSentinelPreviousRatio
    与 this.domDataCache 进行联系

    > 关于entry
        entry 即为 topItemCb 和  bottomItemCb 的形参 |IntersectionObserverEntry接口
    */
        initIntersectionObserver(){
            const options = {

            };

            const callback = (entries) => {
                entries.forEach((entry) => {
                    if(entry.target.id === this.firstItemId){
                        this.topItemCb(entry);
                    }else if(entry.target.id === this.lastItemId){
                        this.bottomItemCb(entry);
                    }
                });
            };

            this.observer = new IntersectionObserver(callback, options);

            this.observer.observe(this.firstItem);
            this.observer.observe(this.lastItem);
        }

        startObserver(){
            this.initIntersectionObserver();
        }

}
