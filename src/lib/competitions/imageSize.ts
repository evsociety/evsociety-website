// Reads pixel dimensions from JPEG, PNG and WebP headers (no image library needed). Stored with
// each upload so pages can reserve the right space and photographs never cause layout shift.

export function imageSize(bytes: Uint8Array): { width: number; height: number } | null {
    const at = (i: number) => bytes[i] ?? 0;
    const u16be = (i: number) => (at(i) << 8) | at(i + 1);
    const u16le = (i: number) => at(i) | (at(i + 1) << 8);
    const u24le = (i: number) => at(i) | (at(i + 1) << 8) | (at(i + 2) << 16);
    const ok = (width: number, height: number) => (width > 0 && height > 0 && width <= 20000 && height <= 20000 ? { width, height } : null);

    // PNG: IHDR is always the first chunk
    if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) {
        const width = ((at(16) << 24) | (at(17) << 16) | (at(18) << 8) | at(19)) >>> 0;
        const height = ((at(20) << 24) | (at(21) << 16) | (at(22) << 8) | at(23)) >>> 0;
        return ok(width, height);
    }
    // JPEG: walk the markers to the first start-of-frame
    if (at(0) === 0xff && at(1) === 0xd8) {
        let i = 2;
        while (i + 9 < bytes.length) {
            if (at(i) !== 0xff) { i += 1; continue; }
            const marker = at(i + 1);
            if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
            const length = u16be(i + 2);
            if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
                return ok(u16be(i + 7), u16be(i + 5));
            }
            i += 2 + length;
        }
        return null;
    }
    // WebP: lossy (VP8), lossless (VP8L) or extended (VP8X)
    if (at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 && at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50) {
        const chunk = String.fromCharCode(at(12), at(13), at(14), at(15));
        if (chunk === 'VP8 ') return ok(u16le(26) & 0x3fff, u16le(28) & 0x3fff);
        if (chunk === 'VP8L') {
            const b = [at(21), at(22), at(23), at(24)];
            return ok(1 + (((b[1] & 0x3f) << 8) | b[0]), 1 + (((b[3] & 0x0f) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6)));
        }
        if (chunk === 'VP8X') return ok(1 + u24le(24), 1 + u24le(27));
    }
    return null;
}
