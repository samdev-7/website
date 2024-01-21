import { browser } from '$app/environment';

let url = "https://scrapbook.hackclub.com/api/";
var emojis = undefined;
var fetching_emojis = false;

function timestampToDate(timestamp) {
    let date = new Date(timestamp);

    let month = date.toLocaleDateString(undefined, {month: 'long'});
    let day = date.toLocaleDateString(undefined, {weekday: 'short'});

    return `${day}, ${month} ${date.getDate()}`;
}

function endsWithAny(string, suffixes) {
    return suffixes.some(suffix => string.endsWith(suffix));
}

// Modified code from Scrapbook! https://github.com/hackclub/scrapbook/
const dataDetector = /(<.+?\|?\S+>)|(@\S+)|(`{3}[\S\s]+`{3})|(`[^`]+`)|(_[^_]+_)|(\*[^\*]+\*)|(:[^ .,;`\u2013~!@#$%^&*(){}=\\:"<>?|A-Z]+:)/;

function stripColons(str) {
    const colonIndex = str.indexOf(':')
    if (colonIndex > -1) {
      // :emoji:
      if (colonIndex === str.length - 1) {
        str = str.substring(0, colonIndex)
        return stripColons(str)
      } else {
        str = str.substr(colonIndex + 1)
        return stripColons(str)
      }
    }
    return str
}

function waitForEmoji(resolve, reject) {
    if (emojis === undefined) {
        setTimeout(waitForEmoji, 50, resolve, reject);
    } else {
        resolve(emojis);
    }
}

async function fetchEmoji() {
    if (emojis === undefined && !fetching_emojis) {
        fetching_emojis = true;
        let res = await fetch(url+'emoji');
        if (res.ok) {
            emojis = await res.json();
            return emojis;
        } else {
            return false;
        }
    } else {
        return new Promise(waitForEmoji);
    }

}

async function getEmoji(name) {
    await fetchEmoji();

    let emoji = stripColons(name);
    if (emojis[emoji]?.includes('http')) {
        return emojis[emoji];
    }

}

async function formatText(text) {
	text = await Promise.all(text.split(dataDetector).map(async(chunk, i) => {
        if (chunk?.startsWith(':') && chunk?.endsWith(':')) {
            let emoji = await getEmoji(chunk);
            if (emoji) {
                return `<img loading="lazy" height=1rem class="h-4 align-middle inline" src="${emoji}" alt="${chunk}" />`;
            } else { 
                return ``;
            };
        }
        if (chunk?.startsWith('@') || chunk?.startsWith('<@')) {
            const punct = /([,!:.'"’”]|’s|'s|\))+$/g;
            const username = chunk.replace(/[@<>]/g, '').replace(punct, '');
            return `<a class="hover:underline" href="https://scrapbook.hackclub.com/${username}" target="_blank" rel="noopener">@${username}</a>`;
        }
        if (chunk?.startsWith('<')) {
            const parts = chunk.match(/<(([^\|]+)\|)?([^>]+?)>/);
            const url = parts?.[2] || parts[parts.length - 1];
            const children = parts[parts.length - 1]?.replace(/https?:\/\//, '').replace(/\/$/, '');

            return `<a class="hover:underline" href="${url}" target="_blank" rel="noopener">${children}</a>`;
        }
        if (chunk?.startsWith('```')) {
            return `<pre class="break-words">${chunk.replace(/```/g, '')}</pre>`;
        }
        if (chunk?.startsWith('`')) {
            return `<code class="break-words">${chunk.replace(/`/g, '')}</code>`;
        }
        if (chunk?.startsWith('*')) {
            return `<strong>${chunk.replace(/\*/g, '')}</strong>`;
        }
        if (chunk?.startsWith('_')) {
            return `<i>${chunk.replace(/_/g, '')}</i>`;
        }
        return chunk?.replace(/&amp;/g, '&');
    }));
    text = text.join('');
    text = text.replace(/\n/g, '<br/>');
    return text;
}

async function getEntries() {
    if (!browser) return [];
    let posts = []

    // Thanks! https://github.com/sampoder/website/blob/main/src/routes/index.svelte#L30-L32
    let imgFileTypes = ['jpg', 'jpeg', 'png', 'gif'];

    let res = await fetch(url+'users/sam?max=10');
    if (res.ok) {
        let data = await res.json();
        data.posts = data.posts.slice(0,10);

        await Promise.all(data.posts.map(async(post) => {
            let post_t = {};

            post_t.time = timestampToDate(post.postedAt);
            post_t.text = await formatText(post.text);
            post_t.mux = post.mux;

            let images = [];
            post.attachments.forEach(attachment => {
                if (endsWithAny(attachment, imgFileTypes)) {
                    images.push(attachment);
                }
            });
            post_t.images = images;
            post_t.timestamp = post.timestamp;

            posts.push(post_t);
        }));

        posts = posts.sort((a, b) => {
            return b.timestamp - a.timestamp;
        });

        return posts;
    } else {
        throw new Error(await res.text());
    }
    
}

export default getEntries;
