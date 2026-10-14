import Event from "../models/Event.js";

export async function getSessions(req, res, next) {
  try {
    const sessions = await Event.aggregate([
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: "$sessionId",
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] }
          },
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" }
        }
      },
      { $sort: { lastSeen: -1 } },
      { $limit: 500 },
      {
        $project: {
          _id: 0,
          session_id: "$_id",
          total_events: "$totalEvents",
          page_views: "$pageViews",
          clicks: 1,
          first_seen: "$firstSeen",
          last_seen: "$lastSeen"
        }
      }
    ]);

    res.json({ total: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
}

export async function getSessionEvents(req, res, next) {
  try {
    const sessionId = req.params.sessionId;

    const events = await Event.find({ sessionId })
      .sort({ timestamp: 1, _id: 1 })
      .limit(5000)
      .lean();

    res.json({
      session_id: sessionId,
      total: events.length,
      events: events.map((event) => ({
        id: event._id,
        session_id: event.sessionId,
        event_type: event.eventType,
        page_url: event.pageUrl,
        timestamp: event.timestamp,
        ...(event.click ? {
          x: event.click.x,
          y: event.click.y,
          viewport_width: event.click.viewportWidth,
          viewport_height: event.click.viewportHeight
        } : {})
      }))
    });
  } catch (error) {
    next(error);
  }
}
