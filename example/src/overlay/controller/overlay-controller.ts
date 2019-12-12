export interface OverlayController {
    attach (element?: HTMLElement): void;
    detach (): void;
    open (event?: Event): void;
    close (event?: Event): void;
    toggle (event?: Event, open?: boolean): void;
}
