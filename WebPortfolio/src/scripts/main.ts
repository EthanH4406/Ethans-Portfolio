import '../styles/main.scss';

import './HomePageScripts';

const currentPage = document.body.dataset.page;

if(currentPage==='portfolio') {
    import('./PortfolioScripts');
}

