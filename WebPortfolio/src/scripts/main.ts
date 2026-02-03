import '../styles/main.scss';

import PortfolioApp from './PortfolioApp';
import '../styles/components/_portfolio.scss'; // Don't forget the portfolio styles!
import './HomePageScripts';

const currentPage = document.body.dataset.page;

if(currentPage==='portfolio') {
    import('./PortfolioScripts');

    document.addEventListener('DOMContentLoaded', function() {
        const GITHUB_TOKEN = '';

        const app = new PortfolioApp('portfolio-projects', GITHUB_TOKEN);

        const projectFiles = [
            './RepoMarkdownFiles/JunkyardJunction.md',
            './RepoMarkdownFiles/StreetPainter.md',
            './RepoMarkdownFiles/TerraEngine.md',
            './RepoMarkdownFiles/PortfolioWebsite.md'
        ];

        app.init(projectFiles)
            .then(() => {
                console.log('Portfolio loaded successfully');
            })
            .catch(error => {
                console.error('Error loading portfolio', error);
            });
    });
}

