// Mock market prices
export const mockPrices = {
  GOLD: { price: 3342.50, change: 1.24, changeAmt: 40.95 },
  BTC:  { price: 87420.30, change: 2.85, changeAmt: 2421.50 },
  ETH:  { price: 3218.70, change: -0.92, changeAmt: -29.90 },
  USDT: { price: 1.0002, change: 0.01, changeAmt: 0.0001 },
};

// Mock portfolio data
export const mockPortfolio = {
  totalValue: 24650.80,
  change24h: 3.42,
  changeAmt: 814.50,
  pnl: 2140.30,
  assets: [
    { asset: 'GOLD',  balance: 5.2,    value: 17381.00, allocation: 70.5 },
    { asset: 'BTC',   balance: 0.0812, value: 7098.50,  allocation: 28.8 },
    { asset: 'ETH',   balance: 0.053,  value: 170.59,   allocation: 0.7  },
    { asset: 'USDT',  balance: 0.71,   value: 0.71,     allocation: 0.0  },
  ],
};

// Mock wallets
export const mockWallets = [
  { asset: 'BTC',  balance: 0.0812, usdValue: 7098.50,  address: 'bc1q...9xf2', color: '#F7931A' },
  { asset: 'ETH',  balance: 0.053,  usdValue: 170.59,   address: '0x4f...3a1b', color: '#627EEA' },
  { asset: 'USDT', balance: 820.71, usdValue: 820.71,   address: 'TJ7x...9mQr', color: '#26A17B' },
  { asset: 'GOLD', balance: 5.2,    usdValue: 17381.00, address: 'Internal vault', color: '#C9A050' },
];

// Mock transactions
export const mockTransactions = [
  { id:'tx1', type:'deposit',    asset:'BTC',  amount:0.05,   usd:4371.00,  status:'completed', date:'2026-03-24 09:12', hash:'0xabc...' },
  { id:'tx2', type:'trade',      asset:'GOLD', amount:2.0,    usd:6685.00,  status:'completed', date:'2026-03-23 15:44', hash:'' },
  { id:'tx3', type:'withdrawal', asset:'USDT', amount:500,    usd:500.00,   status:'pending',   date:'2026-03-22 11:20', hash:'' },
  { id:'tx4', type:'deposit',    asset:'ETH',  amount:0.5,    usd:1609.35,  status:'completed', date:'2026-03-20 08:55', hash:'0xdef...' },
  { id:'tx5', type:'trade',      asset:'BTC',  amount:0.0312, usd:2727.51,  status:'completed', date:'2026-03-19 17:30', hash:'' },
  { id:'tx6', type:'withdrawal', asset:'BTC',  amount:0.01,   usd:874.20,   status:'failed',    date:'2026-03-18 14:02', hash:'' },
];

// Mock open trades
export const mockTrades = [
  { id:'t1', asset:'GOLD', type:'buy', amount:2.0, entryPrice:3300.00, currentPrice:3342.50, pnl:85.00, pnlPct:2.58, opened:'2026-03-20' },
  { id:'t2', asset:'BTC',  type:'buy', amount:0.05,entryPrice:84000.00,currentPrice:87420.30,pnl:171.02,pnlPct:4.07, opened:'2026-03-18' },
  { id:'t3', asset:'ETH',  type:'sell',amount:0.2, entryPrice:3300.00, currentPrice:3218.70, pnl:16.26, pnlPct:2.46, opened:'2026-03-22' },
];

// Mock investment plans
export const mockPlans = [
  {
    id:'p1', name:'Starter', tier:1,
    minAmount:100,  maxAmount:999,
    roiMin:4,  roiMax:7,  duration:30,
    features:['Daily returns','Anytime withdrawal','Email alerts','Basic support'],
    popular: false,
  },
  {
    id:'p2', name:'Balanced', tier:2,
    minAmount:1000, maxAmount:9999,
    roiMin:8,  roiMax:12, duration:60,
    features:['Daily returns','Priority withdrawal','SMS alerts','Dedicated support','Portfolio analytics'],
    popular: true,
  },
  {
    id:'p3', name:'Growth', tier:3,
    minAmount:10000,maxAmount:null,
    roiMin:13, roiMax:18, duration:90,
    features:['Daily returns','Instant withdrawal','24/7 Priority support','Advanced analytics','Personal advisor','API access'],
    popular: false,
  },
];

// Mock chart data (hourly candles, last 30 points)
export function generateChartData(base: number, volatility: number, count = 30) {
  const data = [];
  let price = base;
  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility;
    price = Math.max(price + change, base * 0.85);
    data.push({
      time: new Date(Date.now() - i * 3600000).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000 + 200000),
    });
  }
  return data;
}

export const goldChartData = generateChartData(3342, 15);
export const btcChartData  = generateChartData(87420, 800);
export const ethChartData  = generateChartData(3218, 60);

// Mock FAQ
export const mockFAQ = [
  { q:'How do I deposit funds?', a:'Navigate to the Wallet page, select your preferred asset, and use the generated wallet address to send funds. Crypto deposits are confirmed after 3 network confirmations.' },
  { q:'How long do withdrawals take?', a:'Withdrawals are processed within 24 hours. Manual approval is required for amounts above $10,000 for security purposes.' },
  { q:'Is my investment guaranteed?', a:'No. All investments in financial markets carry risk. Past performance does not guarantee future results. Only invest what you can afford to lose.' },
  { q:'How is gold investment priced?', a:'Gold positions are priced at the live XAU/USD spot rate from our aggregated market feed, updated every second.' },
  { q:'What are the trading fees?', a:'Trading fees are 0.1% per trade. Withdrawal fees vary by asset: BTC 0.0005, ETH 0.003, USDT 1 USDT flat.' },
  { q:'Is 2FA required?', a:'2FA is strongly recommended and required for withdrawals above $500. We support Google Authenticator and SMS.' },
  { q:'How do investment plans work?', a:'You lock a chosen amount for the plan duration. Projected returns are calculated dynamically and credited to your wallet at the end of the term.' },
  { q:'Can I cancel an investment plan early?', a:'Early cancellation is available with a 2% penalty fee. Navigate to Dashboard > Active Investments to request early exit.' },
];

export const faqCategories = ['All','Deposits & Withdrawals','Trading','Security','Investment Plans','Fees'];
