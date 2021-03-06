

import {View} from "./View";





export interface IViewComponent {
    container: HTMLElement;
    view: View;
    getMemory(): any;
    enterScene( enterType?: string): void;
    exitScene( exitType: string, signal?: string  ): void;
}