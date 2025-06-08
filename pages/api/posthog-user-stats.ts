// /pages/api/posthog-user-stats.ts

export default async function handler(req, res) {
  const { email } = req.body;

  // Query base per gli script "base" e "refined"
  const baseQuery = {
    kind: 'TrendsQuery',
    source: {
      kind: 'EventsQuery',
      select: ['event'],
      event: 'script_generated',
      properties: [
        { key: 'user_email', value: email },
        { key: 'script_type', value: 'base' }
      ],
      filterTestAccounts: true,
    },
    dateRange: { date_from: '-7d' },
  };

  const refinedQuery = {
    ...baseQuery,
    source: {
      ...baseQuery.source,
      properties: [
        { key: 'user_email', value: email },
        { key: 'script_type', value: 'refined' }
      ],
    }
  };

  const weeklyQuery = {
    kind: 'TrendsQuery',
    interval: 'day',
    source: {
      kind: 'EventsQuery',
      event: 'script_generated',
      select: ['event'],
      properties: [{ key: 'user_email', value: email }],
    },
    dateRange: { date_from: '-7d' },
  };

  try {
    const [baseRes, refinedRes, weeklyRes] = await Promise.all([
      fetch('https://eu.i.posthog.com/api/query/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseQuery),
      }),
      fetch('https://eu.i.posthog.com/api/query/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refinedQuery),
      }),
      fetch('https://eu.i.posthog.com/api/query/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weeklyQuery),
      }),
    ]);

    const baseData = await baseRes.json();
    const refinedData = await refinedRes.json();
    const weeklyDataJson = await weeklyRes.json();

    // Riformattazione dati settimanali
    const weeklyData = (weeklyDataJson?.results?.[0]?.data || []).map((count, i) => ({
      date: weeklyDataJson?.results?.[0]?.labels?.[i],
      count,
    }));

    res.status(200).json({
      base: baseData?.results?.[0]?.data?.[0] || 0,
      refined: refinedData?.results?.[0]?.data?.[0] || 0,
      weeklyData,
    });

  } catch (error) {
    console.error('Errore API PostHog:', error);
    res.status(500).json({ error: 'Errore nel recupero dei dati da PostHog' });
  }
}
