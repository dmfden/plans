'use strict';
function togglePrices(target) {
    const pricesWrapper = document.getElementById('plansWrapper');
    if (pricesWrapper.classList.contains(target)) {
        return;
    }
    const classForRemove = target === 'yearly-price' ? 'monthly-price' : 'yearly-price';
    pricesWrapper.classList.remove(classForRemove);
    pricesWrapper.classList.add(target);
}

const pricesControl = document.getElementById('pricesControl');

pricesControl.addEventListener('click', (event) => {
    const target = event.target.dataset.ctaPlans;
    target && togglePrices(target);
    return;
});

