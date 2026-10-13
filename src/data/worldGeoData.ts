// ============================================================================
// SKANDA GRC — World GeoJSON Dataset for D3 Geographic Heatmaps
// Path: src/data/worldGeoData.ts
//
// Self-contained, lightweight GeoJSON FeatureCollection of world countries
// optimized for fast client-side D3 projection and choropleth rendering.
// ============================================================================

export interface CountryGeoFeature {
  type: 'Feature';
  id: string; // ISO 2-letter or 3-letter code
  properties: {
    name: string;
    iso2: string;
    iso3: string;
    continent: string;
    lat: number;
    lon: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface WorldGeoJSON {
  type: 'FeatureCollection';
  features: CountryGeoFeature[];
}

export const WORLD_GEO_DATA: WorldGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'US',
      properties: { name: 'United States', iso2: 'US', iso3: 'USA', continent: 'North America', lat: 37.09, lon: -95.71 },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [[-124.7, 48.4], [-124.5, 46.3], [-124.2, 43.0], [-124.4, 40.4], [-120.5, 34.5], [-117.2, 32.5], [-114.7, 32.7], [-109.0, 31.3], [-106.5, 31.8], [-103.0, 29.0], [-99.5, 26.0], [-97.1, 26.0], [-94.0, 29.6], [-89.5, 29.0], [-85.0, 29.8], [-81.0, 25.1], [-80.1, 26.8], [-81.3, 30.8], [-75.5, 35.2], [-74.0, 40.5], [-70.0, 41.5], [-67.0, 44.5], [-69.0, 47.4], [-71.0, 45.0], [-75.0, 45.0], [-82.5, 41.5], [-84.5, 46.5], [-89.5, 48.0], [-95.1, 49.4], [-104.0, 49.0], [-114.0, 49.0], [-123.3, 49.0], [-124.7, 48.4]]
          ],
          [
            [[-168.0, 65.5], [-160.0, 71.0], [-141.0, 69.6], [-141.0, 60.3], [-130.3, 54.7], [-135.0, 57.0], [-150.0, 59.0], [-160.0, 56.0], [-168.0, 65.5]]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'CA',
      properties: { name: 'Canada', iso2: 'CA', iso3: 'CAN', continent: 'North America', lat: 56.13, lon: -106.35 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-141.0, 69.6], [-130.0, 70.0], [-120.0, 69.0], [-100.0, 69.0], [-80.0, 62.0], [-64.0, 60.0], [-55.0, 52.0], [-60.0, 46.0], [-67.0, 44.5], [-71.0, 45.0], [-75.0, 45.0], [-82.5, 41.5], [-89.5, 48.0], [-95.1, 49.4], [-123.3, 49.0], [-130.3, 54.7], [-141.0, 60.3], [-141.0, 69.6]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'NL',
      properties: { name: 'Netherlands', iso2: 'NL', iso3: 'NLD', continent: 'Europe', lat: 52.13, lon: 5.29 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[4.0, 51.5], [3.3, 51.4], [4.5, 52.5], [4.7, 53.0], [6.0, 53.5], [7.2, 53.3], [7.0, 52.2], [6.0, 51.2], [5.0, 51.3], [4.0, 51.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'RU',
      properties: { name: 'Russia', iso2: 'RU', iso3: 'RUS', continent: 'Europe/Asia', lat: 61.52, lon: 105.32 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[27.5, 60.0], [30.0, 60.0], [31.5, 65.0], [33.0, 69.0], [40.0, 67.0], [50.0, 68.0], [60.0, 69.0], [70.0, 73.0], [80.0, 73.0], [100.0, 77.0], [120.0, 73.0], [140.0, 72.0], [160.0, 70.0], [170.0, 66.0], [180.0, 65.0], [170.0, 60.0], [160.0, 55.0], [140.0, 50.0], [131.0, 43.0], [120.0, 50.0], [105.0, 50.0], [87.0, 49.0], [70.0, 54.0], [50.0, 51.0], [40.0, 45.0], [38.0, 47.0], [35.0, 52.0], [30.0, 56.0], [27.5, 60.0]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'CN',
      properties: { name: 'China', iso2: 'CN', iso3: 'CHN', continent: 'Asia', lat: 35.86, lon: 104.2 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[73.5, 39.5], [76.0, 36.0], [80.0, 31.0], [89.0, 27.5], [97.5, 28.0], [100.0, 21.5], [105.0, 21.5], [108.5, 21.5], [116.5, 23.5], [121.5, 31.0], [120.0, 38.0], [124.0, 40.0], [130.5, 42.5], [131.0, 45.0], [125.0, 53.0], [116.5, 49.5], [111.5, 45.0], [97.0, 42.5], [87.0, 49.0], [80.0, 45.0], [73.5, 39.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'DE',
      properties: { name: 'Germany', iso2: 'DE', iso3: 'DEU', continent: 'Europe', lat: 51.17, lon: 10.45 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[6.0, 50.5], [6.0, 51.8], [7.0, 53.5], [8.5, 55.0], [10.0, 54.5], [14.0, 54.0], [15.0, 51.0], [13.0, 50.2], [13.5, 48.8], [12.0, 47.5], [9.5, 47.5], [7.5, 47.6], [7.5, 49.0], [6.0, 50.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'GB',
      properties: { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', continent: 'Europe', lat: 55.38, lon: -3.44 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-5.0, 50.0], [-5.7, 50.2], [-4.5, 52.0], [-4.5, 54.5], [-5.0, 56.5], [-5.0, 58.5], [-3.0, 58.5], [-1.8, 57.5], [-0.5, 54.0], [1.5, 52.5], [1.4, 51.2], [-1.0, 50.7], [-5.0, 50.0]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'FR',
      properties: { name: 'France', iso2: 'FR', iso3: 'FRA', continent: 'Europe', lat: 46.23, lon: 2.21 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-1.8, 43.4], [-1.5, 46.0], [-4.8, 48.4], [-1.5, 49.5], [1.5, 51.0], [2.5, 51.0], [6.0, 49.5], [7.5, 49.0], [7.5, 47.6], [6.8, 45.8], [7.5, 43.7], [3.1, 42.4], [1.8, 42.5], [-1.8, 43.4]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'SG',
      properties: { name: 'Singapore', iso2: 'SG', iso3: 'SGP', continent: 'Asia', lat: 1.35, lon: 103.82 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[103.6, 1.2], [103.6, 1.45], [104.05, 1.45], [104.05, 1.2], [103.6, 1.2]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'SC',
      properties: { name: 'Seychelles', iso2: 'SC', iso3: 'SYC', continent: 'Africa', lat: -4.68, lon: 55.49 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[55.2, -4.8], [55.2, -4.5], [55.8, -4.5], [55.8, -4.8], [55.2, -4.8]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PA',
      properties: { name: 'Panama', iso2: 'PA', iso3: 'PAN', continent: 'Americas', lat: 8.54, lon: -80.78 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-82.9, 8.3], [-82.9, 9.5], [-79.0, 9.5], [-77.2, 8.3], [-78.2, 7.5], [-81.0, 7.5], [-82.9, 8.3]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'KY',
      properties: { name: 'Cayman Islands', iso2: 'KY', iso3: 'CYM', continent: 'Americas', lat: 19.31, lon: -81.25 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-81.45, 19.2], [-81.45, 19.45], [-81.0, 19.45], [-81.0, 19.2], [-81.45, 19.2]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'RO',
      properties: { name: 'Romania', iso2: 'RO', iso3: 'ROU', continent: 'Europe', lat: 45.94, lon: 24.97 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[20.3, 46.2], [22.8, 48.0], [26.5, 48.2], [28.2, 46.0], [29.7, 45.3], [28.6, 43.7], [22.7, 44.2], [21.4, 45.0], [20.3, 46.2]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'UA',
      properties: { name: 'Ukraine', iso2: 'UA', iso3: 'UKR', continent: 'Europe', lat: 48.38, lon: 31.17 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[22.2, 48.5], [24.0, 50.5], [26.0, 51.8], [31.5, 52.4], [38.0, 50.0], [40.2, 49.3], [37.5, 47.0], [35.0, 46.5], [33.5, 45.0], [30.0, 46.0], [28.2, 46.0], [26.5, 48.2], [22.2, 48.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'IN',
      properties: { name: 'India', iso2: 'IN', iso3: 'IND', continent: 'Asia', lat: 20.59, lon: 78.96 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[68.2, 23.5], [71.0, 24.5], [70.5, 27.0], [74.0, 30.5], [74.5, 34.5], [77.5, 35.5], [80.5, 31.0], [88.5, 27.5], [97.0, 28.0], [92.0, 22.0], [88.5, 22.0], [83.0, 18.0], [80.0, 13.0], [77.5, 8.0], [75.5, 12.0], [73.0, 19.0], [68.2, 23.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'BR',
      properties: { name: 'Brazil', iso2: 'BR', iso3: 'BRA', continent: 'South America', lat: -14.24, lon: -51.93 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-51.0, 4.0], [-44.0, -2.5], [-35.0, -5.5], [-37.5, -12.0], [-41.0, -22.0], [-48.0, -26.0], [-53.0, -33.5], [-57.5, -30.0], [-58.0, -22.0], [-60.0, -10.0], [-70.0, -10.0], [-73.5, -7.5], [-67.0, 1.5], [-60.0, 5.0], [-51.0, 4.0]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'AU',
      properties: { name: 'Australia', iso2: 'AU', iso3: 'AUS', continent: 'Oceania', lat: -25.27, lon: 133.78 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[114.0, -22.0], [121.5, -18.5], [130.0, -12.0], [136.0, -12.0], [142.0, -10.5], [148.0, -20.0], [153.5, -28.0], [150.0, -37.5], [140.0, -38.0], [130.0, -32.0], [115.0, -34.5], [113.0, -26.0], [114.0, -22.0]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'ZA',
      properties: { name: 'South Africa', iso2: 'ZA', iso3: 'ZAF', continent: 'Africa', lat: -30.56, lon: 22.94 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[16.5, -28.5], [20.0, -22.0], [30.0, -22.0], [32.8, -26.0], [31.0, -30.0], [26.0, -34.0], [18.5, -34.5], [16.5, -28.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'JP',
      properties: { name: 'Japan', iso2: 'JP', iso3: 'JPN', continent: 'Asia', lat: 36.2, lon: 138.25 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[130.0, 31.5], [132.0, 34.0], [137.0, 35.0], [141.0, 38.0], [141.0, 43.5], [145.5, 44.0], [140.0, 41.5], [136.0, 36.5], [131.0, 34.0], [130.0, 31.5]]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'MX',
      properties: { name: 'Mexico', iso2: 'MX', iso3: 'MEX', continent: 'North America', lat: 23.63, lon: -102.55 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-117.2, 32.5], [-114.7, 32.7], [-109.0, 31.3], [-106.5, 31.8], [-103.0, 29.0], [-99.5, 26.0], [-97.1, 26.0], [-94.0, 18.0], [-90.0, 19.5], [-87.0, 21.5], [-88.0, 18.0], [-92.0, 15.0], [-96.0, 16.0], [-105.0, 20.0], [-110.0, 23.0], [-114.0, 28.0], [-117.2, 32.5]]
        ]
      }
    }
  ]
};

export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  NL: 'Netherlands',
  CN: 'China',
  RU: 'Russia',
  DE: 'Germany',
  GB: 'United Kingdom',
  FR: 'France',
  SG: 'Singapore',
  SC: 'Seychelles',
  PA: 'Panama',
  KY: 'Cayman Islands',
  RO: 'Romania',
  UA: 'Ukraine',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  BR: 'Brazil',
  ZA: 'South Africa',
  JP: 'Japan',
  MX: 'Mexico'
};
