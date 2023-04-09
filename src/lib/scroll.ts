import { writable } from 'svelte/store';

export const scroll = writable(0);

export function scrollToAnchor(event: MouseEvent, elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
        event.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

export function nearestAnchor(ids: string[], scroll: number) {
    const anchors = ids.map(id => document.getElementById(id) as HTMLElement).filter(a => a != null);

    if (anchors.length == 0) {
        return null;
    }

    const docViewTop = scroll;

    const anchorTop = anchors.map(a => a.offsetTop);

    const anchorDistances = anchorTop.map(a => Math.abs(a - docViewTop));

    const nearestAnchor = anchorDistances.indexOf(Math.min(...anchorDistances));

    return anchors[nearestAnchor].id;
}
