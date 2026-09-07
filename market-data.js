(function () {
  const config = window.KHODROCHANDE_MARKET || {};

  function cleanRow(row) {
    return {
      maker: String(row.maker || row.company || '').trim(),
      name: String(row.name || row.title || row.car || '').trim(),
      market: typeof row.market === 'number' ? row.market : row.market_price,
      factory: typeof row.factory === 'number' ? row.factory : (row.factory_price || 'نامشخص'),
      updatedAt: row.updatedAt || row.updated_at || null
    };
  }

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeout || 8000);
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  window.loadMarketPrices = async function () {
    if (!config.endpoint) return { rows: window.dailyPrices || [], live: false, updatedAt: null };
    try {
      const payload = await fetchWithTimeout(config.endpoint);
      const sourceRows = Array.isArray(payload) ? payload : (payload.prices || payload.data || []);
      const rows = sourceRows.map(cleanRow).filter(row => row.maker && row.name);
      if (!rows.length) throw new Error('empty market response');
      return { rows, live: true, updatedAt: payload.updatedAt || payload.updated_at || rows[0].updatedAt };
    } catch (error) {
      console.warn('Market API unavailable; using the latest saved prices.', error);
      return { rows: window.dailyPrices || [], live: false, updatedAt: null };
    }
  };
})();
