---
layout: ../../layouts/ProjectLayout.astro
name: "Echo"
short: "Discord application"
desc: "Discord application providing real-time captions for Discord voice calls using a local speech recognition model."

images:
  - url: "0.png"
    alt: "Echo's web UI."
  - url: "1.png"
    alt: "Echo proving transcription in chat."

links:
  - name: "View code (bot)"
    url: "https://github.com/samdev-7/Echo"
  - name: "View code (web UI)"
    url: "https://github.com/samdev-7/EchoWeb"
---

Unlike many services for video & voice calls, [Discord](https://discord.com) doesn't have captions for calls. Not only does it suck when you can't listen in, but it also makes it inaccessible to those who are hard of hearing.

So I built Echo, a Discord bot that provides real-time caption generation for voice calls.

Echo uses [discord.js](https://discord.js.org/), a JavaScript wrapper for Discord's API, to fetch audio data from calls. The audio stream is then fed into [Vosk](https://alphacephei.com/vosk/), a lightweight, offline transcription model to provide captions both in-chat and in a web UI built with [SvelteKit](https://kit.svelte.dev/).

Echo is designed to be lightweight and self-hostable, usable on a Raspberry Pi, lowering the barrier to entry and improving privacy.

_Note_: Echo is a proof-of-concept and is not intended for production use. It is not affiliated with Discord.
