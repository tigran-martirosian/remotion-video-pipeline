import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);

// Final-delivery quality for TikTok / Reels. Platforms re-encode, so upload a
// high-bitrate master: H.264, near-lossless CRF, BT.709 so warm tones don't shift.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
