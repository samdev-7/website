---
title: i attached a camera to my window
tags:
  - engineering
description: making of my arducam timelapse system
date: 2026-11-21
thumbnail: /writing/camera-on-window/og.webp
thumbnailAlt: "the view out my window: autumn trees, a lamp post, a brick building and basketball courts"
---

> [!info] this page is best viewed with hdr!
> standard screens will look okay (i tried my best), but if you have a phone that supports it, i'd recommend viewing this with that.

yes, i have a camera attached to my window! the view out my window as of {{live:capture-time}}:

<Figure type="camera-on-window/live" alt="the live view out my window" caption="this is live! (takes ~10 min to process and update)" src="https://now.samliu.dev/cam.jpg" />

it's captured by this little thing!

![the camera mounted on my window](/writing/camera-on-window/01.webp)

## what's the point

i currently live at the university of waterloo's "rev" residence, and compared to the other rooms here, i actually have a pretty good view! it's especially pretty in the morning when the sun rises.

<Figure type="image-grid" alt="the view from the camera on nov 1 at 8:10 am, processed and color graded automatically" caption="from the camera and processed. nov 1, 8:10 am"
  src="figures/01.webp" />

as the seasons change, it would be so cool to be able to have a timelapse! something like this, but for an entire month... 

<Figure type="video" alt="a timelapse of the sunrise on nov 21" loop
  src="figures/02.mp4"
  fallback="figures/03.mp4" />

the camera takes 5 exposures every 200 seconds, archives the raw digital negative, then automatically color grades them! footage at night isn't saved due to storage costs, each group of 5 exposures is 70 mb!

