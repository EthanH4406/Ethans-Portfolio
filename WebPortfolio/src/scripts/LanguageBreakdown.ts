/**
 * Language Breakdown View Component
 * Displays language statistics with bar chart and pie chart
 */

import { LanguageBreakdown } from './PortfolioTypes';
import { LanguageUtils } from './LanguageUtils';

export class LanguageBreakdownView {
    private breakdown: LanguageBreakdown[];
    private element: HTMLElement;

    constructor(breakdown: LanguageBreakdown[]) {
        this.breakdown = breakdown;
        this.element = document.createElement('div');
    }

    /**
     * Render the language breakdown view
     */
    render(): HTMLElement {
        this.element.className = 'language-breakdown-view';

        this.element.innerHTML = `
      <div class="language-stats">
        ${this.renderBarChart()}
      </div>
      <div class="language-pie-chart">
        ${this.renderPieChart()}
      </div>
    `;

        return this.element;
    }

    /**
     * Render bar chart for languages
     */
    private renderBarChart(): string {
        return `
      <div class="language-bars">
        ${this.breakdown.map(lang => `
          <div class="language-bar-item">
            <div class="language-bar-header">
              <span class="language-name">
                <span class="language-dot" style="background-color: ${lang.color}"></span>
                ${this.escapeHtml(lang.language)}
              </span>
              <span class="language-percentage">${LanguageUtils.formatPercentage(lang.percentage)}</span>
            </div>
            <div class="language-bar-track">
              <div class="language-bar-fill" 
                   style="width: ${lang.percentage}%; background-color: ${lang.color}"></div>
            </div>
            <div class="language-bytes">${LanguageUtils.formatBytes(lang.bytes)}</div>
          </div>
        `).join('')}
      </div>
    `;
    }

    /**
     * Render pie chart SVG
     */
    private renderPieChart(): string {
        const chartData = LanguageUtils.generatePieChartData(this.breakdown);

        if (chartData.segments.length === 0) {
            return '<p class="text-muted">No language data available</p>';
        }

        return `
      <div class="pie-chart-wrapper">
        <svg viewBox="0 0 200 200" class="pie-chart-svg">
          ${chartData.segments.map((segment, index) => `
            <path
              d="${segment.path}"
              fill="${segment.color}"
              class="pie-segment"
              data-language="${this.escapeHtml(segment.language)}"
              data-percentage="${LanguageUtils.formatPercentage(segment.percentage)}"
              style="animation-delay: ${index * 50}ms"
            >
              <title>${this.escapeHtml(segment.language)}: ${LanguageUtils.formatPercentage(segment.percentage)}</title>
            </path>
          `).join('')}
        </svg>
        
        <div class="pie-chart-legend">
          ${this.breakdown.slice(0, 5).map(lang => `
            <div class="legend-item">
              <span class="legend-dot" style="background-color: ${lang.color}"></span>
              <span class="legend-label">${this.escapeHtml(lang.language)}</span>
              <span class="legend-value">${LanguageUtils.formatPercentage(lang.percentage)}</span>
            </div>
          `).join('')}
          ${this.breakdown.length > 5 ? `
            <div class="legend-item legend-others">
              <span class="legend-label">+ ${this.breakdown.length - 5} more</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}