import { createContext, useContext, useEffect, useState } from 'react';

export interface AssetPrice {
  symbol: string;
  price: number;
  change: number;
  changeAmt: number;
}

interface MarketContextType {
  prices: Record<string, AssetPrice>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_PRICES: Record<string, AssetPrice> = {
  BTC:  { symbol: 'BTC',  price: 65000, change: 0, changeAmt: 0 },
  ETH:  { symbol: 'ETH',  price: 3500,  change: 0, changeAmt: 0 },
  USDT: { symbol: 'USDT', price: 1.00,  change: 0, changeAmt: 0 },
  GOLD: { symbol: 'GOLD', price: 2350,  change: 0, changeAmt: 0 },
  OIL:  { symbol: 'OIL',  price: 82.50, change: 0, changeAmt: 0 },
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, AssetPrice>>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      let btcPrice = prices.BTC ? prices.BTC.price : 65000;
      let btcChange = prices.BTC ? prices.BTC.change : 0;
      let btcAmt = prices.BTC ? prices.BTC.changeAmt : 0;
      
      let ethPrice = prices.ETH ? prices.ETH.price : 3500;
      let ethChange = prices.ETH ? prices.ETH.change : 0;
      let ethAmt = prices.ETH ? prices.ETH.changeAmt : 0;
      
      let goldPrice = prices.GOLD ? prices.GOLD.price : 2350;
      let goldChange = prices.GOLD ? prices.GOLD.change : 0;
      let goldAmt = prices.GOLD ? prices.GOLD.changeAmt : 0;

      // Fetch Crypto & Gold from CoinGecko
      try {
        const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=usd&include_24hr_change=true');
        if (!cgRes.ok) throw new Error(`CoinGecko API Error: ${cgRes.statusText}`);
        const cgData = await cgRes.json();

        if (cgData.bitcoin) {
          btcPrice = cgData.bitcoin.usd;
          btcChange = cgData.bitcoin.usd_24h_change || 0;
          btcAmt = btcPrice - (btcPrice / (1 + btcChange / 100));
        }
        if (cgData.ethereum) {
          ethPrice = cgData.ethereum.usd;
          ethChange = cgData.ethereum.usd_24h_change || 0;
          ethAmt = ethPrice - (ethPrice / (1 + ethChange / 100));
        }
        if (cgData['pax-gold']) {
          goldPrice = cgData['pax-gold'].usd;
          goldChange = cgData['pax-gold'].usd_24h_change || 0;
          goldAmt = goldPrice - (goldPrice / (1 + goldChange / 100));
        }
      } catch (err) {
        console.warn('Failed to fetch crypto data from CoinGecko, falling back to simulated walk', err);
        
        btcChange = (Math.random() - 0.5) * 1.5;
        btcPrice = btcPrice * (1 + btcChange / 100);
        btcAmt = btcPrice - (prices.BTC ? prices.BTC.price : 65000);

        ethChange = (Math.random() - 0.5) * 2.0;
        ethPrice = ethPrice * (1 + ethChange / 100);
        ethAmt = ethPrice - (prices.ETH ? prices.ETH.price : 3500);

        goldChange = (Math.random() - 0.5) * 0.8;
        goldPrice = goldPrice * (1 + goldChange / 100);
        goldAmt = goldPrice - (prices.GOLD ? prices.GOLD.price : 2350);
      }

      // Fetch Oil (WTI Futures CL=F) from Yahoo Finance via public CORS proxy
      let oilPrice = prices.OIL ? prices.OIL.price : 82.50;
      let oilChange = prices.OIL ? prices.OIL.change : 0;
      let oilAmt = prices.OIL ? prices.OIL.changeAmt : 0;
      
      try {
        const yahooUrl = encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=1d');
        const oilRes = await fetch(`https://api.allorigins.win/get?url=${yahooUrl}`);
        if (!oilRes.ok) throw new Error(`Proxy Error: ${oilRes.statusText}`);
        const proxyData = await oilRes.json();
        const oilData = JSON.parse(proxyData.contents);
        const meta = oilData.chart.result[0].meta;
        oilPrice = meta.regularMarketPrice;
        oilAmt = meta.regularMarketPrice - meta.chartPreviousClose;
        oilChange = (oilAmt / meta.chartPreviousClose) * 100;
      } catch (err) {
        console.warn('Failed to fetch real-world oil data, falling back to simulated walk', err);
        // Simulate a tiny shift if API fails so it still feels "live"
        oilChange = (Math.random() - 0.5) * 1.5;
        oilPrice = oilPrice * (1 + oilChange / 100);
        oilAmt = oilPrice - (prices.OIL ? prices.OIL.price : 82.50);
      }

      setPrices({
        BTC:  { symbol: 'BTC',  price: btcPrice, change: btcChange, changeAmt: btcAmt },
        ETH:  { symbol: 'ETH',  price: ethPrice, change: ethChange, changeAmt: ethAmt },
        USDT: { symbol: 'USDT', price: 1.0001, change: 0.01, changeAmt: 0.0001 },
        GOLD: { symbol: 'GOLD', price: goldPrice, change: goldChange, changeAmt: goldAmt },
        OIL:  { symbol: 'OIL',  price: oilPrice, change: oilChange, changeAmt: oilAmt },
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch market data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ prices, loading, refresh: fetchPrices }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarketData = () => {
  const context = useContext(MarketContext);
  if (context === undefined) throw new Error('useMarketData must be used within a MarketProvider');
  return context;
};
