const container = document.getElementById('SlideList_base');
const lis = document.querySelectorAll('.slStyle');

if(!lis){
    console.log('1');
}
const renderPage = (firstIndex) => {
    lis.forEach((div, idx) => {
        //const li = item;
        //li.innerHTML = firstIndex + idx;
    });
};

renderPage(0);

const renderFunction = (firstIndex) => {
    renderPage(firstIndex);
};

const unlimitedSlideIns = new unlimitedSlide({
    firstItemId: 'item-first',
    lastItemId: 'item-last',
    container,
    listSize: 11,
    itemHeight: 142,
    renderFunction
});

unlimitedSlideIns.startObserver();
