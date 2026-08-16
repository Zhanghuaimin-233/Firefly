import { url } from "./url-utils";

// 文章 frontmatter 音频输入（与 content.config.ts 的 PostAudioInput 保持一致）
export type PostAudioInput = {
	url: string;
	name?: string;
	artist?: string;
	cover?: string;
	lrc?: string;
	instrumental?: boolean;
};

// 规范化后的文章音频曲目（url/cover 已解析为可请求地址）
export type PostAudioTrack = {
	name: string;
	artist: string;
	url: string;
	cover?: string;
	lrc?: string;
	instrumental?: boolean;
};

const isFullUrl = (path: string) => /^https?:\/\//.test(path);

const resolveUrl = (path: string) => (isFullUrl(path) ? path : url(path));

// lrc 可能是 URL/本地路径，也可能是内联 LRC 文本；仅对前两者做地址解析
const resolveLrc = (lrc: string) => {
	if (isFullUrl(lrc)) return lrc;
	if (lrc.startsWith("/") || /\.(lrc|txt)(\?|#|$)/i.test(lrc)) return url(lrc);
	return lrc;
};

const fileNameOf = (trackUrl: string) => {
	const clean = trackUrl.split(/[?#]/)[0];
	const last = clean.substring(clean.lastIndexOf("/") + 1);
	let decoded = last;
	try {
		decoded = decodeURIComponent(last);
	} catch {
		// 含非法百分号序列时保留原字符串
	}
	return decoded.replace(/\.[^./]+$/, "") || "未知曲目";
};

// 双模式归一：字符串 → name 取文件名；对象 → 缺省 name 取文件名
export function normalizePostAudio(
	raw: string | PostAudioInput | undefined | null,
): PostAudioTrack | null {
	if (!raw) return null;
	if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const resolved = resolveUrl(trimmed);
		return { name: fileNameOf(resolved), artist: "", url: resolved };
	}
	const trimmedUrl = raw.url?.trim();
	if (!trimmedUrl) return null;
	const resolved = resolveUrl(trimmedUrl);
	return {
		name: raw.name?.trim() || fileNameOf(resolved),
		artist: raw.artist?.trim() || "",
		url: resolved,
		cover: raw.cover?.trim() ? resolveUrl(raw.cover.trim()) : undefined,
		lrc: raw.lrc?.trim() ? resolveLrc(raw.lrc.trim()) : undefined,
		instrumental: raw.instrumental === true,
	};
}