(unfortunately, i have to move out mid-december, so it won't catch the snowfall)
## the hardware!

the camera is an [arducam IMX519 (with autofocus)](https://www.arducam.com/imx519-autofocus-camera-module-for-raspberry-pi-arducam-b0371.html). at $25 usd, it's probably the best camera with an impressive 16MP resolution and pretty good color accuracy. it's not best for video purposes, but for still shots it's awesome at the price. using a csi camera allows me to get the raw sensor data, which allows me to adjust my processing pipeline in the future.

![image from amazon|389](/writing/camera-on-window/02.webp)

image from [amazon](https://www.amazon.ca/dp/B0B3XBQM9Z)

to keep it compact, the camera is hooked up to a raspberry pi zero 2w, which transmits the raw footage off to be processed.

### camera mount

the mount was designed in onshape. i wasn't super sure about the dimensions, so i split it into 3 parts to reduce re-printing. it was printed in pla, but petg would be better to avoid heat deformation from sunlight.

![the camera mount in onshape](/writing/camera-on-window/03.webp)

all 3 sections are connected via a singular m3 screw and a self-aligning pocket. i didn't have threaded inserts, and the entire thing doesn't need to be super strong, so this was more than sufficient.

![the self-aligning pocket that joins the sections](/writing/camera-on-window/04.webp)

i didn't want to pay $15 for a camera housing, so i designed my own with a snap-on cover. tolerances took a few test prints to get right.

![the camera housing with its snap-on cover](/writing/camera-on-window/05.webp)

for secure attachment. my dorm didn't allow drilling holes into my wall... but luckily, my window has this end stop that was pretty useless, and it had 2 mounting holes. so i replaced it...

![the mount screwed into the window end stop](/writing/camera-on-window/06.webp)
## the software
the hardware was pretty straightforward! building the software took me down many rabbit holes. much was learned about image processing.
### capturing and storing the images
we capture 5 frames raw every 200 seconds with fixed focus, auto exposure (with 5 brackets, thus the 5 frames).

the end goal is to render a smooth timelapse, so the pipeline needs to never, ever lose or miss a capture. the entire pipeline is designed around this and to auto recover.

there are 4 devices that make this work:

<Figure type="diagram" alt="the rpi zero 2w hashes each capture and uploads it to the rpi 5, which sends back a verification, compresses it and makes a preview; the rpi 5 uploads archives to the storage box and the preview and heartbeat to the vps; the zero also sends a heartbeat; the vps verifies the archives, serves the preview and sends alerts through a slack webhook" src="figures/04.svg" />

- **rpi zero 2w**: compact enough to sit next to the camera
- **rpi 5**: powerful enough and local to do compression and render low res previews
- **hetzner vps (cpx11)**: most reliable. used for monitoring, and serving data publicly
- **hetzner storage box**: 1tb long term archive for raw footage

both pis send heartbeats to the vps. the two hetzner services cost $11 usd a month.

a slack webhook is used as the monitoring service, since i check slack often and it's super reliable compared to an email or text. a test message is sent every week just to confirm it's still working.

upon capture, we hash the footage using sha-256. when footage is transferred, we always verify the hash on the recipient before deleting the original. when there's enough storage, we retain the original for a while just in case.

<Figure type="diagram" alt="where copies of one capture exist over its first day; each is deleted only after a later copy has been proven" src="figures/05.svg" />

the rpi zero 2w is the most important device since it does the capturing. checks are in place for captures, memory, network, and a hardware watchdog will reboot in case of a total freeze. the rpi 5 is the gateway to the storage box, so it also has checks to make sure everything runs.

raw footage is a lot of data even after compression, and there's only 1tb to store it. since the night is pretty boring, we only save captures from nautical dawn to nautical dusk. at around 15gb a day post-compression, 1tb stores around 2 months.

### image processing
i originally thought this was going to be super easy. i want the footage to look as close to real life as i can. i don't really process photos from my phone and they look pretty good already... this can't be that hard.

here's a comparison. left is straight out of the camera with defaults, and right is my processing pipeline.

<Figure type="video" alt="the nov 21 sunrise straight out of the camera beside the same footage through my pipeline" caption="nov 21, 6:16 am → 10:56 am" loop
  src="figures/06.mp4 | figures/07.mp4"
  labels="straight out of the camera | my pipeline" />

the camera's honestly pretty good already for $25, but there was a vignette, the colors were dull, the color balance was too blue and flickered, it was super dark at night, overexposed at dawn, amongst other issues.

here's a closer look with one frame

<Figure type="slide-comparison" alt="one frame straight out of the camera compared with the same frame through my pipeline" caption="nov 21, 7:50 am"
  src="figures/08.jpg | figures/09.jpg"
  labels="straight out of the camera | my pipeline" />

#### 1. dynamic range

<Figure type="progress-strip" alt="the processing steps so far, up to merged" active="2"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

the camera struggles with high contrast scenes. at times of the day we lose detail as the sensor blows out super bright highlights and crushes dark shadows. the data is lost so there's no way to recover the detail. 

<Figure type="image-grid" alt="a single exposure with its blown out sky in red and crushed shadows in blue" caption="nov 1, 6:40 am" size="half" legend="red: blown out | blue: crushed"
  src="figures/19.jpg" />

a common solution is to take many frames at varying levels of exposure.

<Figure type="image-grid" alt="the five exposures of one capture, from -4 ev to +4 ev" caption="nov 21, 7:20 am" cols="5" phone="3"
  src="figures/20.jpg | figures/21.jpg | figures/22.jpg | figures/23.jpg | figures/24.jpg"
  labels="−4 EV · 1/637 s | −2 EV · 1/158 s | 0 EV · 1/39 s · auto | +2 EV · 1/10 s | +4 EV · 0.41 s" />

after combining them the image might feel flatter or darker, but you'll be able to see more detail. we need to further color grade to bring back the contrast and color that we want.

<Figure type="slide-comparison" alt="one exposure compared with all five exposures combined" caption="nov 1, 6:40 am"
  src="figures/25.jpg | figures/26.jpg"
  labels="one exposure | combined" />

we merge these 5 exposures by giving each pixel a trust value. a pixel is more trusted when the pixel isn't too dark or blown out. we then combine pixels weighted by their trust.

<Figure type="image-grid" alt="how much each of the five exposures counts in the final picture, white where it carries the pixel" caption="pixels used in the final picture. nov 21, 7:20 am" columns="−4 EV | −2 EV | 0 EV | +2 EV | +4 EV" phone="5"
  src="figures/27.jpg | figures/28.jpg | figures/29.jpg | figures/30.jpg | figures/31.jpg" />

you can see that for the sky, more of the darker exposures are used since they aren't blown out there, and for the dark shadows, we use the brighter exposure more. 

using exposure bracketing also gives us enough range for our final result to be HDR, we'll touch on this later.
#### 2. vignette

<Figure type="progress-strip" alt="the processing steps so far, up to vignette" active="3"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

without correction, edges of an image look darker since less light physically hits the sensor there. a quick fix is to point the camera at a uniform, white sheet of paper, and try to undo the vignette by brightening up the edges.

<Figure type="slide-comparison" alt="the frame before and after vignette correction" caption="nov 21, 7:50 am"
  src="figures/32.jpg | figures/33.jpg"
  labels="before | after" />



<Figure type="slide-comparison" alt="a clear sky before and after vignette correction, darker in the top corners before" caption="look at the top-right corner. nov 1, 11:07 am"
  src="figures/34.jpg | figures/35.jpg"
  labels="before | after" />

on the before, if you look at the sky, you can see it's slightly darker towards the right corner. we can actually visualize how much correction we're applying. here's the green channel

<Figure type="image-grid" alt="the green channel vignette correction, 1x in the middle rising to 4x in the corners" caption="green channel correction" size="half" ramp="1× | #1a1a4d #265990 #26998c #8ccc4d #fce633 | 4×"
  src="figures/36.jpg" />

we see a slightly redder-shift in the image's color. the vignette correction is applied differently for different color channels. we'll correct this later.
#### 3. color speckle

<Figure type="progress-strip" alt="the processing steps so far, up to speckle" active="4"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

the sensor's built in color filter introduces some artifacts, especially around bright edges. a chroma noise reduction throws out outlier colors and fixes it.

<Figure type="slide-comparison" alt="color speckle on branches and on a distant lamp, before and after chroma noise reduction" pixel columns="6× zoom. nov 1, 6:40 am | 6× zoom. nov 21, 6:40 am" phone="2"
  src="figures/37.png | figures/38.png | figures/39.png | figures/40.png"
  labels="before | after | before | after" />

do note that this isn't chromatic aberration!
#### 4. white balance

<Figure type="progress-strip" alt="the processing steps so far, up to white balance" active="5"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

the camera's built-in white balance is okay, but it still gets it wrong pretty often. we can apply a technique known as grey-pixel, which finds places where the texture is color-neutral and tries to balance them.

<Figure type="image-grid" alt="the pixels grey-pixel picked as neutral, marked in red" caption="nov 1, 9:00 am" size="half"
  src="figures/41.jpg" />

compared to the camera's guess, which we've used so far, it's more true to eye.

<Figure type="slide-comparison" alt="the camera's white balance compared with grey-pixel on three different frames" columns="nov 21, 8:26 am | nov 1, 11:07 am | nov 1, 9:00 am"
  src="figures/42.jpg | figures/43.jpg | figures/44.jpg | figures/45.jpg | figures/46.jpg | figures/47.jpg"
  labels="camera auto | grey-pixel | camera auto | grey-pixel | camera auto | grey-pixel" />

built-in white balance also doesn't care how the scene changes, so it will jump around. we apply some smoothing along the use of grey-pixel correction to help compensate.

<Figure type="video" alt="the camera's white balance jumping between frames beside smoothed grey-pixel, on the basketball court" caption="zoomed on the court. nov 21, 9:13 am → 9:50 am" loop
  src="figures/48.mp4 | figures/49.mp4"
  labels="before | grey-pixel, smoothed" />

here's what we get after white balance correction! notice the redder-shift from the vignette step is gone.

<Figure type="slide-comparison" alt="the frame with the camera's white balance and with grey-pixel" caption="nov 21, 7:50 am"
  src="figures/50.jpg | figures/51.jpg"
  labels="camera auto | grey-pixel" />

#### 5. exposure

<Figure type="progress-strip" alt="the processing steps so far, up to exposure" active="6"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

auto exposure makes every frame the same brightness, in the evening the image would feel bright and it's hard to tell the time of day. in a timelapse the relative darkness is also messed up and we lose the sense of the sky getting darker.

measuring how bright noon is allows us to anchor all frames, but it's a bit too extreme and makes the nights too dark, so we combine both techniques.

<Figure type="video" alt="a morning timelapse with auto exposure beside our exposure method" caption="nov 21, 6:16 am → 10:56 am" loop
  src="figures/52.mp4 | figures/53.mp4"
  labels="auto exposure | our method" />



<Figure type="image-grid" alt="five times of the morning with auto exposure and with our exposure method" columns="6:40 am | 7:20 am | 8:26 am | 9:33 am | 10:56 am" phone="5" rows="auto exposure | our method"
  src="figures/54.jpg | figures/55.jpg | figures/56.jpg | figures/57.jpg | figures/58.jpg | figures/59.jpg | figures/60.jpg | figures/61.jpg | figures/62.jpg | figures/63.jpg" />

our image becomes darker, since it's in the early morning.

<Figure type="slide-comparison" alt="the frame with auto exposure and with our exposure method" caption="nov 21, 7:50 am"
  src="figures/51.jpg | figures/64.jpg"
  labels="auto exposure | our method" />

#### 6. color grading

<Figure type="progress-strip" alt="the processing steps so far, up to hdr grade" active="7"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

right now our image looks flat and washed out, since we've prioritized preserving detail while getting the basics right. color grading brings the contrast and coloring back, and to take advantage of the extra brightness in hdr.

<Figure type="slide-comparison" alt="the frame before and after color grading" caption="nov 21, 7:50 am"
  src="figures/64.jpg | figures/65.jpg"
  labels="before | graded" />

flat dusk is naturally pretty dull and low in contrast, so i added a shadow floor which deepens shadows in flatter frames

<Figure type="slide-comparison" alt="the frame with the shadow floor off and on" caption="nov 21, 7:50 am"
  src="figures/66.jpg | figures/67.jpg"
  labels="floor off | floor on" />

this step took hours to get right, and it was so painfully slow since i needed to make sure it looked good at varying times of the day and lighting conditions.

if you have an hdr display, you'll see a difference, otherwise, it'll just be the same image.

<Figure type="image-grid" alt="the same frame in hdr and sdr" caption="nov 21, 7:50 am" cols="2"
  src="figures/68.avif | figures/69.jpg"
  labels="hdr | sdr"
  fallback="figures/69.jpg | " />

#### 7. hdr to sdr

<Figure type="progress-strip" alt="the processing steps so far, up to sdr grade" active="8"
  src="figures/10.jpg | figures/11.jpg | figures/12.jpg | figures/13.jpg | figures/14.jpg | figures/15.jpg | figures/16.avif | figures/18.jpg" labels="one photo | merged | vignette | speckle | white balance | exposure | hdr grade | sdr grade"
  fallback=" |  |  |  |  |  | figures/17.jpg | " />

so far we've been working with hdr images, but most displays are sdr and by default, it looks pretty inconsistent across displays since by default each one does conversion differently.

<Figure type="slide-comparison" alt="the hdr frame through a standard sdr conversion and through my tuning" caption="nov 21, 7:50 am"
  src="figures/70.jpg | figures/71.jpg"
  labels="standard conversion | my tuning" />

youtube's default also looks pretty bad...

here's my lut compared to youtube's, it's quite different.

<Figure type="slide-comparison" alt="youtube's sdr conversion compared with my lut, at dusk and at night" caption="oct 31, 5:43 pm and 7:06 pm" phone="2"
  src="figures/72.jpg | figures/73.jpg | figures/74.jpg | figures/75.jpg"
  labels="youtube's conversion | with my lut | youtube's conversion | with my lut" />

### fun bugs along the way...

#### magenta lamps
areas overexposed even in the lowest exposure ended up to be magenta. no frames were trustworthy, so the merger just guessed.

<Figure type="slide-comparison" alt="a blown out lamp core turning magenta before the fix and white after it" caption="3× zoom. nov 21, 6:40 am" size="half"
  src="figures/76.jpg | figures/77.jpg"
  labels="before | after" />

#### pale sky
when a sky is too bright, we only dimmed the bright channel instead of all, causing blue to be lost in the sky.

<Figure type="slide-comparison" alt="a bright sky that lost its blue before the fix and keeps it after" caption="nov 21, 8:26 am"
  src="figures/78.jpg | figures/79.jpg"
  labels="before | after" />

#### leaves messing with white balance
in certain lighting conditions the grey-pixel treated yellow leaves as neutral grays. they're now ignored when it doesn't make sense.

<Figure type="slide-comparison" alt="white balance thrown off by sunlit leaves before the fix and correct after it" caption="nov 1, 4:10 pm"
  src="figures/80.jpg | figures/81.jpg"
  labels="before | after" />

