
import {ConnectionProxy} from "../connection/ConnectionProxy";
import {Onboarding} from "../pages/app/onboarding/Onboarding";
import {INotification} from "./INotification";
import {ViewExitTypes} from "./ViewExitTypes";
import {CoreEntity} from "./CoreEntity";
import {View} from "./View";


// CSS
import "../style/style-sheets/main.scss";


export class ViewManager extends CoreEntity {

    protected currentView: View;
    protected currentViewCtor: any;
    protected previousViewCtor: any;

    protected onboarding: Onboarding;

    protected connection: ConnectionProxy;



    constructor() {
        super( "ViewManager" );

        this.onboarding = new Onboarding();
        this.connection = new ConnectionProxy( this.NAME );

        const vo = this.connection.getVO();

        if ( vo ) {
            this.onboarding.setGuidesDisplayed(
                vo.onboardingGuidesDisplayed
            );
        }


    }



    protected initView(view: any): void {
        this.currentView        = new view();
        this.currentViewCtor    = view;
    }



    protected switchView(view: any, exitType?: string, callback?: Function): void {

        if ( ! view ) return console.error( "Invalid view provided, cannot perform switch." );

        this.onboarding.clearGuides();

        if ( ! exitType ) exitType = ViewExitTypes.DEFAULT;

        this.previousViewCtor = this.currentViewCtor;

        this.currentViewCtor = view;

        this.currentView.exitScene( exitType, () => {

            this.currentView = new view();

            if ( callback ) callback();

        });
    }



    public listNotificationInterests(): any[] {

        let notifications = [];


        notifications.push( "" );


        return notifications;
    }



    public handleNotification(notification: INotification) {

        switch ( notification.name ) {



            default :
                break;
        }

    }

}