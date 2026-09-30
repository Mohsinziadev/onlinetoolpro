import { dedupeNested, phrases, TITLE_NOISE, tokenize } from "@/lib/text/nlp";
import type { ChannelInfo, VideoInfo } from "@/lib/youtube/types";

/**
 * Content gap analysis over recent video titles. Purely descriptive: a topic
 * is a 1–3 word phrase found in titles, and every result lists the exact
 * videos it came from. Nothing is generated or inferred beyond the titles.
 */

export type GapVideo = { id: string; title: string; publishedAt: string; viewCount: number | null };

export type TopicMatch = {
  topic: string;
  /** Comparison channels whose recent titles contain the topic */
  channels: { channelId: string; videos: GapVideo[] }[];
  channelCount: number;
  videoCount: number;
  /** Target titles containing all of the topic's words, but not as a phrase */
  partialInTarget: GapVideo[];
};

export type SharedTopic = { topic: string; targetVideos: number; comparisonVideos: number };

export type ContentGapResult = {
  target: { channel: ChannelInfo; videosAnalyzed: number };
  comparisons: { channel: ChannelInfo; videosAnalyzed: number }[];
  gaps: TopicMatch[];
  shared: SharedTopic[];
};

const toGapVideo = (v: VideoInfo): GapVideo => ({ id: v.id, title: v.title, publishedAt: v.publishedAt, viewCount: v.viewCount });

function titleTopics(title: string): Set<string> {
  const multi = phrases(title, TITLE_NOISE, [2, 3]);
  const single = phrases(title, TITLE_NOISE, [1]).filter((w) => w.length >= 4);
  return new Set([...multi, ...single]);
}

export function findContentGaps(
  target: { channel: ChannelInfo; videos: VideoInfo[] },
  comparisons: { channel: ChannelInfo; videos: VideoInfo[] }[],
): ContentGapResult {
  // Topics present in the target's titles
  const targetTopics = new Map<string, number>();
  const targetTitleWords = target.videos.map((v) => ({ v, words: new Set(tokenize(v.title)) }));
  for (const v of target.videos) for (const t of titleTopics(v.title)) targetTopics.set(t, (targetTopics.get(t) ?? 0) + 1);

  // topic -> channelId -> videos
  const index = new Map<string, Map<string, VideoInfo[]>>();
  for (const { channel, videos } of comparisons) {
    for (const v of videos) {
      for (const t of titleTopics(v.title)) {
        if (!index.has(t)) index.set(t, new Map());
        const byChannel = index.get(t) as Map<string, VideoInfo[]>;
        if (!byChannel.has(channel.id)) byChannel.set(channel.id, []);
        byChannel.get(channel.id)?.push(v);
      }
    }
  }

  const candidates: (TopicMatch & { multiWord: boolean })[] = [];
  const shared: SharedTopic[] = [];
  for (const [topic, byChannel] of index) {
    const videoCount = [...byChannel.values()].reduce((s, vs) => s + vs.length, 0);
    const channelCount = byChannel.size;
    const multiWord = topic.includes(" ");
    // Repeated across channels, or a clear pattern within one channel
    const repeated = multiWord ? videoCount >= 2 && (channelCount >= 2 || videoCount >= 3) : channelCount >= 2 && videoCount >= 3;
    if (!repeated) continue;

    const inTarget = targetTopics.get(topic) ?? 0;
    if (inTarget > 0) {
      shared.push({ topic, targetVideos: inTarget, comparisonVideos: videoCount });
      continue;
    }
    const words = topic.split(" ");
    const partialInTarget = multiWord
      ? targetTitleWords.filter(({ words: w }) => words.every((x) => w.has(x))).map(({ v }) => toGapVideo(v))
      : [];
    candidates.push({
      topic,
      multiWord,
      channelCount,
      videoCount,
      partialInTarget,
      channels: [...byChannel.entries()].map(([channelId, vs]) => ({
        channelId,
        videos: vs.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map(toGapVideo),
      })),
    });
  }

  // Remove shorter topics that are covered by a longer phrase from the same videos.
  const kept = new Set(
    dedupeNested(candidates.map((c) => ({ term: c.topic, count: c.videoCount, examples: [] }))).map((c) => c.term),
  );
  const gaps = candidates
    .filter((c) => kept.has(c.topic))
    .sort((a, b) => b.channelCount - a.channelCount || Number(b.multiWord) - Number(a.multiWord) || b.videoCount - a.videoCount || a.topic.localeCompare(b.topic))
    .slice(0, 30)
    .map((c): TopicMatch => ({
      topic: c.topic,
      channels: c.channels,
      channelCount: c.channelCount,
      videoCount: c.videoCount,
      partialInTarget: c.partialInTarget,
    }));

  return {
    target: { channel: target.channel, videosAnalyzed: target.videos.length },
    comparisons: comparisons.map((c) => ({ channel: c.channel, videosAnalyzed: c.videos.length })),
    gaps,
    shared: dedupeNested(shared.map((s) => ({ term: s.topic, count: s.comparisonVideos, examples: [] })))
      .slice(0, 12)
      .map((d) => shared.find((s) => s.topic === d.term) as SharedTopic),
  };
}
