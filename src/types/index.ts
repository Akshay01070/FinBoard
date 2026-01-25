// Types for the Finance Dashboard

export type DisplayMode = 'card' | 'table' | 'chart';
export type ChartType = 'line' | 'candlestick';
export type ChartInterval = '1D' | '1W' | '1M' | '1Y';
export type Theme = 'light' | 'dark';
export type CardStyle = 'watchlist' | 'market-gainers' | 'financial-data';

export interface FieldConfig {
  path: string;       // JSON path like "data.rates.USD"
  label: string;      // User-defined label
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export interface WidgetLayout {
  w: number;  // width in grid columns (1-12)
  h: number;  // height in grid rows
}

export interface WatchlistItem {
  symbol: string;
  name: string;
}

export interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number;  // in seconds
  displayMode: DisplayMode;
  cardStyle?: CardStyle;            // For card widgets
  chartType?: ChartType;
  chartInterval?: ChartInterval;
  watchlistItems?: WatchlistItem[]; // For watchlist card style
  selectedFields: FieldConfig[];
  position: number;         // Order in the grid
  layout: WidgetLayout;     // Grid size configuration
  lastUpdated?: string;
  isLoading?: boolean;
  error?: string | null;
  cachedData?: unknown;
  providerId?: string;      // Track which provider was used
  endpointId?: string;      // Track which endpoint was used
  endpointParams?: Record<string, string>; // Params for API call
}

export type WidgetConfig = Widget;

export interface DashboardState {
  widgets: Widget[];
  theme: Theme;
  isModalOpen: boolean;
  editingWidgetId: string | null;
}

export interface ApiTestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  fields?: string[];
}

// Flattened field for the field selector
export interface FlattenedField {
  path: string;
  value: unknown;
  type: string;
  isArray: boolean;
}
