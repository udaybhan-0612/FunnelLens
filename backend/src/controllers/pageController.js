import Event from "../models/Event.js";

export async function getPages(req, res, next) {
  try {
    const pages = await Event.aggregate([
      {
        $group: {
          _id: "$pageUrl",
          total_events: { $sum: 1 },
          total_clicks: {
            $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] }
          },
          last_seen: { $max: "$timestamp" }
        }
      },
      { $sort: { last_seen: -1 } },
      { $limit: 500 },
      {
        $project: {
          _id: 0,
          page_url: "$_id",
          total_events: 1,
          total_clicks: 1,
          last_seen: 1
        }
      }
    ]);

    res.json({ total: pages.length, pages });
  } catch (error) {
    next(error);
  }
}

export async function getPageClicks(req, res, next) {
  try {
    const pageUrl = req.query.url;

    if (typeof pageUrl !== "string" || !pageUrl.trim()) {
      return res.status(400).json({
        error: "Provide a page URL using the url query parameter."
      });
    }

    const clicks = await Event.find({
      pageUrl,
      eventType: "click",
      "click.x": { $exists: true },
      "click.y": { $exists: true }
    })
      .select("pageUrl timestamp click")
      .sort({ timestamp: -1 })
      .limit(10000)
      .lean();

    res.json({
      page_url: pageUrl,
      total: clicks.length,
      clicks: clicks.map((event) => ({
        x: event.click.x,
        y: event.click.y,
        viewport_width: event.click.viewportWidth,
        viewport_height: event.click.viewportHeight,
        timestamp: event.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
}
