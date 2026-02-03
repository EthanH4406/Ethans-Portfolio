import { GithubLangaugeStats, LanguageBreakdown } from "./PortfolioTypes";

export class LanguageUtils {
    private static readonly LANGUAGE_COLORS: {[key: string]: string} = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'Rust': '#dea584',
        'Scala': '#c22d40',
        'Shell': '#89e051',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'SCSS': '#c6538c',
        'Vue': '#41b883',
        'Dart': '#00B4AB',
        'R': '#198CE7',
        'Objective-C': '#438eff',
        'Perl': '#0298c3',
        'Lua': '#000080',
        'Haskell': '#5e5086',
        'Elixir': '#6e4a7e',
        'Clojure': '#db5855',
        'Julia': '#a270ba',
        'MATLAB': '#e16737',
        'Groovy': '#e69f56',
        'PowerShell': '#012456',
        'WebAssembly': '#04133b',
        'Default': '#858585'
    };

    static calculateBreakdown(languages: GithubLangaugeStats): LanguageBreakdown[] {
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

        if(totalBytes === 0) {
            return [];
        }

        const breakdown = Object.entries(languages)
            .map(([language, bytes]) => ({
                language,
                bytes,
                percentage: (bytes / totalBytes) * 100,
                color: this.LANGUAGE_COLORS[language] || this.LANGUAGE_COLORS['Default']
            }))
            .sort((a,b) => b.percentage - a.percentage);
        return breakdown;
    }

    static formatBytes(bytes: number): string {
        if(bytes===0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes/Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    static formatPercentage(percentage: number): string {
        return percentage.toFixed(1) + '%';
    }

    static generatePieChartData(breakdown: LanguageBreakdown[]): {
        segments: Array<{
            language: string;
            percentage: number;
            color: string;
            startAngle: number;
            endAngle: number;
            path: string;
        }>;
        center: {x: number; y: number};
        radius: number;
    } {
        const center = {x:100, y:100};
        const radius = 80;
        let currentAngle = -90;

        const segments = breakdown.map(item => {
            const sweepAngle = (item.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sweepAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = center.x + radius * Math.cos(startRad);
            const y1 = center.y + radius * Math.sin(startRad);
            const x2 = center.x + radius * Math.cos(endRad);
            const y2 = center.y + radius * Math.sin(endRad);

            const largeArcFlag = sweepAngle > 180 ? 1 : 0;

            const path = [
                `M ${center.x} ${center.y}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            currentAngle = endAngle;

            return {
                language: item.language,
                percentage: item.percentage,
                color: item.color,
                startAngle,
                endAngle,
                path
            };
        });

        return {segments, center, radius};
    }
}