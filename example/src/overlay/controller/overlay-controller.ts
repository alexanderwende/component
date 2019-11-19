export interface OverlayController {
    attach (element?: HTMLElement): void;
    detach (): void;
    open (event?: Event): Promise<boolean>;
    close (event?: Event): Promise<boolean>;
    toggle (event?: Event): Promise<boolean>;
}
