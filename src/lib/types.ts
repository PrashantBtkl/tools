export interface Website {
  name: string;
  url: string;
}

export interface SitemapPage {
  loc: string;
  lastmod?: string;
}

export interface Metrics {
  totalPages: number;
  newPages: number;
  removedPages: number;
  monthlyGrowth: number;
} 