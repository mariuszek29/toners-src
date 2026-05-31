exports.handler = async () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL
  const secret = process.env.CRON_SECRET

  if (!siteUrl || !secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'NEXT_PUBLIC_SITE_URL/URL and CRON_SECRET are required' }),
    }
  }

  const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/cron/market-data`, {
    headers: { Authorization: `Bearer ${secret}` },
  })

  return {
    statusCode: response.status,
    body: await response.text(),
  }
}
