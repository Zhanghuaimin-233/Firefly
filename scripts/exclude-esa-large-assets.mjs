import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const unsupportedEsaAudio = resolve(
	"dist",
	"assets",
	"music",
	"内海孝彰 - 心想い ～ココロオモイ～ -絆、つないで。こころ、結んで。離別と決意-.flac",
);

await rm(unsupportedEsaAudio, { force: true });
console.log("Removed the oversized FLAC from the ESA deployment artifact.");
