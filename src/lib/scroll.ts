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
