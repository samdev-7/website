import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const scroll = writable(0);
let prefersReducedMotion = false;

export function scrollToAnchor(event: MouseEvent, elementId: string) {
    if (browser) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    const element = document.getElementById(elementId);
    if (element) {
        event.preventDefault();

        if (prefersReducedMotion) {
            element.scrollIntoView({ behavior: 'auto' });
        } else {
            element.scrollIntoView({ behavior: 'smooth' });
        }
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
