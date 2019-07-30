

import {HTMLHelper} from "../../../../helpers/HTMLHelper";
import {GuideSwitchType} from "../GuideSwitchType";
import {Onboarding} from "../Onboarding";
import {Guides} from "../Guides";
import {Guide} from "./Guide";

import TweenLite = gsap.TweenLite;

const template = require( "../../../../templates/onboarding-tip-impediment-checkbox.html" );





export class TipImpedimentCheckbox extends Guide {
    private target: HTMLElement;

    private closeBtn: HTMLElement;
    private nextBtn: HTMLElement;
    private skipBtn: HTMLElement;

    private guide: HTMLElement;



    constructor(parent: Onboarding) {
        super( parent, Guides.TIP_IMPEDIMENT_CHECKBOX, template );

        this.guide              = this.container.firstElementChild as HTMLElement;

        this.target             = document.querySelector( "#scrum-notes-impediment-checkbox-container" ) as HTMLElement;

        this.closeBtn           = this.container.querySelector( ".onboarding-close-btn" ) as HTMLElement;
        this.nextBtn            = this.container.querySelector( ".guide-primary-btn" ) as HTMLElement;
        this.skipBtn            = this.container.querySelector( ".skip-link-btn" ) as HTMLElement;

        this.actionListener     = this.actionListener.bind( this );


        this.enterScene();
    }



    private registerEventListeners(): void {
        this.container.addEventListener( "click", this.actionListener );
    }



    private unregisterEventListeners(): void {
        this.container.removeEventListener( "click", this.actionListener );
    }



    private actionListener(e: any): void {

        switch ( e.target.className ) {

            case this.closeBtn.className :
                this.exitScene( GuideSwitchType.NEXT );
                break;

            case this.nextBtn.className :
                this.exitScene( GuideSwitchType.NEXT );
                break;

            case this.skipBtn.className :
                this.exitScene();
                break;

            default :
                break;
        }
    }



    private setPosition(): void {

        if ( ! this.target ) return;

        const position      = HTMLHelper.getOffset( this.target );

        const offsetX       = this.guide.clientHeight / 2 + 75;
        const offsetY       = this.guide.clientHeight + 50;

        this.guide.style.left   = `${ position.left - offsetX }px`;
        this.guide.style.top    = `${ position.top - offsetY }px`;
    }



    protected enterScene(): void {
        super.enterScene();
        this.setPosition();
        this.registerEventListeners();

        TweenLite.from( this.guide,
            0.5,
            {
                top: this.guide.getBoundingClientRect().top + 20
            });

        TweenLite.to( this.guide, 0.4,{ opacity: 1 } );
    }



    public exitScene(switchType?: GuideSwitchType): void {

        TweenLite.to( this.guide, 0.2,{ opacity: 0, onComplete: () => {
            this.unregisterEventListeners();
            super.exitScene( switchType );
        }});
    }

}
