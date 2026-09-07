import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const key = process.env.BARAVARD_API_KEY;
if (!key) throw new Error('BARAVARD_API_KEY is not configured');

const response = await fetch(`https://api2.baravard.com/api/car/zerolist?key=${encodeURIComponent(key)}`);
if (!response.ok) throw new Error(`Baravard API returned HTTP ${response.status}`);

const payload = await response.json();
const cars = Array.isArray(payload?.cars) ? payload.cars : [];
if (!cars.length) throw new Error('Baravard API returned no cars');

const normalize = value => String(value || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
const makerOf = car => {
  const source = normalize(`${car.CompanyName || ''} ${car.RootBrandName || ''} ${car.Name || ''}`);
  if (/ایران\s*خودرو|IKCO/i.test(source)) return 'ایران خودرو';
  if (/سایپا|SAIPA/i.test(source)) return 'سایپا';
  return '';
};

const rows = cars.map(car => ({
  maker: makerOf(car),
  name: normalize([car.Name, car.SubName].filter(Boolean).join(' ')),
  market: Number(car.Price) || 'ناموجود',
  factory: Number(car.CompanyPrice) || 'نامشخص',
  previous: Number(car.OldDayPrice) || null,
  percent: Number(car.Percent) || 0,
  updatedAt: car.PriceDate || null,
  source: 'برآورد'
})).filter(car => car.maker && car.name);

if (!rows.length) throw new Error('No Iran Khodro or Saipa vehicles were found in the response');

const output = `// بروزرسانی خودکار از API برآورد؛ این فایل را دستی ویرایش نکنید.\nwindow.dailyPrices=${JSON.stringify(rows, null, 2)};\n`;
const outputPath = existsSync('dist/index.html') ? 'dist/daily-prices.js' : 'daily-prices.js';
await writeFile(outputPath, output, 'utf8');
console.log(`Saved ${rows.length} daily prices to ${outputPath}`);
