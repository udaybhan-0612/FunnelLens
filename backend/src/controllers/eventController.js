import Event from "../models/Event.js";

export async function createEvent(req, res, next) {
  try {
    const { session_id, event_type, page_url, timestamp, x, y,
      viewport_width, viewport_height } = req.body;

    if (
      typeof session_id !== "string" ||
      !session_id.trim() ||
      session_id.length > 200
    ) {
      return res.status(400).json({ error: "Valid session_id is required." });
    }

    if (!["page_view", "click"].includes(event_type)) {
      return res.status(400).json({
        error: "event_type must be page_view or click."
      });
    }

    if (typeof page_url !== "string" || page_url.length > 2048) {
      return res.status(400).json({ error: "Valid page_url is required." });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(page_url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      return res.status(400).json({
        error: "page_url must be a valid HTTP or HTTPS URL."
      });
    }

    const eventDate = timestamp === undefined
      ? new Date()
      : new Date(timestamp);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: "Invalid timestamp." });
    }

    const eventData = {
      sessionId: session_id.trim(),
      eventType: event_type,
      pageUrl: parsedUrl.href,
      timestamp: eventDate
    };

    if (event_type === "click") {
      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < 0 ||
        y < 0
      ) {
        return res.status(400).json({
          error: "Click events require non-negative numeric x and y coordinates."
        });
      }

      eventData.click = { x, y };

      if (Number.isFinite(viewport_width) && viewport_width > 0) {
        eventData.click.viewportWidth = viewport_width;
      }

      if (Number.isFinite(viewport_height) && viewport_height > 0) {
        eventData.click.viewportHeight = viewport_height;
      }
    }

    const event = await Event.create(eventData);

    return res.status(201).json({
      message: "Event stored successfully.",
      event: {
        id: event._id,
        session_id: event.sessionId,
        event_type: event.eventType,
        page_url: event.pageUrl,
        timestamp: event.timestamp,
        ...(event.click ? {
          x: event.click.x,
          y: event.click.y
        } : {})
      }
    });
  } catch (error) {
    next(error);
  }
}
