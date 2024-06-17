---
layout: ../../layouts/Project.astro
name: "Echo"
short: "Discord application"

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

ogDesc: "Providing real-time captions for Discord voice calls using a local speech recognition model."
---

Accessibility is crucial to ensure inclusively.

[Discord](https://discord.com) is a popular platform for online events and friend groups, but it's lack of captions in voice calls limits accessibility.

To address this problem, I built Echo, a Discord bot that provides real-time caption generation for voice calls.

Echo uses [discord.js](https://discord.js.org/), a JavaScript wrapper for Discord's API, to get audio data from calls. [Vosk](https://alphacephei.com/vosk/), a lightweight, offline transcription model to provide captions both in-chat and in a web UI built with [SvelteKit](https://kit.svelte.dev/).

Echo is designed to be lightweight and self-hostable while focusing on privacy. It even works on a Raspberry Pi, lowering the barrier to entry.

_Note_: Echo is a proof-of-concept and is not intended for production use. It is not affiliated with Discord.
